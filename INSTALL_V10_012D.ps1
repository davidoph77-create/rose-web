param(
  [string]$ProjectRoot = "C:\rose-ia-mobile-clean"
)

$ErrorActionPreference = "Stop"

$app = Join-Path $ProjectRoot "App.tsx"
$responseFile = Join-Path $ProjectRoot "src\core\v10\app_hook\V10AppResponse.ts"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (!(Test-Path $app)) {
  throw "App.tsx introuvable : $app"
}

if (!(Test-Path $responseFile)) {
  throw "V10AppResponse.ts introuvable. V10-012C doit être installée avant V10-012D."
}

$appContent = Get-Content $app -Raw -Encoding UTF8

if ($appContent -notmatch 'Rose V10-012C - Controlled V10 Activation') {
  throw "V10-012C n'est pas détectée dans App.tsx. Aucun changement appliqué."
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $ProjectRoot "backup_v10_012d_$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Copy-Item $responseFile (Join-Path $backupDir "V10AppResponse.ts") -Force
Copy-Item $app (Join-Path $backupDir "App.tsx") -Force

try {
  Copy-Item (Join-Path $scriptDir "V10AppResponse.ts") $responseFile -Force

  # Mise à jour légère du marqueur de phase dans App.tsx.
  $appContent = $appContent.Replace(
    'Rose V10-012C - Controlled V10 Activation',
    'Rose V10-012D - Rich Cognitive Response'
  )

  $appContent = $appContent.Replace(
    'appVersion: "V10-012C"',
    'appVersion: "V10-012D"'
  )

  $appContent = $appContent.Replace(
    '[Rose V10-012C]',
    '[Rose V10-012D]'
  )

  $appContent = $appContent.Replace(
    'V10-012C : ${summary.intent ?? "general"} / ${summary.selectedAgents.join(", ") || "aucun agent"}',
    'V10-012D : ${summary.intent ?? "general"} / ${summary.selectedAgents.join(", ") || "aucun agent"} / validation=${summary.requiresValidation ? "oui" : "non"}'
  )

  Set-Content $app $appContent -Encoding UTF8 -NoNewline

  $check = Get-Content $app -Raw -Encoding UTF8

  foreach ($required in @(
    'Rose V10-012D - Rich Cognitive Response',
    'appVersion: "V10-012D"',
    '[Rose V10-012D]',
    'enableAutonomy: false',
    'fallbackToLegacy: true'
  )) {
    if ($check -notmatch [regex]::Escape($required)) {
      throw "Vérification échouée : $required"
    }
  }

  Write-Host ""
  Write-Host "OK - Rose V10-012D installée." -ForegroundColor Green
  Write-Host "Backup : $backupDir" -ForegroundColor Cyan
  Write-Host "Réponse cognitive enrichie : ACTIVE." -ForegroundColor Green
  Write-Host "Fallback V7.4 : ACTIF." -ForegroundColor Green
  Write-Host "Autonomie : DESACTIVEE." -ForegroundColor Yellow
  Write-Host "Actions externes automatiques : DESACTIVEES." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Test : npx expo start --lan -c" -ForegroundColor Cyan
}
catch {
  Copy-Item (Join-Path $backupDir "V10AppResponse.ts") $responseFile -Force
  Copy-Item (Join-Path $backupDir "App.tsx") $app -Force
  Write-Host "ERREUR - restauration automatique de V10-012C." -ForegroundColor Red
  throw
}
