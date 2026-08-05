# Rose V8-004 — Knowledge Graph

Cette étape ajoute un graphe de connaissances à Rose.

## Nouveaux fichiers

- `src/core/knowledge/types.ts`
- `src/core/knowledge/KnowledgeGraph.ts`
- `src/core/knowledge/KnowledgeExtractor.ts`
- `src/core/knowledge/KnowledgeReasoner.ts`
- `src/core/knowledge/KnowledgeGraphEngine.ts`
- `src/core/knowledge/index.ts`

## Fichier remplacé

- `src/core/index.ts`

## Capacités

- créer des entités ;
- créer des relations typées ;
- rechercher des entités ;
- explorer les voisins d’une entité ;
- trouver plusieurs chemins entre deux connaissances ;
- expliquer une connexion ;
- extraire quelques entités connues depuis un texte ;
- exporter et importer un snapshot JSON.

## Exemple

```ts
import {
  KnowledgeGraphEngine,
} from "./src/core";

const engine = new KnowledgeGraphEngine();
await engine.initialize();

const extraction = await engine.execute({
  type: "extract",
  text:
    "David développe Rose. Rose utilise un Event Bus et Supabase.",
});

console.log(extraction);

const rose = engine
  .getGraph()
  .findEntityByLabel("Rose");

const eventBus = engine
  .getGraph()
  .findEntityByLabel("Event Bus");

if (rose && eventBus) {
  const explanation = await engine.execute({
    type: "explain_connection",
    sourceId: rose.id,
    targetId: eventBus.id,
  });

  console.log(explanation);
}
```

## Important

V8-004 fournit le moteur de graphe.
Il n’est pas encore relié automatiquement à Supabase,
à l’interface ou au BrainEngine principal.
