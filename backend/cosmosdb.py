"""
### cosmos_db.py ###

This module handles interactions with Azure Cosmos DB, including database and container creation,
and CRUD operations on documents. It uses DefaultAzureCredential for authentication.
Logging is configured to show only custom messages.

Requirements:
    azure-cosmos==4.5.1
    azure-identity==1.12.0
"""

import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from azure.cosmos import CosmosClient, exceptions, PartitionKey
from azure.cosmos.container import ContainerProxy
from azure.cosmos.database import DatabaseProxy
from azure.identity import DefaultAzureCredential

class CosmosDBManager:
    def __init__(self, cosmos_database_id=None, cosmos_container_id=None):
        self._load_env_variables(cosmos_database_id, cosmos_container_id)
        self.client = self._get_cosmos_client()
        self.database: Optional[DatabaseProxy] = None
        self.container: Optional[ContainerProxy] = None
        self._initialize_database_and_container()

    def _load_env_variables(self, cosmos_database_id=None, cosmos_container_id=None):
        load_dotenv()
        self.cosmos_database_id = cosmos_database_id or os.environ.get("COSMOS_DATABASE_ID")
        self.cosmos_container_id = cosmos_container_id or os.environ.get("COSMOS_CONTAINER_ID")
        self.tenant_id = os.environ.get("TENANT_ID", 'your-tenant-id')

        if not all([self.cosmos_database_id, self.cosmos_container_id]):
            raise ValueError("Cosmos DB configuration is incomplete")

    def _get_cosmos_client(self):
        resource_endpoint = os.environ.get("COSMOS_HOST")
        if not resource_endpoint:
            raise ValueError("COSMOS_HOST environment variable is required")

        print("Using DefaultAzureCredential for Cosmos DB authentication")
        credential = DefaultAzureCredential()
        return CosmosClient(resource_endpoint, credential=credential)

    def _initialize_database_and_container(self) -> None:
        try:
            self.database = self._create_or_get_database()
            self.container = self._create_or_get_container()
        except exceptions.CosmosHttpResponseError as e:
            print(f'An error occurred: {e.message}')
            raise

    def _create_or_get_database(self) -> DatabaseProxy:
        try:
            database = self.client.create_database(id=self.cosmos_database_id)
            print(f'Database with id \'{self.cosmos_database_id}\' created')
        except exceptions.CosmosResourceExistsError:
            database = self.client.get_database_client(self.cosmos_database_id)
            print(f'Database with id \'{self.cosmos_database_id}\' was found')
        return database

    def _create_or_get_container(self) -> ContainerProxy:
        try:
            container = self.database.create_container(
                id=self.cosmos_container_id,
                partition_key=PartitionKey(path='/partitionKey')
            )
            print(f'Container with id \'{self.cosmos_container_id}\' created')
        except exceptions.CosmosResourceExistsError:
            container = self.database.get_container_client(self.cosmos_container_id)
            print(f'Container with id \'{self.cosmos_container_id}\' was found')
        return container

    def create_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        try:
            created_item = self.container.create_item(body=item)
            print(f"Item created with id: {created_item['id']}")
            return created_item
        except exceptions.CosmosResourceExistsError:
            print(f"Item with id {item['id']} already exists.")
            return None
        except exceptions.CosmosHttpResponseError as e:
            print(f"An error occurred during creation: {e.message}")
            return None

    def update_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        try:
            updated_item = self.container.replace_item(item=item['id'], body=item)
            print(f"Item updated with id: {updated_item['id']}")
            return updated_item
        except exceptions.CosmosResourceNotFoundError:
            print(f"Item with id {item['id']} not found.")
            return None
        except exceptions.CosmosHttpResponseError as e:
            print(f"An error occurred during update: {e.message}")
            return None

    def upsert_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        try:
            upserted_item = self.container.upsert_item(body=item)
            print(f"Item upserted with id: {upserted_item['id']}")
            return upserted_item
        except exceptions.CosmosHttpResponseError as e:
            print(f"An error occurred during upsert: {e.message}")
            return None

    def query_items(self, query: str, parameters: Optional[List[Dict[str, Any]]] = None,
                    partition_key: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            items = list(self.container.query_items(
                query=query,
                parameters=parameters,
                partition_key=partition_key,
                enable_cross_partition_query=(partition_key is None)
            ))
            print(f"Query returned {len(items)} items")
            return items
        except exceptions.CosmosHttpResponseError as e:
            print(f"An error occurred during query: {e.message}")
            return []

    def delete_item(self, item_id: str, partition_key: str) -> bool:
        try:
            self.container.delete_item(item=item_id, partition_key=partition_key)
            print(f"Item deleted with id: {item_id}")
            return True
        except exceptions.CosmosResourceNotFoundError:
            print(f"Item with id {item_id} not found.")
            return False
        except exceptions.CosmosHttpResponseError as e:
            print(f"An error occurred during deletion: {e.message}")
            return False

def example_usage():
    cosmos_db = CosmosDBManager()
    new_item = {
        'id': 'item1',
        'partitionKey': 'example_partition',
        'name': 'John Doe',
        'age': 30
    }
    created_item = cosmos_db.create_item(new_item)
    # Additional example operations can be added here

if __name__ == "__main__":
    try:
        example_usage()
    except Exception as e:
        print(f"An error occurred: {str(e)}")