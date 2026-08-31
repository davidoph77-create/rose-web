# Rose V10-006 — Memory Engine V2

Cette version ajoute une mémoire V10 structurée et réellement utilisable.

## Capacités

- création / mise à jour de souvenirs ;
- types de mémoire ;
- importance ;
- confiance ;
- tags ;
- compteur d'accès ;
- recherche textuelle scorée ;
- filtre par type et tags ;
- export JSON ;
- import JSON ;
- Runtime Module ;
- handler prêt à être injecté dans `MemoryAgent` ;
- self-test complet.

## Important

Cette version n'écrase PAS la mémoire historique de Rose
et n'écrit pas automatiquement dans Supabase.

Elle constitue la nouvelle couche V10 en mémoire locale de processus.
La persistance Supabase sera branchée progressivement dans la prochaine étape,
afin de ne pas risquer les données existantes.

## Self-test

```ts
import {
  runMemorySelfTest,
} from "./src/core/v10/memory";

const result =
  await runMemorySelfTest();

console.log(result);
```

Résultat attendu :

`success: true`
