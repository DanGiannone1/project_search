
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SimpleField,
    SearchFieldDataType,
    SearchableField,
    SearchField,
    VectorSearch,
    HnswAlgorithmConfiguration,
    VectorSearchProfile,
    SemanticConfiguration,
    SemanticPrioritizedFields,
    SemanticField,
    SemanticSearch,
    SearchIndex
)
from datetime import datetime, timezone
import json
import hashlib
from typing import Any
#import lib for pypdf2


from azure.core.credentials import AzureKeyCredential  
from azure.search.documents import SearchClient  
from datetime import datetime
import os  
from dotenv import load_dotenv  
from azure.core.credentials import AzureKeyCredential  

from openai import AzureOpenAI  
import os
from langchain_openai import AzureChatOpenAI
import itertools



from azure.core.credentials import AzureKeyCredential

import tiktoken
from dotenv import load_dotenv 
import requests

load_dotenv()


ai_search_endpoint = os.environ["AZURE_SEARCH_ENDPOINT"]
ai_search_key = os.environ["AZURE_SEARCH_KEY"]
ai_search_index = os.environ["AZURE_SEARCH_INDEX"]

# Azure OpenAI
aoai_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
aoai_key = os.getenv("AZURE_OPENAI_API_KEY")
aoai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")


search_index_client = SearchIndexClient(ai_search_endpoint, AzureKeyCredential(ai_search_key))
search_client = SearchClient(ai_search_endpoint, ai_search_index, AzureKeyCredential(ai_search_key))

aoai_client = AzureOpenAI(
        azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT"), 
        api_key=os.getenv("AZURE_OPENAI_KEY"),  
        api_version="2023-05-15"
        )



primary_llm = AzureChatOpenAI(
    azure_deployment=aoai_deployment,
    api_version="2024-05-01-preview",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    api_key=aoai_key,
    azure_endpoint=aoai_endpoint
)

primary_llm_json = AzureChatOpenAI(
    azure_deployment=aoai_deployment,
    api_version="2024-05-01-preview",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    api_key=aoai_key,
    azure_endpoint=aoai_endpoint,
    model_kwargs={"response_format": {"type": "json_object"}}
)


def generate_embeddings(text, model="text-embedding-ada-002"): # model = "deployment_name"
    return aoai_client.embeddings.create(input = [text], model=model).data[0].embedding



def create_index():

   

    
    #Check if index exists, return if so
    try:
        # Try to get the index
        search_index_client.get_index(ai_search_index)
        # If no exception is raised, the index exists and we return
        print("Index already exists")
        return
    except:
        # If an exception is raised, the index does not exist and we continue with the logic to create it
        pass

    # Rest of your code...

    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True, filterable=True),
        SimpleField(name='owner', type=SearchFieldDataType.String, filterable=True),
        SimpleField(name='project_name', type=SearchFieldDataType.String, filterable=True),
        SearchableField(name="description", type=SearchFieldDataType.String),
        SearchableField(name="github_url", type=SearchFieldDataType.String, filterable=True),
        SearchField(name="descriptionVector", type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                    searchable=True, vector_search_dimensions=1536, vector_search_profile_name="myHnswProfile")

    ]

    vector_search = VectorSearch(
    algorithms=[
        HnswAlgorithmConfiguration(
            name="myHnsw"
        )
    ],
    profiles=[
        VectorSearchProfile(
            name="myHnswProfile",
            algorithm_configuration_name="myHnsw",
        )
    ]
)
    index = SearchIndex(name=ai_search_index, fields=fields,
                    vector_search=vector_search)
    result = search_index_client.create_or_update_index(index)

    print("Index has been created")



def generate_document_id(github_url: str) -> str:
    """Generate a unique, deterministic ID for a document."""
    unique_string = f"{github_url}"  # Use first 100 characters of content for uniqueness
    return hashlib.md5(unique_string.encode()).hexdigest()



# def populate_index():
#     
            
#             experienceLevel = extraction_json["experienceLevel"]
#             jobTitle = extraction_json["jobTitle"]
#             skills_and_experience = extraction_json["skills_and_experience"]
#             skills_and_experience_str = ", ".join(skills_and_experience)
#             searchVector = generate_embeddings(skills_and_experience_str)
#             current_date = datetime.now(timezone.utc).isoformat()
#             document_id = generate_document_id(blob.name)
#             fileName = os.path.basename(blob.name)
#             print(f"Extracted experience level: {experienceLevel}")
#             print(f"Extracted job title: {jobTitle}")
#             print(f"Extracted skills and experience: {skills_and_experience_str}")
#             print(f"Current date: {current_date}")
            
#             document = {
#                 "id": document_id,
#                 "date": current_date,
#                 "jobTitle": jobTitle,
#                 "experienceLevel": experienceLevel,
#                 "content": full_text,
#                 "sourceFileName": fileName,
#                 "searchVector": searchVector
#             }
            
#             search_client.upload_documents(documents=[document])
            
#             # Move the processed file to the 'processed' folder

#             print(f"Successfully processed and moved {blob.name}")
        
#         except Exception as e:
#             print(f"Error processing {blob.name}: {str(e)}")


if __name__ == "__main__":



    create_index()



    

    
    


    

