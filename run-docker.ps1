# Script to build and run the Docker container

Write-Host "Building Docker container for Project Search..." -ForegroundColor Green
docker-compose build

Write-Host "Starting the container..." -ForegroundColor Green
docker-compose up -d

Write-Host "Container is now running!" -ForegroundColor Green
Write-Host "You can access the application at http://localhost:8000" -ForegroundColor Cyan
Write-Host "API documentation is available at http://localhost:8000/docs" -ForegroundColor Cyan

Write-Host "`nTo stop the container, run: docker-compose down" -ForegroundColor Yellow 