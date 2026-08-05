# Rose V8-006 — Planner V2

Planner V2 ajoute :
- objectifs nommés ;
- étapes ordonnées ;
- priorités ;
- durées estimées ;
- dépendances ;
- validation obligatoire ;
- risque global ;
- statuts pending, in_progress, done, blocked, cancelled ;
- recalcul automatique du plan.

Fichiers remplacés :
- src/core/planner/PlannerEngine.ts
- src/core/brain/BrainEngine.ts
- src/core/events/types.ts
- src/core/events/CoreEventLogger.ts
- src/core/index.ts

Nouveaux fichiers :
- src/core/planner/types.ts
- src/core/planner/index.ts
