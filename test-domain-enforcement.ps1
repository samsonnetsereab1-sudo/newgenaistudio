# Domain Enforcement Test Script
# Run this outside VSCode after starting backend manually

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Domain Enforcement Test Suite" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

# Test 0: Isolated domain parsing (no AI, no crash risk)
Write-Host "Test 0: Isolated Domain Parser" -ForegroundColor Magenta
$body0 = @{ 
    prompt = 'Sentinel app with agents (CustodyBot, QualityBot), states (RECEIVED, IN_LAB), and OOS workflow with modal'
} | ConvertTo-Json
try {
    $resp0 = Invoke-WebRequest -Uri "http://localhost:4000/api/dev/test-domain" -Method POST -ContentType "application/json" -Body $body0 -UseBasicParsing -TimeoutSec 10
    $data0 = $resp0.Content | ConvertFrom-Json
    Write-Host "  ✓ Parser works!" -ForegroundColor Green
    Write-Host "    Agents: $($data0.summary.agentCount)" -ForegroundColor $(if($data0.summary.agentCount -eq 2){'Green'}else{'Yellow'})
    Write-Host "    Workflows: $($data0.summary.workflowCount)" -ForegroundColor $(if($data0.summary.workflowCount -eq 1){'Green'}else{'Yellow'})
    Write-Host "    States: $($data0.summary.stateCount)" -ForegroundColor $(if($data0.summary.stateCount -eq 2){'Green'}else{'Yellow'})
    if ($data0.parsed.agents) {
        $data0.parsed.agents | ForEach-Object { Write-Host "      - $($_.name)" -ForegroundColor Gray }
    }
} catch {
    Write-Host "  ✗ Parser failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    (This means the parser itself has a bug - fix before testing full flow)" -ForegroundColor Yellow
}

Write-Host ""

# Test 1: Prompt WITHOUT domain constructs (baseline)
Write-Host "Test 1: Baseline (no domain constructs)" -ForegroundColor Yellow
$body1 = @{ prompt = 'simple dashboard with metrics' } | ConvertTo-Json
try {
    $resp1 = Invoke-WebRequest -Uri "http://localhost:4000/api/generate" -Method POST -ContentType "application/json" -Body $body1 -UseBasicParsing -TimeoutSec 35
    $data1 = $resp1.Content | ConvertFrom-Json
    Write-Host "  ✓ Success: $($data1.elapsed)ms" -ForegroundColor Green
    Write-Host "    Agents: $($data1.agents.Count)" -ForegroundColor Gray
    Write-Host "    Workflows: $($data1.workflows.Count)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Prompt WITH agents keyword
Write-Host "Test 2: Agents Enforcement" -ForegroundColor Yellow
$body2 = @{ prompt = 'sample tracker with agents (CustodyBot, QualityBot)' } | ConvertTo-Json
try {
    $resp2 = Invoke-WebRequest -Uri "http://localhost:4000/api/generate" -Method POST -ContentType "application/json" -Body $body2 -UseBasicParsing -TimeoutSec 35
    $data2 = $resp2.Content | ConvertFrom-Json
    Write-Host "  ✓ Success: $($data2.elapsed)ms" -ForegroundColor Green
    Write-Host "    Agents: $($data2.agents.Count)" -ForegroundColor $(if($data2.agents.Count -gt 0){'Green'}else{'Red'})
    if ($data2.agents.Count -gt 0) {
        $data2.agents | ForEach-Object { Write-Host "      - $($_.name) ($($_.displayName))" -ForegroundColor Green }
    }
    Write-Host "    Workflows: $($data2.workflows.Count)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Full domain constructs (agents + workflows + states)
Write-Host "Test 3: Full Domain Constructs" -ForegroundColor Yellow
$body3 = @{ 
    prompt = 'Sentinel-GxP sample tracker with agents (CustodyBot, QualityBot), states (RECEIVED, IN_LAB, OOS_LOCK, RELEASED), and an OOS investigation workflow that opens a modal with 3 questions and photo capture'
} | ConvertTo-Json
try {
    $resp3 = Invoke-WebRequest -Uri "http://localhost:4000/api/generate" -Method POST -ContentType "application/json" -Body $body3 -UseBasicParsing -TimeoutSec 40
    $data3 = $resp3.Content | ConvertFrom-Json
    Write-Host "  ✓ Success: $($data3.elapsed)ms" -ForegroundColor Green
    
    Write-Host "    Agents: $($data3.agents.Count)" -ForegroundColor $(if($data3.agents.Count -eq 2){'Green'}else{'Yellow'})
    if ($data3.agents.Count -gt 0) {
        $data3.agents | ForEach-Object { Write-Host "      - $($_.name)" -ForegroundColor Green }
    }
    
    Write-Host "    Workflows: $($data3.workflows.Count)" -ForegroundColor $(if($data3.workflows.Count -eq 1){'Green'}else{'Yellow'})
    if ($data3.workflows.Count -gt 0) {
        $data3.workflows | ForEach-Object { 
            Write-Host "      - $($_.name)" -ForegroundColor Green
            if ($_.modal) {
                Write-Host "        Modal: $($_.modal.questions.Count) questions, Photo: $($_.modal.capturePhoto)" -ForegroundColor Gray
            }
        }
    }
    
    if ($data3.schema -and $data3.schema.entities -and $data3.schema.entities[0].states) {
        $stateCount = ($data3.schema.entities[0].states.PSObject.Properties | Measure-Object).Count
        Write-Host "    States: $stateCount in entity '$($data3.schema.entities[0].name)'" -ForegroundColor $(if($stateCount -eq 4){'Green'}else{'Yellow'})
    }
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Test Summary:" -ForegroundColor Cyan
Write-Host "  Expected: Test 0 should parse successfully" -ForegroundColor Gray
Write-Host "  Expected: Test 2 should have 2 agents" -ForegroundColor Gray
Write-Host "  Expected: Test 3 should have 2 agents, 1 workflow, 4 states" -ForegroundColor Gray
Write-Host "==================================`n" -ForegroundColor Cyan
