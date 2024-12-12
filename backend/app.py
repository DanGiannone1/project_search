from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import time
from typing import List, Dict
import os
import hashlib
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.models import VectorizedQuery
from openai import AzureOpenAI
from dotenv import load_dotenv
import base64
import json

app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)  # Enable CORS

# Load environment variables from .env file
load_dotenv()

# Azure Cognitive Search configuration
AI_SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
AI_SEARCH_KEY = os.getenv("AZURE_SEARCH_KEY")
AI_SEARCH_INDEX = os.getenv("AZURE_SEARCH_INDEX")

search_client = SearchClient(
    endpoint=AI_SEARCH_ENDPOINT,
    index_name=AI_SEARCH_INDEX,
    credential=AzureKeyCredential(AI_SEARCH_KEY)
)

# Azure OpenAI configuration
AOAI_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AOAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AOAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

aoai_client = AzureOpenAI(
    azure_endpoint=AOAI_ENDPOINT,
    api_key=AOAI_KEY,
    api_version="2023-05-15"
)

def generate_document_id(github_url: str) -> str:
    """Generate a unique ID for the document based on the GitHub URL."""
    return hashlib.md5(github_url.encode()).hexdigest()

def generate_embeddings(text, model="text-embedding-ada-002"): # model = "deployment_name"
    return aoai_client.embeddings.create(input = [text], model=model).data[0].embedding

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # If the path exists in the build folder, serve that file
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # Otherwise, serve the index.html (for React Router)
        return send_from_directory(app.static_folder, 'index.html')

def search_projects(query: str) -> List[Dict]:
    """
    Search for projects using both text and vector search in Azure Cognitive Search.
    """
    try:
        # Generate embeddings for the search query
        query_vector = generate_embeddings(query)
        
        # Create a vector query for semantic search
        vector_query = VectorizedQuery(
            vector=query_vector,
            k_nearest_neighbors=3,
            fields="descriptionVector"  # Make sure this matches your index field name
        )
        
        # Perform hybrid search (both text and vector)
        results = search_client.search(
            search_text=query,
            vector_queries=[vector_query],
            select=["id", "project_name", "description", "github_url", "owner"],
            top=10
        )
        
        # Convert results to list of dictionaries
        projects = []
        for result in results:
            project = {
                "id": result["id"],
                "projectName": result.get("project_name", ""),  # Convert snake_case to camelCase for frontend
                "description": result.get("description", ""),
                "githubUrl": result.get("github_url", ""),  # Convert snake_case to camelCase for frontend
                "owner": result.get("owner", "")
            }
            projects.append(project)
            
        return projects
        
    except Exception as e:
        print(f"Search error: {str(e)}")
        return []

@app.route('/api/search_projects', methods=['POST'])
def search():
    try:
        data = request.get_json()
        query = data.get('query', '')
        print(f"Received search query: {query}")
        
        if not query.strip():
            return jsonify({"results": [], "message": "Please provide a search query"})
        
        results = search_projects(query)
        print(f"Found {len(results)} results")
        
        return jsonify({
            "results": results,
            "message": f"Found {len(results)} matching projects"
        })
        
    except Exception as e:
        print(f"Search endpoint error: {str(e)}")
        return jsonify({
            "results": [],
            "error": "An error occurred while searching projects"
        }), 500

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

@app.route('/api/add_project', methods=['POST'])
def add_project():
    data = request.get_json()
    
    # Get the 'X-MS-CLIENT-PRINCIPAL' header
    client_principal = request.headers.get('X-MS-CLIENT-PRINCIPAL')
    if client_principal:
        # Decode the Base64-encoded JSON token
        decoded = base64.b64decode(client_principal)
        user_info = json.loads(decoded)
        
        # Extract user details from the claims
        user_identity = get_user_identity(user_info)
    else:
        # Handle unauthenticated users or default to 'anonymous'
        user_identity = 'anonymous'

    # Create the new project document with project_name and owner
    new_project = {
        "id": generate_document_id(data.get('githubUrl', '')),
        "project_name": data.get('projectName', ''),  # Adding project_name
        "description": data.get('description', ''),
        "github_url": data.get('githubUrl', ''),
        "owner": user_identity,
    }

    # Generate embeddings for the description
    try:
        description_vector = generate_embeddings(new_project["description"])
        new_project["descriptionVector"] = description_vector
    except Exception as e:
        print(f"Error generating embeddings: {str(e)}")
        return jsonify({"error": "Failed to generate embeddings"}), 500

    # Index the new project in Azure Cognitive Search
    try:
        upload_result = search_client.upload_documents(documents=[new_project])
        if upload_result[0].succeeded:
            print(f"Indexed document with ID: {new_project['id']}")
            return jsonify(new_project), 201
        else:
            print(f"Failed to index document: {upload_result[0].errors}")
            return jsonify({"error": "Failed to index document"}), 500
    except Exception as e:
        print(f"Error indexing document: {str(e)}")
        return jsonify({"error": "Failed to index document"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
