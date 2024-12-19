# Project Search Platform

A modern web application built with React and Python that enables users to discover, submit, and manage AI/ML projects. The platform features semantic search capabilities powered by Azure Cognitive Search and Azure OpenAI, along with a streamlined project submission and review workflow.

## Features

### Project Search
- Natural language search functionality using Azure OpenAI embeddings
- Advanced filtering options for programming languages, frameworks, Azure services, and more
- Rich project cards displaying comprehensive project information
- Sort capabilities based on various criteria

### Project Submission
- Simple GitHub repository submission process
- Automated project information extraction from README files
- User-friendly review and editing interface
- Email notifications for administrators

### Admin Dashboard
- Dedicated admin interface for managing project submissions
- Review and approval workflow
- Ability to edit and enhance project metadata
- Project rejection capabilities with reason tracking
- Manage approved tags

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Radix UI components
- Lucide React icons
- React Toastify for notifications

### Backend
- Python with Flask
- Azure OpenAI for query translation and embeddings, as well as tag standardization
- Azure AI Search for hybrid search and filtering
- Azure Cosmos DB for metadata storage
- Azure Communication Services for email notifications

### Deployment

- Azure App Service
- Application Insights

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

### Search Functionality
1. Enter natural language queries in the search box
2. Apply filters using the sidebar
3. View detailed project information in result cards
4. Access project repositories directly through GitHub links

## Setup Requirements

### Azure Services
- Azure OpenAI instance
- Azure AI Search service
- Azure Cosmos DB account
- Azure Communication Services setup
- Azure Application Insights resource (not needed for local)
- Azure App Service (not needed for local)

### Environment Variables
```
# Azure OpenAI
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_DEPLOYMENT_NAME=

# Azure Cognitive Search
AZURE_SEARCH_ENDPOINT=
AZURE_SEARCH_KEY=
AZURE_SEARCH_INDEX=

# Azure Cosmos DB
COSMOS_HOST=
COSMOS_DATABASE_ID=
COSMOS_CONTAINER_ID=

# Azure Communication Services
COMMUNICATION_SERVICES_CONNECTION_STRING=

# Application Insights
APPINSIGHTS_INSTRUMENTATIONKEY=

# Email Configuration
REVIEWER_EMAIL_GROUP=
```

## Local Development

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your Azure service credentials
```

5. Start the development servers
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
python app.py
```

## Web App Deployment

The application is designed to be deployed as an Azure Web App with the following considerations:

1. Enable Azure AD authentication if required
2. Configure CORS settings for your domain
3. Set up environment variables in the Azure Web App configuration
4. Enable Application Insights monitoring
5. Configure scaling rules based on expected traffic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Add your license information here]

## Contact

dangiannone@microsoft.com