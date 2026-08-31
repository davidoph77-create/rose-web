# Rose V10-004D — Agents intégrés

Cette sous-version installe six agents V10 réellement compatibles avec
le Runtime V10-003 et l'Agent Core V10-004A.

## Agents

- MemoryAgent
- PlannerAgent
- CalendarAgent
- BusinessAgent
- VoiceAgent
- WebAgent

## Important

Les agents sont fonctionnels en tant que composants Runtime :
ils s'enregistrent, démarrent, reçoivent des commandes et retournent un résultat.

Pour ne pas casser les fonctionnalités déjà existantes de Rose,
les services réels (mémoire Supabase, calendrier, voix, Web, etc.)
ne sont PAS remplacés automatiquement.

Chaque agent accepte un `handler` injecté. Cela permet de brancher
progressivement les moteurs existants sans réécrire App.tsx.

Sans handler, l'agent répond proprement avec `connected: false`
et n'exécute aucune action externe.

## Exemple

```ts
const installation =
  installBuiltinAgents(
    runtime,
    {
      memory: async (command) => {
        return existingMemorySearch(
          command.payload
        );
      },
    }
  );
```

## Self-test

```ts
import {
  runIntegratedAgentsSelfTest,
} from "./src/core/v10/agents/builtin";

const result =
  await runIntegratedAgentsSelfTest();

console.log(result);
```

Résultat attendu :

`success: true`
