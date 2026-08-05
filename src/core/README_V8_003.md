# Rose V8-003 — Cognitive Memory

Cette étape ajoute une mémoire cognitive structurée à Rose.

## Nouveaux fichiers

- `src/core/cognitive/types.ts`
- `src/core/cognitive/MemoryClassifier.ts`
- `src/core/cognitive/MemoryGraph.ts`
- `src/core/cognitive/MemoryRanker.ts`
- `src/core/cognitive/MemorySearch.ts`
- `src/core/cognitive/MemoryTimeline.ts`
- `src/core/cognitive/CognitiveMemoryEngine.ts`
- `src/core/cognitive/index.ts`

## Fichier remplacé

- `src/core/index.ts`

## Capacités

- créer des souvenirs structurés ;
- classer automatiquement les souvenirs ;
- attribuer une importance et une confiance ;
- ajouter des tags ;
- relier plusieurs souvenirs ;
- rechercher et classer les souvenirs ;
- suivre leur création et leur utilisation ;
- exporter ou réimporter un snapshot JSON.

## Exemple

```ts
import {
  CognitiveMemoryEngine,
} from "./src/core";

const memory = new CognitiveMemoryEngine();
await memory.initialize();

const roseProject = memory.create({
  content:
    "David développe Rose V8 avec Atlas.",
  importance: 100,
  tags: ["rose", "v8", "atlas"],
});

const eventBus = memory.create({
  content:
    "L’Event Bus de Rose V8-002 est validé.",
  importance: 90,
  tags: ["rose", "event-bus"],
});

await memory.execute({
  type: "link",
  sourceId: eventBus.id,
  targetId: roseProject.id,
  relationType: "part_of",
  weight: 1,
});

const results = memory.search({
  text: "Où en est le projet Rose V8 ?",
  limit: 5,
});

console.log(results);
```

## Important

V8-003 ne remplace pas encore le stockage Supabase existant.
Elle fournit le moteur cognitif qui sera relié au cloud dans une étape ultérieure.
