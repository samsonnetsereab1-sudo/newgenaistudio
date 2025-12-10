# NewGen Studio Backend Startup Script
# Run this from the repository root

Write-Host "🚀 Starting NewGen Studio Backend..." -ForegroundColor Cyan
Write-Host ""

# Set environment variables
$env:PORT = "4000"
$env:NODE_ENV = "development"
$env:FRONTEND_ORIGIN = "http://localhost:5175"
$env:LOG_LEVEL = "info"

# Navigate to backend directory
Set-Location -Path "$PSScriptRoot\backend"

# Display configuration
Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   PORT: $env:PORT"
Write-Host "   NODE_ENV: $env:NODE_ENV"
Write-Host "   FRONTEND_ORIGIN: $env:FRONTEND_ORIGIN"
Write-Host ""

# Check if server.js exists
if (Test-Path "server.js") {
    Write-Host "Found server.js" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting server..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""
    
    # Start the server
    node server.js
} else {
    Write-Host "Error: server.js not found in backend directory" -ForegroundColor Red
    Write-Host "Current directory: $( Get-Location )" -ForegroundColor Gray
    exit 1
}
