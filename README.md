# Project Search Platform

A modern web application built with React and Python (FastAPI) that enables users to discover, submit, and manage AI/ML projects. The platform features semantic search capabilities powered by Azure Cognitive Search and Azure OpenAI, along with a streamlined project submission and review workflow.

## Features

- **Semantic Search**: Natural language search functionality using Azure OpenAI embeddings
- **Advanced Filtering**: Filter projects by programming languages, frameworks, Azure services, and more
- **Project Submission**: Submit GitHub repositories with automated information extraction
- **Review Workflow**: Admin dashboard for reviewing and approving submitted projects
- **Responsive UI**: Modern interface with rich project cards and detailed information

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Radix UI components
- Lucide React icons
- React Toastify for notifications

### Backend
- Python with FastAPI
- Azure OpenAI for query translation, embeddings, and tag standardization
- Azure AI Search for hybrid search and filtering
- Azure Cosmos DB for metadata storage
- Azure Communication Services for email notifications

### Deployment Options
- Azure Container Apps 


## Setup Requirements

### Azure Services
- Azure OpenAI instance
- Azure AI Search service
- Azure Cosmos DB account
- Azure Communication Services setup
- Azure Container Registry (for container deployment)
- Azure Container Apps (for deployment)

### Environment Variables
Create a `.env` file in the `backend` directory with the following variables:

```
# Azure OpenAI
AOAI_KEY=your_azure_openai_api_key
AOAI_ENDPOINT=your_azure_openai_endpoint
AOAI_DEPLOYMENT=your_azure_openai_deployment_name

# Azure Cognitive Search
AZURE_SEARCH_ENDPOINT=your_search_endpoint
AZURE_SEARCH_KEY=your_search_key
AZURE_SEARCH_INDEX=your_search_index_name

# Azure Cosmos DB
COSMOS_HOST=your_cosmos_host
COSMOS_DATABASE_ID=your_cosmos_database_id
COSMOS_CONTAINER_ID=your_cosmos_container_id

# Azure Communication Services
COMMUNICATION_SERVICES_CONNECTION_STRING=your_communication_services_connection_string

# Email Configuration
REVIEWER_EMAIL_GROUP=your_reviewer_email
ADMIN_EMAILS=comma_separated_admin_emails
```

## Local Development

### Method 1: Using start.ps1 Script (Recommended)

The repository includes a PowerShell script `start.ps1` that automates the build and run process:

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd project_search
   ```

2. Install dependencies
   ```bash
   # Frontend dependencies
   cd frontend
   npm install
   
   # Backend dependencies
   cd ../backend
   pip install -r requirements.txt
   ```

3. Create and configure your `.env` file in the backend directory

4. Run the startup script
   ```powershell
   ./start.ps1
   ```

The script will:
- Build the frontend React application
- Copy the build files to the backend's dist directory
- Start the FastAPI application with hot-reload

### Method 2: Manual Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd project_search
   ```

2. Set up the frontend
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. Copy the build to the backend
   ```bash
   # From frontend directory
   cp -r dist ../backend/
   ```

4. Set up the backend
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

5. Start the backend server
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

The application will be available at http://localhost:8000

## Deployment to Azure Container Apps

### 1. Build and Push Docker Image

1. Login to Azure Container Registry
   ```bash
   az acr login --name yourContainerRegistry
   ```

2. Build the Docker image
   ```bash
   docker build -t project-search:latest .
   ```

3. Tag the image for your registry
   ```bash
   docker tag project-search:latest yourContainerRegistry.azurecr.io/project-search:latest
   ```

4. Push the image to the registry
   ```bash
   docker push yourContainerRegistry.azurecr.io/project-search:latest
   ```

### 2. Deploy to Azure Container Apps

Use the Azure CLI to deploy or update your Container App:

```bash
az containerapp update --name project-search --resource-group your-resource-group --image yourContainerRegistry.azurecr.io/project-search:latest
```

Alternatively, you can use the Azure Portal to create or update your Container App.

### Environment Configuration

Configure environment variables in the Azure Container App through:
- Azure Portal: Container Apps → your app → Settings → Configuration
- Azure CLI: Use the `--env-vars` parameter in your deployment command

## Project Workflow

### Adding a New Project
1. Click "Add your project" in the top-right corner
2. Enter the GitHub repository URL in the initial dialog
3. Review and edit the automatically extracted project information
4. Submit for review
5. Administrators receive an email notification

### Project Review Process
1. Administrators access the Admin Dashboard
2. Review pending project submissions
3. Edit project details if necessary
4. Approve or reject submissions
5. Approved projects are indexed for search

## API Documentation

When the FastAPI backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Add your license information here]

## Contact

dangiannone@microsoft.com