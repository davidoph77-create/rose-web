# Rose V10-004B — Communication Inter-Agents

Cette sous-version ajoute la communication réelle entre les agents V10.

## Capacités

- messages structurés ;
- priorité des messages ;
- queue de messages ;
- ciblage par agent ;
- ciblage par capacité ;
- broadcast ;
- Inbox / Outbox ;
- EventBus de communication ;
- router ;
- dispatcher ;
- health check ;
- self-test complet.

## Exemple

```ts
const bus =
  new MessageBus(
    agentManager
  );

const result =
  await bus.send({
    sourceAgentId:
      "planner-agent",
    target: {
      type: "capability",
      capability: "memory",
    },
    type:
      "memory.search",
    payload: {
      query:
        "Projet Rose",
    },
  });

console.log(result);
```

## Self-test

```ts
import {
  runCommunicationSelfTest,
} from "./src/core/v10/communication";

const result =
  await runCommunicationSelfTest();

console.log(result);
```

Le résultat attendu est :

`success: true`

## Sécurité

Le MessageBus ne crée aucune action externe.
Il transmet uniquement des messages aux agents enregistrés.
