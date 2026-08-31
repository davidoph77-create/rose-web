# Rose V10-004A — Agent Core

Première sous-version du système multi-agents V10.

## Cette version est réelle

Elle fournit :

- contrat `RoseAgent` ;
- `BaseAgent` fonctionnel ;
- état individuel de chaque agent ;
- contexte partagé ;
- registre d’agents ;
- `AgentManager` connecté au Runtime V10-003 ;
- activation/désactivation ;
- démarrage/arrêt/pause/reprise/redémarrage ;
- routage d’une commande vers un agent ;
- sélection automatique par `canHandle()` ;
- self-test complet.

## Commandes gérées par AgentManager

- `agent.list`
- `agent.describe`
- `agent.enable`
- `agent.disable`
- `agent.restart`
- `agent.execute`

## Intégration Runtime

```ts
import {
  Runtime,
} from "../runtime";

import {
  AgentRuntimeBridge,
} from "../agents";

const runtime =
  new Runtime();

const bridge =
  new AgentRuntimeBridge(
    runtime
  );

const manager =
  bridge.install();

await runtime.start();
```

## Self-test

```ts
import {
  runAgentCoreSelfTest,
} from "./src/core/v10/agents";

const result =
  await runAgentCoreSelfTest();

console.log(result);
```

Le résultat attendu est :

`success: true`

## Ce qui viendra ensuite

V10-004B ajoutera le vrai bus de communication entre agents,
les messages, le routage inter-agents et les événements spécialisés.
