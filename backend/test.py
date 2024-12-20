# test.py
import json
from dotenv import load_dotenv
from cosmosdb import CosmosDBManager

# Load environment variables
load_dotenv()

COSMOS_DATABASE_ID = "codewith_project_search"
COSMOS_CONTAINER_ID = "project_container"

# Initialize Cosmos DB manager
cosmos_db = CosmosDBManager(
    cosmos_database_id=COSMOS_DATABASE_ID,
    cosmos_container_id=COSMOS_CONTAINER_ID
)

# Load the service-to-category mapping
with open('service_category_mapping.json', 'r') as f:
    service_to_category = json.load(f)

# Prepare the data for upserting
data = {
    "id": "service_mapping",
    "partitionKey": "metadata",
    "mapping": service_to_category
}

# Upsert the data to Cosmos DB
cosmos_db.upsert_item(data)