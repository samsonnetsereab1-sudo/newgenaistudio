# Test Optimized Timeouts with OpenAI Routing
# Run this in a regular PowerShell window (NOT in VSCode terminal)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  OPTIMIZED TIMEOUT TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Optimizations:" -ForegroundColor Yellow
Write-Host "  - AI Timeout: 18s → 12s (faster failure)" -ForegroundColor Gray
Write-Host "  - Retries: 0 → 1 (2 attempts total)" -ForegroundColor Gray
Write-Host "  - Domain prompts → OpenAI (better for agents/workflows)" -ForegroundColor Gray
Write-Host ""

# Test 1: Normal prompt (Gemini)
Write-Host "=== Test 1: Normal Prompt (Gemini) ===" -ForegroundColor Cyan
$body = @{ prompt = 'simple dashboard with metrics' } | ConvertTo-Json
$sw = [System.Diagnostics.Stopwatch]::StartNew()
try {
    $resp = iwr http://localhost:4000/api/generate -UseBasicParsing -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 30
    $sw.Stop()
    $data = $resp.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host "  Time: $([math]::Round($sw.Elapsed.TotalSeconds,1))s" -ForegroundColor Cyan
    Write-Host "  Mode: $($data.mode)" -ForegroundColor Cyan
    Write-Host "  Children: $($data.children.Count)" -ForegroundColor Cyan
    Write-Host "  Problems: $($data.problems.Count)" -ForegroundColor $(if($data.problems.Count -eq 0){'Green'}else{'Yellow'})
} catch {
    $sw.Stop()
    Write-Host "❌ FAILED after $([math]::Round($sw.Elapsed.TotalSeconds,1))s" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Start-Sleep 2

# Test 2: Domain prompt (OpenAI routing)
Write-Host "=== Test 2: Domain Prompt (OpenAI Routing) ===" -ForegroundColor Cyan
Write-Host "  Should detect 'agents' keyword and route to OpenAI..." -ForegroundColor Gray
$body = @{ prompt = 'Sentinel-GxP sample tracker with agents (CustodyBot, QualityBot), states (RECEIVED, IN_LAB, OOS_LOCK, RELEASED), and an OOS investigation workflow that opens a modal with 3 questions and photo capture' } | ConvertTo-Json
$sw = [System.Diagnostics.Stopwatch]::StartNew()
try {
    $resp = iwr http://localhost:4000/api/generate -UseBasicParsing -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 30
    $sw.Stop()
    $data = $resp.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host "  Time: $([math]::Round($sw.Elapsed.TotalSeconds,1))s" -ForegroundColor Cyan
    Write-Host "  Mode: $($data.mode)" -ForegroundColor Cyan
    Write-Host "  Agents: $($data.agents.Count)" -ForegroundColor Yellow
    Write-Host "  Workflows: $($data.workflows.Count)" -ForegroundColor Yellow
    Write-Host "  Problems: $($data.problems.Count)" -ForegroundColor $(if($data.problems.Count -eq 0){'Green'}else{'Yellow'})
    
    if($data.agents.Count -gt 0){
        Write-Host "  Agent names: $(($data.agents.name) -join ', ')" -ForegroundColor Gray
    }
    if($data.workflows.Count -gt 0){
        Write-Host "  Workflow names: $(($data.workflows.name) -join ', ')" -ForegroundColor Gray
    }
    
    Write-Host "`n  Expected: 2 agents, 1 workflow" -ForegroundColor DarkGray
    if($data.agents.Count -eq 2 -and $data.workflows.Count -ge 1){
        Write-Host "  ✓ Domain enforcement working!" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Domain enforcement may need adjustment" -ForegroundColor Yellow
    }
} catch {
    $sw.Stop()
    Write-Host "❌ FAILED after $([math]::Round($sw.Elapsed.TotalSeconds,1))s" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TESTS COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
