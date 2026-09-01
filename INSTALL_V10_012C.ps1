param(
  [string]$ProjectRoot = "C:\rose-ia-mobile-clean"
)

$ErrorActionPreference = "Stop"

$app = Join-Path $ProjectRoot "App.tsx"
$hookDir = Join-Path $ProjectRoot "src\core\v10\app_hook"
$createHook = Join-Path $hookDir "createRoseAppHook.ts"
$indexFile = Join-Path $hookDir "index.ts"
$formatterTarget = Join-Path $hookDir "V10AppResponse.ts"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

foreach ($required in @($app, $createHook, $indexFile)) {
  if (!(Test-Path $required)) {
    throw "Fichier requis introuvable : $required"
  }
}

$content = Get-Content $app -Raw -Encoding UTF8

if ($content -notmatch 'Rose V10-012B - Safe App Hook') {
  throw "V10-012B n'est pas détectée dans App.tsx. Aucun changement appliqué."
}

if ($content -notmatch 'const analyserMessageLegacy = \(\) => \{') {
  throw "Fonction legacy V10-012B introuvable. Aucun changement appliqué."
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $ProjectRoot "backup_v10_012c_$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Copy-Item $app (Join-Path $backupDir "App.tsx") -Force
Copy-Item $createHook (Join-Path $backupDir "createRoseAppHook.ts") -Force
Copy-Item $indexFile (Join-Path $backupDir "index.ts") -Force
if (Test-Path $formatterTarget) {
  Copy-Item $formatterTarget (Join-Path $backupDir "V10AppResponse.ts") -Force
}

try {
  # 1) Installe le formatter et createRoseAppHook compatible options explicites.
  Copy-Item (Join-Path $scriptDir "V10AppResponse.ts") $formatterTarget -Force
  Copy-Item (Join-Path $scriptDir "createRoseAppHook.ts") $createHook -Force

  # 2) Export du formatter, sans doublon.
  $indexContent = Get-Content $indexFile -Raw -Encoding UTF8
  if ($indexContent -notmatch 'V10AppResponse') {
    $indexContent = $indexContent.TrimEnd() + "`r`nexport * from `"./V10AppResponse`";`r`n"
    Set-Content $indexFile $indexContent -Encoding UTF8 -NoNewline
  }

  # 3) Met à jour l'import App.tsx.
  $oldImport = 'import { createRoseAppHook } from "./src/core/v10/app_hook";'
  $newImport = 'import { createRoseAppHook, formatRoseV10AppResponse } from "./src/core/v10/app_hook";'

  if ($content -match [regex]::Escape($oldImport)) {
    $content = $content.Replace($oldImport, $newImport)
  } elseif ($content -notmatch 'formatRoseV10AppResponse') {
    throw "Import V10-012B introuvable dans App.tsx."
  }

  # 4) Remplace uniquement le bloc V10-012B par V10-012C.
  $startMarker = '  // Rose V10-012B - Safe App Hook'
  $endMarker = '  const analyserMessageLegacy = () => {'

  $start = $content.IndexOf($startMarker)
  $end = $content.IndexOf($endMarker)

  if ($start -lt 0 -or $end -lt 0 -or $end -le $start) {
    throw "Bloc V10-012B impossible à localiser."
  }

  $newBlock = @'
  // Rose V10-012C - Controlled V10 Activation
  // V10 est actif pour l'analyse/routage interne uniquement.
  // Aucune autonomie ni action externe automatique n'est autorisée.
  // En cas d'erreur, le hook retombe automatiquement sur V7.4.
  const roseAppHook = useMemo(
    () =>
      createRoseAppHook(
        async () => {
          analyserMessageLegacy();
          return { handledBy: "legacy" };
        },
        {
          enabled: true,
          fallbackToLegacy: true,
          enableAutonomy: false,
        }
      ),
    [message]
  );

  const analyserMessage = async () => {
    if (!message.trim()) return;

    const messageEnvoye = message;

    const result = await roseAppHook.run({
      message: messageEnvoye,
      metadata: {
        source: "RoseScreen",
        appVersion: "V10-012C",
        autonomyEnabled: false,
        externalActionsAllowed: false,
      },
    });

    console.log(
      `[Rose V10-012C] mode=${result.mode}`,
      result.v10Error ? `fallback=${result.v10Error}` : ""
    );

    // En mode V10, on conserve les comportements sûrs de l'app :
    // mémorisation locale/cloud, journal, TTS et remise à zéro du champ.
    if (result.mode === "v10") {
      const categorie = detecterCategorie(messageEnvoye);
      const importance = detecterImportance(messageEnvoye);

      ajouterMemoire(
        messageEnvoye,
        categorie,
        importance
      );

      const summary =
        formatRoseV10AppResponse(
          result.value
        );

      setRoseReponse(summary.text);
      ajouterJournal(
        `V10-012C : ${summary.intent ?? "general"} / ${summary.selectedAgents.join(", ") || "aucun agent"}`
      );
      parler(summary.text);
      setMessage("");
    }
  };

'@

  $content =
    $content.Substring(0, $start) +
    $newBlock +
    $content.Substring($end)

  Set-Content $app $content -Encoding UTF8 -NoNewline

  # 5) Vérifications.
  $checkApp = Get-Content $app -Raw -Encoding UTF8
  $checks = @(
    'Rose V10-012C - Controlled V10 Activation',
    'enabled: true',
    'fallbackToLegacy: true',
    'enableAutonomy: false',
    'externalActionsAllowed: false',
    'formatRoseV10AppResponse',
    'const analyserMessageLegacy = () => {',
    'analyserMessage={analyserMessage}'
  )

  foreach ($check in $checks) {
    if ($checkApp -notmatch [regex]::Escape($check)) {
      throw "Vérification App.tsx échouée : $check"
    }
  }

  if (!(Test-Path $formatterTarget)) {
    throw "V10AppResponse.ts non installé."
  }

  Write-Host ""
  Write-Host "OK - Rose V10-012C installée." -ForegroundColor Green
  Write-Host "Backup complet : $backupDir" -ForegroundColor Cyan
  Write-Host "V10 : ACTIF pour analyse/routage interne." -ForegroundColor Green
  Write-Host "Autonomie : DESACTIVEE." -ForegroundColor Yellow
  Write-Host "Actions externes automatiques : DESACTIVEES." -ForegroundColor Yellow
  Write-Host "Fallback V7.4 : ACTIF." -ForegroundColor Green
  Write-Host ""
  Write-Host "Test : npx expo start --lan -c" -ForegroundColor Cyan
}
catch {
  Copy-Item (Join-Path $backupDir "App.tsx") $app -Force
  Copy-Item (Join-Path $backupDir "createRoseAppHook.ts") $createHook -Force
  Copy-Item (Join-Path $backupDir "index.ts") $indexFile -Force

  $formatterBackup = Join-Path $backupDir "V10AppResponse.ts"
  if (Test-Path $formatterBackup) {
    Copy-Item $formatterBackup $formatterTarget -Force
  } elseif (Test-Path $formatterTarget) {
    Remove-Item $formatterTarget -Force
  }

  Write-Host "ERREUR - restauration automatique de V10-012B." -ForegroundColor Red
  throw
}
