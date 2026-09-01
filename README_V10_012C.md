# Rose V10-012C — Controlled V10 Activation

Première activation réelle du chemin V10 dans `App.tsx`.

## Ce que cette étape active
Le message de l'onglet Rose passe réellement par :

`RoseScreen -> Safe App Hook -> Rose OS V10 -> Cognitive Layer -> routage agent`

Rose affiche ensuite un résumé sûr du traitement V10 :
- intention détectée ;
- agent(s) sélectionné(s) ;
- besoin éventuel de validation.

## Ce qui reste volontairement désactivé
- Autonomie V10.
- Exécution automatique d'actions externes.
- Web réel automatique.
- Calendar réel automatique.
- Actions entreprise automatiques.

Le fallback V7.4 reste actif si V10 rencontre une erreur.

## Installation

Extraire le ZIP puis copier ces 3 fichiers dans :

`C:\rose-ia-mobile-clean\`

Ensuite :

```powershell
cd C:\rose-ia-mobile-clean
powershell -ExecutionPolicy Bypass -File .\INSTALL_V10_012C.ps1
```

Le script crée un dossier de sauvegarde complet avant modification.

## Test

```powershell
npx expo start --lan -c
```

Tester par exemple :

`Rose organise mon objectif en plusieurs étapes`

Résultat attendu dans le terminal :

`[Rose V10-012C] mode=v10`

Et dans l'application, Rose doit indiquer une intention de planification avec le `planner-agent`.

Autre test :

`Rose prépare un rendez-vous demain`

Rose doit détecter l'agenda et préciser qu'une validation reste nécessaire. Aucune action calendrier réelle n'est exécutée.

## Git seulement après validation

```powershell
git add .
git commit -m "Rose V10-012C Controlled V10 Activation"
git push origin main
```
