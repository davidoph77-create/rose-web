# Rose V8-002 — Event Bus

Cette étape ajoute un système d’événements interne à Rose Core.

## Nouveaux fichiers

- `src/core/events/types.ts`
- `src/core/events/EventBus.ts`
- `src/core/events/CoreEventLogger.ts`
- `src/core/events/index.ts`

## Fichiers remplacés

- `src/core/brain/BrainEngine.ts`
- `src/core/index.ts`

## Fonctionnement

Le `BrainEngine` publie désormais un événement après chaque étape :

1. demande reçue ;
2. contexte analysé ;
3. mémoire consultée ;
4. raisonnement terminé ;
5. plan créé ;
6. agents sélectionnés ;
7. explication générée ;
8. personnalité appliquée ;
9. réponse prête.

## Exemple

```ts
import {
  BrainEngine,
  CoreEventLogger,
  EventBus,
} from "./src/core";

const eventBus = new EventBus();
const logger = new CoreEventLogger(eventBus);
logger.start();

const brain = new BrainEngine(eventBus);
await brain.initialize();

await brain.execute({
  message: "Prépare ma journée",
  metadata: {
    userName: "David",
  },
});

console.log(logger.getLogs());
```

## Règle de sécurité

L’Event Bus observe et transmet des informations internes.
Il n’exécute aucune action externe sans validation.
