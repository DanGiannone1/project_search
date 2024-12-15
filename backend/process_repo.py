# process_repo.py
import hashlib
import os
import sys
import requests
from dotenv import load_dotenv
from typing import List, Literal
from pydantic import BaseModel
from langchain_openai import AzureChatOpenAI

load_dotenv()

# Azure OpenAI configuration
aoai_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
aoai_key = os.getenv("AZURE_OPENAI_API_KEY")
aoai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")

# Constants
STATIC_PATH = 'cloned_repos'  # Directory to store cloned repositories
MAX_FILE_SIZE = 1 * 1024 * 1024  # 1 MB for large data files

class ExtractionResponse(BaseModel):
    """Schema for parsing project details"""
    project_name: str
    project_description: str
    programming_languages: List[str]
    frameworks: List[str]
    azure_services: List[str]
    design_patterns: List[str]
    project_type: str
    code_complexity_score: Literal[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    business_value: str
    target_audience: str

primary_llm = AzureChatOpenAI(
    azure_deployment=aoai_deployment,
    api_version="2024-08-01-preview",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    api_key=aoai_key,
    azure_endpoint=aoai_endpoint
)

review_prompt = """Your job is to review a codebase and provide a report on it. Here is what the report should contain:

- Project Name
- Project Description
- Programming languages: C#, Python, React, etc.
- Frameworks: Semantic Kernel, Autogen, Langgraph, Langchain, etc.
- Azure Services: Azure OpenAI, Azure Cosmos DB, Azure Data Lake Storage, etc.
- Design Patterns: RAG, single agent, multi-agent, etc.
- Project Type: Full application or demo.
- Code complexity score: How complicated is the codebase? 1 would indicate this is beginner-friendly code, 10 would indicate this is expert-level code.
- Business Value: What is the business value of this codebase? What problem does it solve? How would using this codebase benefit a company in terms of its business outcomes?
- Target Audience: Who is the target audience for this codebase?
"""

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

if __name__ == "__main__":


    github_url = "https://github.com/DanGiannone1/rfp_accelerator"
    readme_content = fetch_readme(github_url)

    if readme_content:
        report = process_readme(readme_content)
        if report:
            print("Extraction Successful:")
            print(report.model_dump_json(indent=2))  # Updated method here
        else:
            print("Failed to extract project information.")
    else:
        print("Failed to fetch README.md content.")