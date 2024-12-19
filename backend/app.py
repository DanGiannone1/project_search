# backend/app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from typing import List, Literal
import os
import hashlib
from dotenv import load_dotenv
import base64
import json
import requests
from pydantic import BaseModel
from langchain_openai import AzureChatOpenAI
from azure.communication.email import EmailClient
from projects import search_projects, add_project
from cosmosdb import CosmosDBManager
from azure.identity import DefaultAzureCredential
import logging
from applicationinsights.flask.ext import AppInsights



# Initialize EmailClient
acs_conn_str = os.getenv("COMMUNICATION_SERVICES_CONNECTION_STRING")
email_client = EmailClient.from_connection_string(acs_conn_str)


logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

logger.info("Logging in via DefaultAzureCredential...")
logger = logging.getLogger('azure.identity')

try:
    credential = DefaultAzureCredential(logging_enable=True)
    logger.info("Successfully authenticated via DefaultAzureCredential")
except:
    raise Exception("Failed to authenticate via DefaultAzureCredential")        


import getpass
user = getpass.getuser()
logger.info(f"User: {user}")


COSMOS_DATABASE_ID = "codewith_project_search"
COSMOS_CONTAINER_ID = "project_container_test"

cosmos_db = None

try:
    logger.info("Initializing CosmosDB connection...")
    cosmos_db = CosmosDBManager(
        cosmos_database_id=COSMOS_DATABASE_ID,
        cosmos_container_id=COSMOS_CONTAINER_ID
    )
    logger.info("CosmosDB connection initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize CosmosDB connection: {str(e)}")

app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)  # Enable CORS

# Load environment variables from .env file
load_dotenv()



app.config['APPINSIGHTS_INSTRUMENTATIONKEY'] = os.getenv("APPINSIGHTS_INSTRUMENTATIONKEY")
appinsights = AppInsights(app)


# Azure OpenAI configuration
AOAI_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AOAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AOAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")



primary_llm = AzureChatOpenAI(
    azure_deployment=AOAI_DEPLOYMENT,
    api_version="2024-08-01-preview",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    api_key=AOAI_KEY,
    azure_endpoint=AOAI_ENDPOINT
)

class ExtractionResponse(BaseModel):
    """Schema for parsing project details"""
    project_name: str
    project_description: str
    programming_languages: List[str]
    frameworks: List[str]
    azure_services: List[str]
    design_patterns: List[str]
    project_type: Literal['Educational/Demo', 'Accelerator']  # Modified
    code_complexity: Literal['Beginner', 'Intermediate', 'Advanced']
    business_value: str
    target_audience: str
    Industries: List[str]



# ----------------------------
# Helper Functions
# ----------------------------

def generate_document_id(github_url: str) -> str:
    """Generate a unique, deterministic ID for a document."""
    unique_string = f"{github_url}"  # Use the GitHub URL for uniqueness
    return hashlib.md5(unique_string.encode()).hexdigest()




def fetch_readme(github_url: str) -> str:
    """Fetch the README.md content from a public GitHub repository."""
    try:
        # Extract owner and repo name from the GitHub URL
        parts = github_url.rstrip('/').split('/')
        owner, repo = parts[-2], parts[-1]

        # Construct the raw README URL
        raw_url = f'https://raw.githubusercontent.com/{owner}/{repo}/main/README.md'

        # Try fetching the README from the 'main' branch
        response = requests.get(raw_url)
        if response.status_code != 200:
            # If not found, try the 'master' branch
            raw_url = f'https://raw.githubusercontent.com/{owner}/{repo}/master/README.md'
            response = requests.get(raw_url)

        if response.status_code == 200:
            readme_content = response.text
            return readme_content
        else:
            print("README.md not found in the repository.")
            return ""

    except Exception as e:
        print(f"Error fetching README.md: {e}")
        return ""

def process_readme(readme_content: str) -> ExtractionResponse:
    """Process the README content using LLM to extract project information."""
    try:
        # Prepare messages for the LLM
        review_prompt = """Your job is to review a codebase and provide a report on it.

- Project Name
- Project Description
- Programming languages: C#, Python, React, etc.
- Frameworks: Semantic Kernel, Autogen, Langgraph, Langchain, etc.
- Azure Services: Azure OpenAI, Azure Cosmos DB, Azure Data Lake Storage, etc.
- Design Patterns: RAG, single agent, multi-agent, etc.
- Project Type: 'Educational/Demo' or 'Accelerator' (a full fledged application that someone can immediately deploy and start using)
- Code complexity: Beginner, Intermediate, or Advanced.
- Business Value: What is the business value of this codebase?
- Target Audience: Who is the target audience?
- Industries: e.g. professional services, media & entertainment, construction, etc. (can be more than one. If not sure, leave blank. If you think it could apply to all or most industries, output 'all')
"""

        messages = [
            {"role": "system", "content": review_prompt},
            {"role": "user", "content": readme_content}
        ]

        report_llm = primary_llm.with_structured_output(ExtractionResponse)

        report = report_llm.invoke(messages)

        return report

    except Exception as e:
        print(f"Error processing README.md: {e}")
        return None


def get_user_identity(client_principal):
    claims = client_principal.get('claims', [])
    # Try to find the email claim
    for claim in claims:
        if claim.get('typ') == 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress':
            return claim.get('val')
    # Fallback to name claim
    for claim in claims:
        if claim.get('typ') == 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name':
            return claim.get('val')
    # If no claim found, return 'anonymous' or handle accordingly
    return 'anonymous'


def send_email(data: dict) -> bool:
    """Constructs and sends an email containing the project information via Azure Communication Services."""
    try:
        # Extract data from the payload
        project_name = data.get('projectName', 'N/A')
        project_description = data.get('projectDescription', 'No description provided')
        github_url = data.get('githubUrl', 'N/A')
        owner = data.get('owner', 'anonymous')  # New line
        programming_languages = ', '.join(data.get('programmingLanguages', []))
        frameworks = ', '.join(data.get('frameworks', []))
        azure_services = ', '.join(data.get('azureServices', []))
        design_patterns = ', '.join(data.get('designPatterns', []))
        project_type = data.get('projectType', 'N/A')
        code_complexity = data.get('codeComplexity', 'N/A')
        business_value = data.get('businessValue', 'N/A')
        target_audience = data.get('targetAudience', 'N/A')

        # Draft email content
        email_subject = f"Review Request for Project: {project_name}"
        email_plain_text = f"""
Hello,

A new project has been submitted for review. Please find the details below:

**Project Name:** {project_name}
**Owner:** {owner}  # New line
**Description:** {project_description}
**GitHub URL:** {github_url}
**Programming Languages:** {programming_languages}
**Frameworks:** {frameworks}
**Azure Services:** {azure_services}
**Design Patterns:** {design_patterns}
**Project Type:** {project_type}
**Code Complexity Score:** {code_complexity}
**Business Value:** {business_value}
**Target Audience:** {target_audience}

Thank you,
Automated System
"""
    
        email_html = f"""
<html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background-color: #f9f9f9;
                padding: 20px;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background-color: #003087;
                padding: 10px;
                border-radius: 8px 8px 0 0;
                color: #ffffff;
            }}
            .content {{
                padding: 20px;
                color: #333333;
            }}
            .footer {{
                padding: 10px;
                color: #666666;
                font-size: 12px;
                text-align: center;
                border-top: 1px solid #eeeeee;
                margin-top: 20px;
            }}
            .details {{
                margin-bottom: 10px;
            }}
            .details strong {{
                display: inline-block;
                width: 200px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>📄 Review Request for Project</h2>
            </div>
            <div class="content">
                <div class="details"><strong>Project Name:</strong> {project_name}</div>
                <div class="details"><strong>Owner:</strong> {owner}</div>  # New line
                <div class="details"><strong>Description:</strong> {project_description}</div>
                <div class="details"><strong>GitHub URL:</strong> <a href="{github_url}">{github_url}</a></div>
                <div class="details"><strong>Programming Languages:</strong> {programming_languages}</div>
                <div class="details"><strong>Frameworks:</strong> {frameworks}</div>
                <div class="details"><strong>Azure Services:</strong> {azure_services}</div>
                <div class="details"><strong>Design Patterns:</strong> {design_patterns}</div>
                <div class="details"><strong>Project Type:</strong> {project_type}</div>
                <div class="details"><strong>Code Complexity Score:</strong> {code_complexity}</div>
                <div class="details"><strong>Business Value:</strong> {business_value}</div>
                <div class="details"><strong>Target Audience:</strong> {target_audience}</div>
            </div>
            <div class="footer">
                This is an automated message. Please do not reply to this email.
            </div>
        </div>
    </body>
</html>
"""
        # Send email logic remains unchanged


        # Fetch recipient email from environment variable
        recipient_email = os.getenv("REVIEWER_EMAIL_GROUP", "dangiannone@microsoft.com")

        # Create EmailMessage
        message = {
            "senderAddress": "DoNotReply@5fec6054-f6e1-4926-9c37-029ca719c8ae.azurecomm.net",
            "recipients": {
                "to": [{"address": recipient_email}]
            },
            "content": {
                "subject": email_subject,
                "plainText": email_plain_text.strip(),
                "html": email_html.strip()
            }
        }

        # Send email
        poller = email_client.begin_send(message)
        result = poller.result()
        print(f"Email sent: {result}")
        return True

    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False


# ----------------------------
# API Routes
# ----------------------------


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # If the path exists in the build folder, serve that file
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # Otherwise, serve the index.html (for React Router)
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/admin/get_pending_reviews', methods=['GET'])
def get_pending_reviews():
    try:
        # Query only pending reviews now
        query = "SELECT * FROM c WHERE c.review_status = 'pending'"
        parameters = []
        pending_reviews = cosmos_db.query_items(query, parameters)
        return jsonify(pending_reviews), 200
    except Exception as e:
        print(f"Error fetching pending reviews: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/get_filter_options', methods=['GET'])
def get_filter_options():
    try:
        # Query only approved projects
        logger.info("fetching_filter_options")
        query = "SELECT * FROM c WHERE c.review_status = 'approved'"
        projects = cosmos_db.query_items(query)

        prog_langs = set()
        frameworks = set()
        azure_services = set()
        design_patterns = set()
        industries = set()
        project_types = set()
        code_complexities = set()

        for p in projects:
            for pl in p.get('programmingLanguages', []):
                prog_langs.add(pl)
            for fw in p.get('frameworks', []):
                frameworks.add(fw)
            for az in p.get('azureServices', []):
                azure_services.add(az)
            for dp in p.get('designPatterns', []):
                design_patterns.add(dp)
            for ind in p.get('industries', []):
                industries.add(ind)
            if 'projectType' in p and p['projectType']:
                project_types.add(p['projectType'])
            if 'codeComplexity' in p and p['codeComplexity']:
                code_complexities.add(p['codeComplexity'])

        return jsonify({
            "programmingLanguages": sorted(list(prog_langs)),
            "frameworks": sorted(list(frameworks)),
            "azureServices": sorted(list(azure_services)),
            "designPatterns": sorted(list(design_patterns)),
            "industries": sorted(list(industries)),
            "projectTypes": sorted(list(project_types)),
            "codeComplexities": sorted(list(code_complexities))  # NEW
        }), 200

    except Exception as e:
        print(f"Error in get_filter_options: {e}")
        logger.error("get_filter_options_failed",
            error=str(e),
            error_type=type(e).__name__
        )
        return jsonify({"error": str(e)}), 500

# Update /api/admin/approve_project endpoint
@app.route('/api/admin/approve_project', methods=['POST'])
def approve_project():
    try:
        data = request.get_json()
        # Set review_status = approved
        data['review_status'] = 'approved'
        data['partitionKey'] = 'project'
        # Update the item in Cosmos
        cosmos_db.upsert_item(data)

        # Add the project to the search index
        result = add_project(data)
        if result.get("success"):
            # No deletion needed since we keep data in Cosmos.
            return jsonify({"message": "Project approved and added to index.", "project": result["project"]}), 200
        else:
            return jsonify({"error": result.get("error", "Failed to add project.")}), 500
    except Exception as e:
        print(f"Error in approve_project: {e}")
        return jsonify({"error": str(e)}), 500

# Update /api/admin/reject_project endpoint
@app.route('/api/admin/reject_project', methods=['POST'])
def reject_project():
    try:
        data = request.get_json()
        # Remove from Cosmos DB
        cosmos_db.delete_item(item_id=data['id'], partition_key='project')
        return jsonify({"message": "Project rejected and removed from pending reviews."}), 200
    except Exception as e:
        print(f"Error in reject_project: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/check_admin', methods=['GET'])
def check_admin():
    try:
        client_principal = request.headers.get('X-MS-CLIENT-PRINCIPAL')
        if client_principal:
            decoded = base64.b64decode(client_principal).decode('utf-8')
            client_principal = json.loads(decoded)
            user_identity = get_user_identity(client_principal)
        else:
            user_identity = 'anonymous'

        admin_emails = os.getenv("ADMIN_EMAILS", "")
        admin_list = [email.strip().lower() for email in admin_emails.split(",") if email.strip()]

        is_admin = user_identity.lower() in admin_list
        return jsonify({"isAdmin": is_admin}), 200
    except Exception as e:
        print(f"Error checking admin status: {str(e)}")
        return jsonify({"isAdmin": False, "error": str(e)}), 500

# NEW CODE START
@app.route('/api/admin/get_approved_tags', methods=['GET'])
def get_approved_tags():
    try:
        query = "SELECT * FROM c WHERE c.id = 'approved_tags' AND c.partitionKey = 'metadata'"
        tags = cosmos_db.query_items(query)
        if tags:
            return jsonify(tags[0]), 200
        else:
            # If not found, return empty structure
            empty_tags = {
                "id": "approved_tags",
                "partitionKey": "metadata",
                "programming_languages": [],
                "frameworks": [],
                "azure_services": {
                    "application": [],
                    "data": [],
                    "ai": []
                },
                "design_patterns": [],
                "industry": []
            }
            return jsonify(empty_tags), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/update_approved_tags', methods=['POST'])
def update_approved_tags():
    try:
        data = request.get_json()
        # Ensure id and partitionKey are set
        data["id"] = "approved_tags"
        data["partitionKey"] = "metadata"
        cosmos_db.upsert_item(data)
        return jsonify({"message": "Approved tags updated successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/search_projects', methods=['POST'])
def search():
    try:

        data = request.get_json()
        query = data.get('query', '')
        filters = data.get('filters', {})
        sort = data.get('sort', '')

        logger.info(f"Search started - Query: {data.get('query')}, Filters: {data.get('filters')}, Sort: {data.get('sort')}")

        print(f"Received search query: {query}")
        print(f"Filters: {filters}")
        print(f"Sort: {sort}")

        if not query.strip():
            return jsonify({"results": [], "message": "Please provide a search query"})

        results = search_projects(query, filters, sort)
        print(f"Found {len(results)} results")
        logger.info(f"Search completed - Found {len(results)} results for query: {query}")

        return jsonify({
            "results": results,
            "message": f"Found {len(results)} matching projects"
        })

    except Exception as e:
        logger.error(f"Search failed - Error: {str(e)}, Input: {data}")
        return jsonify({
            "results": [],
            "error": "An error occurred while searching projects"
        }), 500



@app.route('/api/submit_repo', methods=['POST'])
def submit_repo():
    try:
        data = request.get_json()
        github_url = data.get('githubUrl', '')

        if not github_url.strip():
            return jsonify({"error": "GitHub URL is required"}), 400

        readme_content = fetch_readme(github_url)

        if not readme_content:
            return jsonify({"error": "Failed to fetch README.md from the repository"}), 404

        report = process_readme(readme_content)
        print(report.model_dump_json(indent=2))

        if report:
            # Capture user identity
            client_principal = request.headers.get('X-MS-CLIENT-PRINCIPAL')
            if client_principal:
                decoded = base64.b64decode(client_principal).decode('utf-8')
                client_principal = json.loads(decoded)
                user_identity = get_user_identity(client_principal)
            else:
                user_identity = 'anonymous'

            report_dict = report.model_dump()
            report_dict['owner'] = user_identity

            return jsonify(report_dict), 200
        else:
            return jsonify({"error": "Failed to extract project information"}), 500

    except Exception as e:
        print(f"/submit_repo endpoint error: {str(e)}")
        return jsonify({"error": "An error occurred while processing the repository"}), 500


@app.route('/api/send_for_review', methods=['POST'])
def send_for_review():
    data = request.get_json()
    success = send_email(data)
    if success:
        try:
            data['id'] = generate_document_id(data.get('githubUrl', ''))
            # Instead of partitionKey = 'pending_review', use 'project'
            data['partitionKey'] = 'project'
            data['review_status'] = 'pending'  # NEW
            # Upsert into Cosmos DB
            cosmos_db.upsert_item(data)
            return jsonify({"message": "Review request sent successfully."}), 200
        except Exception as e:
            print(f"Error adding pending review: {e}")
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Failed to send review request."}), 500




if __name__ == '__main__':
    app.run(debug=True, port=5000)
