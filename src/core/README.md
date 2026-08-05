# Rose V8 — Core Foundation V1

Première fondation du cœur logiciel de Rose V8 — L’Éveil.

## Devise

> Rose réfléchit. Rose explique. David décide.

## Installation

Copier le dossier `src/core` dans le projet mobile Rose.

Aucun fichier existant de la V7 n’est remplacé.

## Exemple d’utilisation ultérieure

```ts
import { BrainEngine } from "./src/core";

const brain = new BrainEngine();
await brain.initialize();

const result = await brain.execute({
  message: "Prépare ma journée",
  metadata: {
    userName: "David",
    memories: [
      "David développe Rose IA.",
      "David travaille dans la couverture et la charpente.",
    ],
  },
});

console.log(result.response);
console.log(result.trace);
```
