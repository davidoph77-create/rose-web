param(
  [string]$ProjectRoot = "C:\rose-ia-mobile-clean"
)

$ErrorActionPreference = "Stop"
$app = Join-Path $ProjectRoot "App.tsx"

if (!(Test-Path $app)) {
  throw "App.tsx introuvable : $app"
}

$content = Get-Content $app -Raw -Encoding UTF8

$importLine = 'import { createRoseAppHook } from "./src/core/v10/app_hook";'
$legacyAnchor = '  const analyserMessage = () => {'
$screenAnchor = '              analyserMessage={analyserMessage}'

if ($content -notmatch [regex]::Escape($legacyAnchor)) {
  throw "Ancre analyserMessage introuvable. Aucun fichier n''a ete modifie."
}

if ($content -notmatch [regex]::Escape($screenAnchor)) {
  throw "Ancre RoseScreen/analyserMessage introuvable. Aucun fichier n''a ete modifie."
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = Join-Path $ProjectRoot "App.tsx.backup_V10_012B_$timestamp"
Copy-Item $app $backup -Force

try {
  if ($content -notmatch [regex]::Escape($importLine)) {
    $firstImport = 'import RoseScreen from "./src/screens/RoseScreen";'
    if ($content -notmatch [regex]::Escape($firstImport)) {
      throw "Premier import attendu introuvable."
    }
    $content = $content.Replace($firstImport, "$firstImport`r`n$importLine")
  }

  # Renomme la fonction existante sans modifier son comportement.
  $content = $content.Replace(
    $legacyAnchor,
    '  const analyserMessageLegacy = () => {'
  )

  # Insere le hook juste avant la fonction legacy.
  $hookBlock = @'
  // Rose V10-012B - Safe App Hook
  // V10 reste desactive par defaut dans RoseAppFeatureFlag.ts.
  // Le comportement V7.4 actuel reste le chemin de secours.
  const roseAppHook = useMemo(
    () =>
      createRoseAppHook(async () => {
        analyserMessageLegacy();
        return { handledBy: "legacy" };
      }),
    [message]
  );

  const analyserMessage = async () => {
    if (!message.trim()) return;

    const messageEnvoye = message;

    const result = await roseAppHook.run({
      message: messageEnvoye,
      metadata: {
        source: "RoseScreen",
        appVersion: "V10-012B",
        autonomyEnabled: false,
      },
    });

    console.log(
      `[Rose V10-012B] mode=${result.mode}`,
      result.v10Error ? `fallback=${result.v10Error}` : ""
    );
  };

'@

  $legacyRenamed = '  const analyserMessageLegacy = () => {'
  $content = $content.Replace($legacyRenamed, $hookBlock + $legacyRenamed)

  Set-Content $app $content -Encoding UTF8 -NoNewline

  # Verifications apres ecriture.
  $check = Get-Content $app -Raw -Encoding UTF8
  foreach ($required in @(
    $importLine,
    'const roseAppHook = useMemo(',
    'const analyserMessage = async () => {',
    'const analyserMessageLegacy = () => {',
    'analyserMessage={analyserMessage}'
  )) {
    if ($check -notmatch [regex]::Escape($required)) {
      throw "Verification echouee : $required"
    }
  }

  Write-Host ""
  Write-Host "OK - Rose V10-012B installe." -ForegroundColor Green
  Write-Host "Backup : $backup" -ForegroundColor Cyan
  Write-Host "V10 reste DESACTIVE par defaut." -ForegroundColor Yellow
  Write-Host "Le comportement legacy reste preserve." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Teste maintenant avec : npx expo start --lan -c" -ForegroundColor Cyan
}
catch {
  Copy-Item $backup $app -Force
  Write-Host "ERREUR - restauration automatique du backup." -ForegroundColor Red
  throw
}
