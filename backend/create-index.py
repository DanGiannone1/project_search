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
aoai_deployment = os.getenv("AOAI_DEPLOYMENT")
aoai_key = os.getenv("AOAI_KEY")
aoai_endpoint = os.getenv("AOAI_ENDPOINT")


search_index_client = SearchIndexClient(ai_search_endpoint, AzureKeyCredential(ai_search_key))
search_client = SearchClient(ai_search_endpoint, ai_search_index, AzureKeyCredential(ai_search_key))



def create_index():
    # Check if index exists, return if so
    try:
        search_index_client.get_index(ai_search_index)
        print("Index already exists")
        return
    except:
        pass

    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SimpleField(name='owner', type=SearchFieldDataType.String, filterable=True),
        SearchableField(name='project_name', type=SearchFieldDataType.String),
        SearchableField(name="project_description", type=SearchFieldDataType.String),
        SimpleField(name="github_url", type=SearchFieldDataType.String, filterable=True),
        SimpleField(name="code_complexity", type=SearchFieldDataType.String, filterable=True),
        SimpleField(name="programming_languages", type=SearchFieldDataType.Collection(SearchFieldDataType.String), filterable=True),
        SimpleField(name="frameworks", type=SearchFieldDataType.Collection(SearchFieldDataType.String), filterable=True),
        SimpleField(name="azure_services", type=SearchFieldDataType.Collection(SearchFieldDataType.String), filterable=True),
        SimpleField(name="design_patterns", type=SearchFieldDataType.Collection(SearchFieldDataType.String), filterable=True),
        SimpleField(name="project_type", type=SearchFieldDataType.String, filterable=True),
        SearchableField(name="business_value", type=SearchFieldDataType.String),
        SearchableField(name="target_audience", type=SearchFieldDataType.String),
        SimpleField(name="industries", type=SearchFieldDataType.Collection(SearchFieldDataType.String), filterable=True),
        SimpleField(name="customers", type=SearchFieldDataType.Collection(SearchFieldDataType.String), filterable=True),
        SearchField(
            name="description_vector",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=1536,
            vector_search_profile_name="myHnswProfile"
        ),
        SearchField(
            name="business_value_vector",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=1536,
            vector_search_profile_name="myHnswProfile"
        ),
        SearchField(
            name="target_audience_vector",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=1536,
            vector_search_profile_name="myHnswProfile"
        ),
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

    index = SearchIndex(name=ai_search_index, fields=fields, vector_search=vector_search)
    result = search_index_client.create_or_update_index(index)

    print("Index has been created")

if __name__ == "__main__":
    create_index()
