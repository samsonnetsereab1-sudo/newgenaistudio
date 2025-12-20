# Restart Backend Script
Write-Host "🔄 Restarting NewGen Studio Backend..." -ForegroundColor Cyan

# Kill any process using port 4000
Write-Host "Stopping existing backend on port 4000..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

# Wait for port to be released
Start-Sleep -Seconds 2

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Green
Set-Location backend
node server.js
