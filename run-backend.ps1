# Start Backend Server (Run outside VSCode)
# This script starts the backend and keeps it running

Write-Host "Starting NewGen Studio Backend..." -ForegroundColor Cyan

# Kill any existing Node processes on port 4000
Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
    $connections = Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq 4000 }
    if ($connections) {
        Write-Host "Killing existing process on port 4000 (PID: $($_.Id))" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep 2

# Start backend
Set-Location "c:\NewGenAPPs\newgen-studio\backend"
Write-Host "`nBackend starting on http://0.0.0.0:4000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Gray

node server.js
