# Rose V9-001 — Core Runtime

Première brique de Rose V9.

## Objectif

Créer un point d’entrée unique pour démarrer Rose, traiter une demande,
surveiller la santé du Core, redémarrer et arrêter proprement le Runtime.

## Nouveaux fichiers

- src/core/runtime/RuntimeTypes.ts
- src/core/runtime/RuntimeConfig.ts
- src/core/runtime/RuntimeEvents.ts
- src/core/runtime/RuntimeLifecycle.ts
- src/core/runtime/RuntimeRegistry.ts
- src/core/runtime/RuntimeHealthMonitor.ts
- src/core/runtime/RuntimeManager.ts
- src/core/runtime/index.ts

## Fichier remplacé

- src/core/index.ts

## Exemple

```ts
import { RuntimeManager } from "./src/core";

const runtime = new RuntimeManager();
await runtime.boot();

const result = await runtime.process({
  message: "Prépare ma journée",
  metadata: { userName: "David" },
});

console.log(result.output.response);
console.log(result.health);
```

## Sécurité

Le Runtime orchestre les moteurs existants.
Il ne déclenche pas d’action externe automatiquement.
