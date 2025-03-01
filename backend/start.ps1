# Define full paths for frontend and backend directories
$frontendPath = "D:\projects\project_search\frontend"
$backendPath = "D:\projects\project_search\backend"

# Navigate to the frontend directory
Write-Host "Navigating to $frontendPath"
Set-Location $frontendPath

# Remove the old dist directory in the backend
Write-Host "Removing old dist directory at $($backendPath)\dist..."
Remove-Item -Recurse -Force "$($backendPath)\dist"

# Build the frontend
Write-Host "Building frontend..."
npm run build

# Check for build errors
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed!"
    Set-Location $backendPath
    exit 1
}

# Copy the new dist directory to the backend
Write-Host "Copying dist to $($backendPath)\dist..."
Copy-Item -Path "dist" -Destination "$($backendPath)\dist" -Recurse

# Navigate to the backend directory
Write-Host "Navigating to $backendPath"
Set-Location $backendPath

# Run the FastAPI application using Uvicorn
Write-Host "Starting FastAPI application with Uvicorn..."
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# Alternative: Run using Python directly
# Write-Host "Starting FastAPI application..."
# python app.py