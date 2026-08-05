# Rose V8-007 — Goal Engine V2

Cette étape ajoute un moteur d’objectifs structuré.

## Nouveaux fichiers

- src/core/goals/types.ts
- src/core/goals/GoalEngine.ts
- src/core/goals/index.ts

## Fichiers remplacés

- src/core/brain/BrainEngine.ts
- src/core/events/types.ts
- src/core/events/CoreEventLogger.ts
- src/core/index.ts

## Capacités

- créer un objectif ;
- définir une catégorie et une priorité ;
- ajouter des jalons ;
- suivre une progression ;
- gérer des dépendances ;
- bloquer, mettre en pause ou annuler ;
- terminer automatiquement un objectif à 100 % ;
- conserver un historique de progression ;
- exposer les objectifs au BrainEngine.

## Exemple

```ts
const goals = brain.getGoals();

const goal = await goals.execute({
  type: "create",
  input: {
    title: "Terminer Rose V8",
    category: "project",
    priority: "critical",
    milestones: [
      { title: "Goal Engine V2" },
      { title: "Autonomous Loop V2" },
      { title: "Multi-Agent Intelligence" },
    ],
  },
});

console.log(goal);
```

## Sécurité

Les objectifs importants restent soumis à validation humaine.
