param(
  [string]$ProjectRoot = "C:\rose-ia-mobile-clean"
)

$ErrorActionPreference = "Stop"

$app = Join-Path $ProjectRoot "App.tsx"
$rootIndex = Join-Path $ProjectRoot "index.ts"
$v10 = Join-Path $ProjectRoot "src\core\v10"
$pipelineDir = Join-Path $v10 "execution_pipeline"
$appHookDir = Join-Path $v10 "app_hook"
$responseTarget = Join-Path $appHookDir "V10AppResponse.ts"
$v10Index = Join-Path $v10 "index.ts"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

foreach ($required in @($app, $rootIndex, $appHookDir, $responseTarget)) {
  if (!(Test-Path $required)) {
    throw "Élément requis introuvable : $required"
  }
}

# Protection explicite: ne jamais toucher à l'index.ts racine.
$rootBefore = Get-FileHash $rootIndex -Algorithm SHA256

$appContent = Get-Content $app -Raw -Encoding UTF8
if ($appContent -notmatch 'Rose V10-012D - Rich Cognitive Response') {
  throw "V10-012D n'est pas détectée dans App.tsx. Restaure d'abord V10-012D."
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $env:TEMP "RoseV10Backups\V10_013_FIXED_$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Copy-Item $app (Join-Path $backupDir "App.tsx") -Force
Copy-Item $responseTarget (Join-Path $backupDir "V10AppResponse.ts") -Force
Copy-Item $rootIndex (Join-Path $backupDir "root_index.ts") -Force
if (Test-Path $v10Index) {
  Copy-Item $v10Index (Join-Path $backupDir "v10_index.ts") -Force
}
if (Test-Path $pipelineDir) {
  Copy-Item $pipelineDir (Join-Path $backupDir "execution_pipeline") -Recurse -Force
}

try {
  New-Item -ItemType Directory -Path $pipelineDir -Force | Out-Null

  Copy-Item (Join-Path $scriptDir "ExecutionTypes.ts") (Join-Path $pipelineDir "ExecutionTypes.ts") -Force
  Copy-Item (Join-Path $scriptDir "SafeAgentExecutor.ts") (Join-Path $pipelineDir "SafeAgentExecutor.ts") -Force
  Copy-Item (Join-Path $scriptDir "CognitiveExecutionPipeline.ts") (Join-Path $pipelineDir "CognitiveExecutionPipeline.ts") -Force
  Copy-Item (Join-Path $scriptDir "ExecutionPipelineIndex.ts") (Join-Path $pipelineDir "index.ts") -Force
  Copy-Item (Join-Path $scriptDir "V10AppResponse.ts") $responseTarget -Force

  if (Test-Path $v10Index) {
    $indexContent = Get-Content $v10Index -Raw -Encoding UTF8
    if ($indexContent -notmatch 'execution_pipeline') {
      $indexContent = $indexContent.TrimEnd() + "`r`nexport * from `"./execution_pipeline`";`r`n"
      Set-Content $v10Index $indexContent -Encoding UTF8 -NoNewline
    }
  }

  $appContent = $appContent.Replace('Rose V10-012D - Rich Cognitive Response','Rose V10-013 - Cognitive Execution Pipeline')
  $appContent = $appContent.Replace('appVersion: "V10-012D"','appVersion: "V10-013"')
  $appContent = $appContent.Replace('[Rose V10-012D]','[Rose V10-013]')
  $appContent = $appContent.Replace(
    'V10-012D : ${summary.intent ?? "general"} / ${summary.selectedAgents.join(", ") || "aucun agent"} / validation=${summary.requiresValidation ? "oui" : "non"}',
    'V10-013 : ${summary.intent ?? "general"} / ${summary.selectedAgents.join(", ") || "aucun agent"} / ${summary.executionSummary ?? "pipeline exécuté"}'
  )
  Set-Content $app $appContent -Encoding UTF8 -NoNewline

  # Vérifie que l'index racine n'a absolument pas changé.
  $rootAfter = Get-FileHash $rootIndex -Algorithm SHA256
  if ($rootBefore.Hash -ne $rootAfter.Hash) {
    throw "Protection déclenchée : index.ts racine a changé."
  }

  Write-Host ""
  Write-Host "OK - Rose V10-013 FIXED installée." -ForegroundColor Green
  Write-Host "index.ts racine : PROTÉGÉ / INCHANGÉ." -ForegroundColor Green
  Write-Host "Pipeline cognitif : ACTIF." -ForegroundColor Green
  Write-Host "Fallback V7.4 : ACTIF." -ForegroundColor Green
  Write-Host "Autonomie externe : DÉSACTIVÉE." -ForegroundColor Yellow
  Write-Host "Backup : $backupDir" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Test : npx expo start --lan -c" -ForegroundColor Cyan
}
catch {
  Copy-Item (Join-Path $backupDir "App.tsx") $app -Force
  Copy-Item (Join-Path $backupDir "V10AppResponse.ts") $responseTarget -Force
  Copy-Item (Join-Path $backupDir "root_index.ts") $rootIndex -Force

  if (Test-Path $pipelineDir) { Remove-Item $pipelineDir -Recurse -Force }
  $pb = Join-Path $backupDir "execution_pipeline"
  if (Test-Path $pb) { Copy-Item $pb $pipelineDir -Recurse -Force }

  if ((Test-Path $v10Index) -and (Test-Path (Join-Path $backupDir "v10_index.ts"))) {
    Copy-Item (Join-Path $backupDir "v10_index.ts") $v10Index -Force
  }

  Write-Host "ERREUR - restauration automatique effectuée." -ForegroundColor Red
  throw
}
