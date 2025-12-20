param(
  [string]$Url = "http://localhost:4000"
)

Write-Host "=== Domain Enforcement Smoke Test ===" -ForegroundColor Cyan

# Health check
try {
  $health = Invoke-WebRequest "$Url/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop | Select-Object -ExpandProperty Content | ConvertFrom-Json
  Write-Host " Backend: $($health.status)" -ForegroundColor Green
} catch {
  Write-Host " Backend unreachable at $Url (start backend first)" -ForegroundColor Red
  exit 1
}

# Parser test
$prompt = 'Sentinel-GxP sample tracker with agents (CustodyBot, QualityBot), states (RECEIVED, IN_LAB, OOS_LOCK, RELEASED), and an OOS investigation workflow that opens a modal with 3 questions and photo capture'
$body = @{ prompt = $prompt } | ConvertTo-Json
$parsed = Invoke-WebRequest "$Url/api/dev/test-domain" -UseBasicParsing -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 10 | Select-Object -ExpandProperty Content | ConvertFrom-Json
Write-Host (" Parser -> agents={0} workflows={1} states={2} modal={3}" -f $parsed.summary.agentCount, $parsed.summary.workflowCount, $parsed.summary.stateCount, $parsed.parsed.hasModal) -ForegroundColor Yellow

# Generate test
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$resp = Invoke-WebRequest "$Url/api/generate" -UseBasicParsing -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 40 | Select-Object -ExpandProperty Content | ConvertFrom-Json
$sw.Stop()

$agentCount = if($resp.agents){ $resp.agents.Count } else { 0 }
$wfCount = if($resp.workflows){ $resp.workflows.Count } else { 0 }

Write-Host (" Generate -> {0}s | mode={1} | agents={2} | workflows={3} | problems={4}" -f [math]::Round($sw.Elapsed.TotalSeconds,1), $resp.mode, $agentCount, $wfCount, $resp.problems.Count)

# Print names and states if present
if($agentCount -gt 0){
  Write-Host (" Agents: " + (($resp.agents | Select-Object -ExpandProperty name) -join ', ')) -ForegroundColor Gray
}
if($wfCount -gt 0){
  Write-Host (" Workflows: " + (($resp.workflows | Select-Object -ExpandProperty name) -join ', ')) -ForegroundColor Gray
  $wf0 = $resp.workflows[0]
  if($wf0.modal){
    $qCount = if($wf0.modal.questions){ $wf0.modal.questions.Count } else { 0 }
    Write-Host (" Modal: title='" + $wf0.modal.title + "' questions=" + $qCount + " photo=" + ($wf0.modal.capturePhoto -as [bool])) -ForegroundColor Gray
  }
}
if($resp.schema -and $resp.schema.entities){
  $sample = $resp.schema.entities | Where-Object { $_.name -like '*Sample*' -or $_.name -like '*sample*' }
  if(-not $sample){ $sample = $resp.schema.entities | Select-Object -First 1 }
  if($sample -and $sample.states){
    $stateNames = ($sample.states | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name -ErrorAction SilentlyContinue)
    if(-not $stateNames){
      # states might be an array format
      if($sample.states -is [System.Array]){
        $stateNames = @(); $sample.states | ForEach-Object { if($_ -is [string]){ $stateNames += $_ } elseif($_.name){ $stateNames += $_.name } }
      }
    }
    if($stateNames){ Write-Host (" Entity states: " + ($stateNames -join ', ')) -ForegroundColor Gray }
  }
}

Write-Host "=== Done ===" -ForegroundColor Cyan
