# Rose V10-001 — Foundation & Architecture

V10-001 crée une nouvelle couche d’architecture isolée.

## Objectif

Préparer la migration progressive vers Rose V10 sans déplacer
ni remplacer les modules déjà validés.

## Principes

- aucun fichier V8/V9 remplacé ;
- aucune modification de `App.tsx` ;
- aucun déplacement de dossiers existants ;
- architecture additive ;
- adaptateurs pour réutiliser les moteurs existants ;
- registre central de modules ;
- contrat commun pour les futurs moteurs ;
- diagnostic de santé.

## Structure créée

```text
src/core/v10/
├── contracts/
├── foundation/
├── adapters/
├── diagnostics/
└── index.ts
```

## Exemple

```ts
import {
  RoseV10Foundation,
  LegacyRuntimeAdapter,
} from "./src/core/v10";

const foundation =
  new RoseV10Foundation();

foundation.register(
  new LegacyRuntimeAdapter()
);

const report =
  await foundation.boot();

console.log(report);
```

## Important

V10-001 est une fondation.
Elle n’est volontairement pas encore branchée à `App.tsx`.

Le branchement réel arrivera dans V10-002 — Unified Runtime.
