# Rose V10-013 — Cognitive Execution Pipeline

V10-013 ajoute une vraie couche d'exécution structurée après le routage cognitif.

## Chemin

Message
→ Safe App Hook
→ Rose OS V10
→ Cognitive Layer
→ Agent Selector
→ Cognitive Execution Pipeline
→ étapes structurées
→ réponse Rose

## Agents pris en charge

- Memory Agent
- Planner Agent
- Goal Agent
- Calendar Agent
- Business Agent
- Web Agent
- Voice Agent
- Cognitive fallback

## Sécurité

Le pipeline prépare les traitements, mais :
- l'autonomie externe reste désactivée ;
- Web et Calendar réels sont bloqués sans validation ;
- le fallback V7.4 reste actif ;
- aucune action externe n'est exécutée automatiquement.

Le backup est créé dans `%TEMP%\RoseV10Backups` afin de ne plus ajouter les backups au dépôt Git.

## Installation

Copier les fichiers du ZIP dans :

`C:\rose-ia-mobile-clean\`

Puis :

```powershell
cd C:\rose-ia-mobile-clean
powershell -ExecutionPolicy Bypass -File .\INSTALL_V10_013.ps1
```

## Test

```powershell
npx expo start --lan -c
```

Test 1 :

`Rose organise mon objectif en plusieurs étapes`

Attendu :
- mode V10 ;
- planner-agent ;
- pipeline préparé ;
- une étape "Construire un plan".

Test 2 :

`Rose prépare un rendez-vous demain`

Attendu :
- calendar-agent ;
- étape agenda bloquée en attente de validation ;
- aucune création réelle d'événement.

Terminal :

`[Rose V10-013] mode=v10`

## Git après validation

```powershell
git add .
git commit -m "Rose V10-013 Cognitive Execution Pipeline"
git push origin main
```
