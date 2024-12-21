# test.py
import json
from dotenv import load_dotenv
from cosmosdb import CosmosDBManager

# Load environment variables
load_dotenv()

COSMOS_DATABASE_ID = "codewith_project_search"
COSMOS_CONTAINER_ID = "project_container_test"

# Initialize Cosmos DB manager
cosmos_db = CosmosDBManager(
    cosmos_database_id=COSMOS_DATABASE_ID,
    cosmos_container_id=COSMOS_CONTAINER_ID
)

# Load the approved tags data
with open('approved_tags.json', 'r') as f:
    approved_tags = json.load(f)

# Upsert the data to Cosmos DB
cosmos_db.upsert_item(approved_tags)