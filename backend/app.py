# backend/app.py
from fastapi import FastAPI, Request, Response, HTTPException, Depends, Header, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from typing import List, Literal, Dict, Any, Optional, Union
import os
import hashlib
from dotenv import load_dotenv
import base64
import json
import requests
from pydantic import BaseModel, Field
from langchain_openai import AzureChatOpenAI
from azure.communication.email import EmailClient
from projects import search_projects, add_project
from cosmosdb import CosmosDBManager
from azure.identity import DefaultAzureCredential
import logging
import uvicorn

load_dotenv()

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


# Load environment variables from .env file



COSMOS_DATABASE_ID = os.environ["COSMOS_DATABASE_ID"]
COSMOS_CONTAINER_ID = os.environ["COSMOS_CONTAINER_ID"]

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
    raise Exception("Failed to initialize CosmosDB connection")

app = FastAPI(title="Project Search API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Azure OpenAI configuration
AOAI_KEY = os.environ["AOAI_KEY"]
AOAI_ENDPOINT = os.environ["AOAI_ENDPOINT"]
AOAI_DEPLOYMENT = os.environ["AOAI_DEPLOYMENT"]


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
    project_type: Literal['Educational/Demo', 'Accelerator']
    code_complexity: Literal['Beginner', 'Intermediate', 'Advanced']
    business_value: str
    target_audience: str
    Industries: List[str]


class ProjectSubmission(BaseModel):
    githubUrl: str

class ProjectReview(BaseModel):
    projectName: str
    projectDescription: str
    githubUrl: str
    programmingLanguages: List[str] = []
    frameworks: List[str] = []
    azureServices: List[str] = []
    designPatterns: List[str] = []
    projectType: str
    codeComplexity: str
    businessValue: str
    targetAudience: str
    owner: Optional[str] = "anonymous"

class FilterOptions(BaseModel):
    query: Optional[str] = ""
    filters: Optional[Dict[str, Any]] = {}
    sort: Optional[str] = ""

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
        owner = data.get('owner', 'anonymous')
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
**Owner:** {owner}
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
                <div class="details"><strong>Owner:</strong> {owner}</div>
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

# Mount static files for frontend
app.mount("/static", StaticFiles(directory="dist/assets"), name="static")

@app.get("/api/admin/get_pending_reviews")
async def get_pending_reviews():
    try:
        query = "SELECT * FROM c WHERE c.review_status = 'pending' AND c.partitionKey = 'project'"
        parameters = []
        pending_reviews = cosmos_db.query_items(query, parameters)
        return pending_reviews
    except Exception as e:
        print(f"Error fetching pending reviews: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/get_filter_options")
async def get_filter_options():
    try:
        logger.info("fetching_filter_options")
        
        # Get approved tags and service mapping
        approved_tags_query = "SELECT * FROM c WHERE c.id = 'approved_tags' AND c.partitionKey = 'metadata'"
        approved_tags_results = list(cosmos_db.query_items(approved_tags_query))
        approved_tags = approved_tags_results[0] if approved_tags_results else {}
        
        # Query approved projects
        projects_query = "SELECT * FROM c WHERE c.review_status = 'approved'"
        projects = cosmos_db.query_items(projects_query)

        # Initialize sets for collecting distinct values
        prog_langs = set()
        frameworks = set()
        azure_services = set()
        design_patterns = set()
        industries = set()
        project_types = set()
        code_complexities = set()
        customers = set()  # New set for customers

        # Collect distinct values from projects and cross-check with approved tags
        for p in projects:
            for pl in p.get('programmingLanguages', []):
                if pl in approved_tags.get('programming_languages', []):
                    prog_langs.add(pl)
            for fw in p.get('frameworks', []):
                if fw in approved_tags.get('frameworks', []):
                    frameworks.add(fw)
            for az in p.get('azureServices', []):
                if az in approved_tags.get('azure_services', []):
                    azure_services.add(az)
            for dp in p.get('designPatterns', []):
                if dp in approved_tags.get('design_patterns', []):
                    design_patterns.add(dp)
            for ind in p.get('industries', []):
                if ind in approved_tags.get('industries', []):
                    industries.add(ind)
            if 'projectType' in p and p['projectType']:
                project_types.add(p['projectType'])
            if 'codeComplexity' in p and p['codeComplexity']:
                code_complexities.add(p['codeComplexity'])
            # Add customers without approval check
            for customer in p.get('customers', []):
                customers.add(customer)

        data = {
            "programmingLanguages": sorted(prog_langs),
            "frameworks": sorted(frameworks),
            "azureServices": sorted(azure_services),
            "azureServiceCategories": approved_tags.get('azure_service_mapping', {}),
            "designPatterns": sorted(design_patterns),
            "industries": sorted(industries),
            "projectTypes": sorted(project_types),
            "codeComplexities": ["Beginner", "Intermediate", "Advanced"],
            "customers": sorted(customers)  # Add customers to response
        }

        return data

    except Exception as e:
        print(f"Error in get_filter_options: {e}")
        logger.error("get_filter_options_failed",
            error=str(e),
            error_type=type(e).__name__
        )
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/api/admin/approve_project")
async def approve_project(project: Dict[str, Any]):
    try:
        project['review_status'] = 'approved'
        project['partitionKey'] = 'project'
        
        # Update the item in Cosmos
        cosmos_db.upsert_item(project)

        # Add the project to the search index
        result = add_project(project)
        if result.get("success"):
            return {"message": "Project approved and added to index.", "project": result["project"]}
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to add project."))
    except Exception as e:
        print(f"Error in approve_project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/reject_project")
async def reject_project(project: Dict[str, Any]):
    try:
        # Remove from Cosmos DB
        cosmos_db.delete_item(item_id=project['id'], partition_key='project')
        return {"message": "Project rejected and removed from pending reviews."}
    except Exception as e:
        print(f"Error in reject_project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/check_admin")
async def check_admin(x_ms_client_principal: Optional[str] = Header(None)):
    try:
        if x_ms_client_principal:
            decoded = base64.b64decode(x_ms_client_principal).decode('utf-8')
            client_principal = json.loads(decoded)
            user_identity = get_user_identity(client_principal)
        else:
            user_identity = 'anonymous'

        admin_emails = os.getenv("ADMIN_EMAILS", "")
        admin_list = [email.strip().lower() for email in admin_emails.split(",") if email.strip()]

        is_admin = user_identity.lower() in admin_list
        return {"isAdmin": is_admin}
    except Exception as e:
        print(f"Error checking admin status: {str(e)}")
        return {"isAdmin": False, "error": str(e)}

@app.get("/api/admin/get_approved_tags")
async def get_approved_tags():
    try:
        query = "SELECT * FROM c WHERE c.id = 'approved_tags' AND c.partitionKey = 'metadata'"
        results = cosmos_db.query_items(query)
        tags = list(results)
        
        if tags:
            tag_data = tags[0]
            return {
                "id": "approved_tags",
                "partitionKey": "metadata",
                "programming_languages": tag_data.get('programming_languages', []),
                "frameworks": tag_data.get('frameworks', []),
                "azure_services": tag_data.get('azure_services', []),
                "design_patterns": tag_data.get('design_patterns', []),
                "industries": tag_data.get('industries', []),
                "projectTypes": tag_data.get('project_types', []),
                "azure_service_mapping": tag_data.get('azure_service_mapping', {})
            }
        else:
            # Return empty structure if not found
            empty_tags = {
                "id": "approved_tags",
                "partitionKey": "metadata",
                "programming_languages": [],
                "frameworks": [],
                "azure_services": [],
                "design_patterns": [],
                "industries": [],
                "projectTypes": [],
                "azure_service_mapping": {}
            }
            return empty_tags
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/admin/update_approved_tags")
async def update_approved_tags(tags: Dict[str, Any]):
    try:
        print("raw payload:\n" , json.dumps(tags, indent=2))

        # Create the updated structure, now including project_types
        updated_tags = {
            "id": "approved_tags",
            "partitionKey": "metadata",
            "programming_languages": tags.get('programmingLanguages', []),
            "frameworks": tags.get('frameworks', []),
            "azure_services": tags.get('azureServices', []),
            "design_patterns": tags.get('designPatterns', []),
            "industries": tags.get('industries', []),
            "project_types": tags.get('projectTypes', []),
            "azure_service_mapping": tags.get('azureServiceMapping', {})
        }
        
        print("Updated tags:")
        print(json.dumps(updated_tags, indent=2))

        # Upsert into Cosmos DB
        cosmos_db.upsert_item(updated_tags)
        return {"message": "Approved tags updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search_projects")
async def search(filter_options: FilterOptions):
    try:
        query = filter_options.query or ""
        filters = filter_options.filters or {}
        sort = filter_options.sort or ""

        logger.info(f"Search started - Query: {query}, Filters: {filters}, Sort: {sort}")

        print(f"Received search query: {query}")
        print(f"Filters: {filters}")
        print(f"Sort: {sort}")

        results = search_projects(query, filters, sort)
        print(f"Found {len(results)} results")
        logger.info(f"Search completed - Found {len(results)} results for query: {query}")

        return {
            "results": results,
            "message": f"Found {len(results)} matching projects"
        }

    except Exception as e:
        logger.error(f"Search failed - Error: {str(e)}")
        return {
            "results": [],
            "error": "An error occurred while searching projects"
        }


@app.post("/api/submit_repo")
async def submit_repo(submission: ProjectSubmission, x_ms_client_principal: Optional[str] = Header(None)):
    try:
        github_url = submission.githubUrl

        if not github_url.strip():
            raise HTTPException(status_code=400, detail="GitHub URL is required")

        readme_content = fetch_readme(github_url)

        if not readme_content:
            raise HTTPException(status_code=404, detail="Failed to fetch README.md from the repository")

        report = process_readme(readme_content)
        print(report.model_dump_json(indent=2))

        if report:
            # Capture user identity
            if x_ms_client_principal:
                decoded = base64.b64decode(x_ms_client_principal).decode('utf-8')
                client_principal = json.loads(decoded)
                user_identity = get_user_identity(client_principal)
            else:
                user_identity = 'anonymous'

            report_dict = report.model_dump()
            report_dict['owner'] = user_identity

            return report_dict
        else:
            raise HTTPException(status_code=500, detail="Failed to extract project information")

    except Exception as e:
        print(f"/submit_repo endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the repository")


@app.post("/api/send_for_review")
async def send_for_review(data: ProjectReview):
    data_dict = data.model_dump()
    success = send_email(data_dict)
    if success:
        try:
            data_dict['id'] = generate_document_id(data_dict.get('githubUrl', ''))
            data_dict['partitionKey'] = 'project'
            data_dict['review_status'] = 'pending'
            # Upsert into Cosmos DB
            cosmos_db.upsert_item(data_dict)
            return {"message": "Review request sent successfully."}
        except Exception as e:
            print(f"Error adding pending review: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=500, detail="Failed to send review request.")

# This catch-all route must be THE LAST ROUTE defined in the file
# to ensure all API routes are processed first
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # If the path exists in static files, let the StaticFiles handle it
    if full_path.startswith("assets/"):
        return FileResponse(f"dist/{full_path}")
    # Otherwise, serve index.html for client-side routing
    return FileResponse("dist/index.html")

if __name__ == '__main__':

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
