# Rose V10-004C — Supervision

Cette sous-version ajoute la supervision réelle des agents V10.

## Capacités

- heartbeat par agent ;
- détection des agents en retard ;
- compteur de heartbeats manqués ;
- redémarrage automatique configurable ;
- limite de tentatives de redémarrage ;
- scheduler prioritaire ;
- health check de supervision ;
- bridge vers le Runtime V10-003 ;
- diagnostics ;
- self-test complet.

## Exemple

```ts
const supervision =
  new SupervisionRuntimeBridge(
    runtime,
    agentManager
  );

supervision.start();

supervision.beat(
  "memory-agent"
);

const report =
  await supervision.tick();
```

## Self-test

```ts
import {
  runSupervisionSelfTest,
} from "./src/core/v10/supervision";

const result =
  await runSupervisionSelfTest();

console.log(result);
```

Le résultat attendu est :

`success: true`

## Important

Le superviseur ne crée aucune action externe.
Il ne fait que gérer le cycle de vie des agents déjà enregistrés.
