# Rose V10-012D — Rich Cognitive Response

Cette étape enrichit la première réponse V10 sans autoriser d'action externe.

## Nouveautés
Rose affiche maintenant :
- l'intention détectée ;
- les agents V10 sélectionnés ;
- le niveau de confiance si le runtime le fournit ;
- le besoin de validation ;
- une proposition d'action sûre liée à l'intention.

## Sécurité inchangée
- fallback V7.4 actif ;
- autonomie V10 désactivée ;
- aucune action Web réelle automatique ;
- aucun événement calendrier créé automatiquement ;
- aucune action entreprise externe automatique.

## Installation

Copier les fichiers du ZIP dans :

`C:\rose-ia-mobile-clean\`

Puis :

```powershell
cd C:\rose-ia-mobile-clean
powershell -ExecutionPolicy Bypass -File .\INSTALL_V10_012D.ps1
```

## Test

```powershell
npx expo start --lan -c
```

Essayer :

`Rose organise mon objectif en plusieurs étapes`

Puis :

`Rose prépare un rendez-vous demain`

Dans le terminal :

`[Rose V10-012D] mode=v10`

La réponse doit être plus complète que V10-012C et contenir une proposition, tout en indiquant la validation quand elle est requise.

## Git après validation

```powershell
git add .
git commit -m "Rose V10-012D Rich Cognitive Response"
git push origin main
```
