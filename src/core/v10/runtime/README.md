# Rose V10-003 — Unified Runtime réel

Cette version remplace le squelette V10-002 par un Runtime réellement utilisable.

## Capacités

- démarrage / arrêt / pause / reprise / redémarrage ;
- registre dynamique de modules ;
- Event Bus réel avec `subscribe`, `once`, `emit` ;
- commandes `invoke()` routées automatiquement ;
- ciblage direct d'un module ;
- état global du Runtime ;
- compteurs de commandes, succès et erreurs ;
- journal interne ;
- health check de tous les modules ;
- diagnostics complets ;
- hooks avant/après démarrage, commande et arrêt ;
- adaptateur pour moteurs legacy ;
- self-test intégré.

## API principale

```ts
runtime.register(module);
await runtime.start();

runtime.subscribe("*", (event) => {
  console.log(event.name);
});

const result = await runtime.invoke({
  name: "echo",
  payload: { text: "bonjour" },
});

console.log(runtime.health());
console.log(runtime.snapshot());
console.log(runtime.diagnostics());
```

## Self-test

```ts
import {
  runRuntimeSelfTest,
} from "./src/core/v10/runtime";

const test =
  await runRuntimeSelfTest();

console.log(test);
```

Le test doit retourner `success: true`.

## Sécurité

Le Runtime n'exécute aucune action externe par lui-même.
Il ne fait que router des commandes vers les modules explicitement enregistrés.
