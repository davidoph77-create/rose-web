# Rose V8-005 — Brain Integration

Cette étape relie les moteurs construits pendant V8-001 à V8-004.

## Fichiers remplacés

- `src/core/brain/BrainEngine.ts`
- `src/core/events/types.ts`
- `src/core/events/CoreEventLogger.ts`

## Nouveau fonctionnement

Le BrainEngine V1.2 exécute désormais :

1. Context Engine ;
2. Memory Engine historique ;
3. Cognitive Memory ;
4. Knowledge Graph ;
5. Reasoning Engine ;
6. Planner Engine ;
7. Agent Manager ;
8. Explain Engine ;
9. Personality Engine.

## Nouveaux événements

- `cognitive.memory.searched`
- `knowledge.graph.updated`

## Accès aux moteurs intégrés

```ts
const brain = new BrainEngine();
await brain.initialize();

const cognitiveMemory =
  brain.getCognitiveMemory();

const knowledgeGraph =
  brain.getKnowledgeGraph();
```

## Exemple complet

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

brain.getCognitiveMemory().create({
  content:
    "David développe Rose V8 avec Atlas.",
  importance: 100,
  tags: ["rose", "v8", "atlas"],
});

const result = await brain.execute({
  message:
    "Où en est le projet Rose et son Event Bus ?",
  metadata: {
    userName: "David",
    memories: [
      "Rose V8-004 Knowledge Graph est validée.",
    ],
  },
});

console.log(result.response);
console.log(result.trace);
console.log(logger.getLogs());
```

## Sécurité

Le BrainEngine consulte, relie et explique.
Il ne déclenche aucune action externe sans validation.
