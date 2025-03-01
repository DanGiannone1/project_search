#!/usr/bin/env python3
"""
Simple script to load a specific project from Cosmos DB into Azure AI Search.
Follows the same pattern as the approve_project route in app.py.
"""
import os
import sys

from pathlib import Path

# Add the parent directory to sys.path to import backend modules
parent_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(parent_dir))

# Change to the project root directory where .env file is located
os.chdir(parent_dir)

# Now import after adding parent_dir to sys.path and changing directory
from dotenv import load_dotenv
from backend.cosmosdb import CosmosDBManager
from backend.projects import add_project, generate_embeddings, generate_document_id

# Load environment variables
load_dotenv()

def index_project(project_id, force_reindex=False, debug=False):
    """
    Get a project from Cosmos DB and index it in Azure AI Search.
    
    Args:
        project_id: The ID of the project to index
        force_reindex: If True, update the project in Cosmos DB before indexing
        debug: If True, print detailed debugging information
    """
    print(f"Fetching project with ID: {project_id}")
    
    # Initialize CosmosDB connection
    cosmos_db = CosmosDBManager()
    
    # Fetch the project
    query = f"SELECT * FROM c WHERE c.id = '{project_id}' AND c.partitionKey = 'project'"
    projects = list(cosmos_db.query_items(query))
    
    if not projects:
        print(f"No project found with ID: {project_id}")
        return
    
    project = projects[0]
    print(f"Found project: {project.get('projectName', 'Unknown')}")
    
    # Verify the document ID is consistent
    if 'githubUrl' in project:
        generated_id = generate_document_id(project['githubUrl'])
        if generated_id != project_id:
            print(f"WARNING: The project ID in Cosmos DB ({project_id}) does not match")
            print(f"the ID that would be generated from the githubUrl ({generated_id}).")
            print("This may cause issues with finding the document in the search index.")
            
            if debug:
                print(f"GitHub URL: {project['githubUrl']}")
                print(f"Generated ID: {generated_id}")
                print(f"Actual ID: {project_id}")
    
    # Ensure the project has the required fields
    if 'review_status' not in project or force_reindex:
        print("Ensuring project has 'approved' status...")
        project['review_status'] = 'approved'
    
    if 'partitionKey' not in project:
        print("Setting partitionKey to 'project'...")
        project['partitionKey'] = 'project'
    
    # Print project details if debug is enabled
    if debug:
        print("\n=== Project Details ===")
        for key, value in project.items():
            if key not in ['description_vector', 'business_value_vector', 'target_audience_vector']:
                print(f"{key}: {value}")
        print("======================\n")
    
    # Generate embeddings if needed
    if 'description_vector' not in project and 'projectDescription' in project:
        print("Generating description embeddings...")
        project['description_vector'] = generate_embeddings(project['projectDescription'])
    
    if 'business_value_vector' not in project and 'businessValue' in project:
        print("Generating business value embeddings...")
        project['business_value_vector'] = generate_embeddings(project['businessValue'])
    
    if 'target_audience_vector' not in project and 'targetAudience' in project:
        print("Generating target audience embeddings...")
        project['target_audience_vector'] = generate_embeddings(project['targetAudience'])
    
    # If we're forcing a reindex, update the project in Cosmos DB
    if force_reindex:
        print("Updating project in Cosmos DB...")
        cosmos_db.upsert_item(project)
    
    # List required fields for search indexing
    required_fields = [
        'projectName', 'projectDescription', 'githubUrl', 'owner',
        'programmingLanguages', 'frameworks', 'azureServices', 
        'designPatterns', 'projectType', 'codeComplexity',
        'businessValue', 'targetAudience'
    ]
    
    # Check for missing fields
    missing_fields = [field for field in required_fields if field not in project]
    if missing_fields:
        print(f"WARNING: Project is missing the following fields that may be required for indexing:")
        for field in missing_fields:
            print(f"  - {field}")
        
        if debug and not force_reindex:
            proceed = input("Continue with indexing anyway? (y/n): ")
            if proceed.lower() != 'y':
                print("Indexing cancelled.")
                return
    
    # Add to search index
    print("Adding project to search index...")
    result = add_project(project)
    
    if result.get("success"):
        print(f"Successfully added project to search index!")
        
        if debug:
            print("\n=== Search Document Created ===")
            search_doc = result.get("project", {})
            for key, value in search_doc.items():
                if not key.endswith('_vector'):
                    print(f"{key}: {value}")
            print("=============================\n")
    else:
        print(f"Failed to add project to search index: {result.get('error')}")
        
        # Give a hint if GitHub URL might be the issue
        if 'githubUrl' in project and 'Error generating document ID' in str(result.get('error', '')):
            print("\nTIP: The error may be related to the GitHub URL format.")
            print(f"Current GitHub URL: {project.get('githubUrl')}")
            print("Make sure the URL is in the correct format (e.g., https://github.com/username/repo)")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python adhoc_indexing.py PROJECT_ID [--force] [--debug]")
        print("  PROJECT_ID: The ID of the project to index")
        print("  --force: Optional flag to force update the project in Cosmos DB")
        print("  --debug: Optional flag to print detailed debugging information")
        sys.exit(1)
    
    project_id = sys.argv[1]
    force_reindex = "--force" in sys.argv
    debug = "--debug" in sys.argv
    
    index_project(project_id, force_reindex, debug)
