from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery
from azure.core.credentials import AzureKeyCredential
from typing import List, Dict
import os
import hashlib
from openai import AzureOpenAI
import json
# Azure Cognitive Search configuration
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

AI_SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
AI_SEARCH_KEY = os.getenv("AZURE_SEARCH_KEY")
AI_SEARCH_INDEX = os.getenv("AZURE_SEARCH_INDEX")

print("Index: ", AI_SEARCH_INDEX)

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

def generate_embeddings(text, model="text-embedding-ada-002"):  # model = "deployment_name"
    return aoai_client.embeddings.create(input=[text], model=model).data[0].embedding




def search_projects(query: str, filters: Dict, sort: str) -> List[Dict]:
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
            fields="description_vector"
        )

        # # Build filter string
        # filter_clauses = []
        # for field, values in filters.items():
        #     if values:
        #         # Assuming all filter fields are string fields
        #         filter_clauses.append(f"{field} in ({', '.join([f'\'{v}\'' for v in values])})")
        # filter_string = ' and '.join(filter_clauses) if filter_clauses else None

        # # Determine sort order
        # sort_order = None
        # if sort:
        #     sort_mapping = {
        #         'complexity_asc': 'code_complexity_score asc',
        #         'complexity_desc': 'code_complexity_score desc',
        #         'reusability_asc': 'reusability_score asc',  # Assuming reusability_score exists
        #         'reusability_desc': 'reusability_score desc',
        #     }
        #     sort_order = sort_mapping.get(sort)

        # Perform hybrid search (both text and vector)
        results = search_client.search(
            search_text=query,
            vector_queries=[vector_query],
            # filter=filter_string,
            # sort=sort_order,
            select=["id", "project_name", "project_description", "github_url", "owner",
                    "programming_languages", "frameworks", "azure_services",
                    "design_patterns", "project_type", "code_complexity",
                    "business_value", "target_audience"],
            top=8
        )

        # Convert results to list of dictionaries
        projects = []
        for result in results:
            project = {
                "id": result["id"],
                "projectName": result.get("project_name", ""),  # Convert snake_case to camelCase for frontend
                "projectDescription": result.get("project_description", ""),
                "githubUrl": result.get("github_url", ""),  # Convert snake_case to camelCase for frontend
                "owner": result.get("owner", ""),
                "programmingLanguages": result.get("programming_languages", []),
                "frameworks": result.get("frameworks", []),
                "azureServices": result.get("azure_services", []),
                "designPatterns": result.get("design_patterns", []),
                "projectType": result.get("project_type", ""),
                "codeComplexity": result.get("code_complexity", ""),
                "businessValue": result.get("business_value", ""),
                "targetAudience": result.get("target_audience", "")
            }
            projects.append(project)

        return projects

    except Exception as e:
        print(f"Search error: {str(e)}")
        return []
    
def generate_document_id(github_url: str) -> str:
    """Generate a unique, deterministic ID for a document."""
    unique_string = f"{github_url}"  # Use the GitHub URL for uniqueness
    return hashlib.md5(unique_string.encode()).hexdigest()


def add_project(data: Dict) -> Dict:
    """
    Add a new project to Azure Cognitive Search.

    Args:
        data (Dict): Project data, including 'owner'.

    Returns:
        Dict: Result of the operation.
    """
    try:
        # Create the new project document
        new_project = {
            "id": generate_document_id(data.get('githubUrl', '')),
            "project_name": data.get('projectName', ''),
            "project_description": data.get('projectDescription', ''),
            "github_url": data.get('githubUrl', ''),
            "owner": data.get('owner', 'anonymous'),  # Extract owner from data
            "code_complexity": data.get('codeComplexity', 'Intermediate'),
            "programming_languages": data.get('programmingLanguages', []),
            "frameworks": data.get('frameworks', []),
            "azure_services": data.get('azureServices', []),
            "design_patterns": data.get('designPatterns', []),
            "project_type": data.get('projectType', ''),
            "business_value": data.get('businessValue', ''),
            "target_audience": data.get('targetAudience', '')
        }

        print(json.dumps(new_project, indent=2))

        description_embeddings = generate_embeddings(new_project["project_description"])
        business_value_embeddings = generate_embeddings(new_project["business_value"])
        target_audience_embeddings = generate_embeddings(new_project["target_audience"])

        new_project["description_vector"] = description_embeddings
        new_project["business_value_vector"] = business_value_embeddings
        new_project["target_audience_vector"] = target_audience_embeddings

        

        # Index the new project in Azure Cognitive Search
        print("Uploading document...")
        search_client.upload_documents(documents=[new_project])
        print("Document uploaded successfully.")

        return {"success": True, "project": new_project}

    except Exception as e:
        print(f"Error adding project: {e}")
        return {"success": False, "error": str(e)}



if __name__ == '__main__':

    new_project = {
  "id": "28b2be79cd0ff702df4a9b62368ee0ee",
  "project_name": "RFP Accelerator",
  "project_description": "The RFP Accelerator is an application that leverages Generative AI to streamline and enhance the proposal response process for organizations responding to Requests for Proposal (RFP) or Requests for Information (RFI).",
  "github_url": "https://github.com/DanGiannone1/rfp_accelerator",
  "owner": "anonymous",
  "code_complexity": "Intermediate",
  "programming_languages": [
    "Python",
    "JavaScript"
  ],
  "frameworks": [],
  "azure_services": [
    "Azure Data Lake Storage",
    "Azure Document Intelligence",
    "Azure OpenAI",
    "Azure Cosmos DB",
    "Azure AI Search",
    "Bing Search Service"
  ],
  "design_patterns": [],
  "project_type": "Full application",
  "business_value": "The RFP Accelerator provides significant business value by transforming the traditionally cumbersome and time-consuming RFP response process into a streamlined and efficient operation. By leveraging Generative AI, it reduces the time and resources required to respond to RFPs, improves the accuracy and quality of responses, and enhances collaboration across teams. This can lead to increased win rates for proposals, reduced operational costs, and improved resource allocation.",
  "target_audience": "The target audience for this codebase includes organizations and businesses that frequently respond to RFPs or RFIs, particularly those looking to improve their proposal processes through automation and AI technologies.",

    }


    description_embeddings = generate_embeddings(new_project["project_description"])
    business_value_embeddings = generate_embeddings(new_project["business_value"])
    target_audience_embeddings = generate_embeddings(new_project["target_audience"])

    new_project["description_vector"] = description_embeddings
    new_project["business_value_vector"] = business_value_embeddings
    new_project["target_audience_vector"] = target_audience_embeddings


    #write new_project to output file
    # with open("D:/temp/tmp_codebase/new_project.json", "w") as f:
    #     json.dump(new_project, f, indent=2)


    print("Uploading document...")
    search_client.upload_documents(documents=[new_project])
    print("Document uploaded successfully.")