# Rose V10-013 FIXED

Cette correction évite le conflit avec le `index.ts` racine du projet.

Le premier pack V10-013 contenait un fichier générique `index.ts`. Si le ZIP était extrait directement dans `C:\rose-ia-mobile-clean`, ce fichier pouvait remplacer l'entrée principale React Native et provoquer :

`AppRegistryBinding::StartSurface failed. Global was not installed`

## 1. Restaurer V10-012D avant installation

Dans PowerShell :

```powershell
cd C:\rose-ia-mobile-clean

git restore App.tsx index.ts src/core/v10/app_hook/V10AppResponse.ts src/core/v10/index.ts
```

Supprime ensuite uniquement le dossier créé par V10-013 s'il existe :

```powershell
Remove-Item .\src\core\v10\execution_pipeline -Recurse -Force -ErrorAction SilentlyContinue
```

Puis vérifie :

```powershell
git status
```

Les fichiers du pack/installateur éventuellement non suivis peuvent rester ; ils n'affectent pas l'application.

## 2. Installer le pack corrigé

Extraire ce ZIP dans un dossier temporaire, par exemple :

`C:\rose-v10-013-fixed\`

Puis :

```powershell
powershell -ExecutionPolicy Bypass -File "C:\rose-v10-013-fixed\INSTALL_V10_013_FIXED.ps1" -ProjectRoot "C:\rose-ia-mobile-clean"
```

Le nouvel installateur vérifie par hash que `C:\rose-ia-mobile-clean\index.ts` reste strictement inchangé.

## 3. Test

```powershell
cd C:\rose-ia-mobile-clean
npx expo start --lan -c
```

Attendu :

`[Rose V10-013] mode=v10`
