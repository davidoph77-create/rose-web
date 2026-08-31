# Rose V10-011 — App Bridge Phase 1

Cette version prépare le branchement réel de Rose OS à l'application existante
sans modifier `App.tsx`.

## Pourquoi une phase intermédiaire ?

Le noyau V10 est maintenant assemblé, mais connecter directement tout `App.tsx`
d'un seul coup serait risqué.

V10-011 ajoute donc une façade d'intégration très simple entre l'application
historique et Rose OS.

## Nouveaux éléments

- `AppBridge`
- singleton Rose OS
- démarrage / arrêt contrôlé
- `ask()` unique
- diagnostics
- snapshot d'état
- `LegacyRoseAdapter`
- self-test

## Exemple minimal

```ts
import {
  AppBridge,
} from "./src/core/v10/app_bridge";

const roseBridge =
  new AppBridge({
    enableAutonomy: false,
  });

await roseBridge.start();

const response =
  await roseBridge.ask(
    "Organise mon projet."
  );
```

## Important

Cette version NE MODIFIE PAS `App.tsx`.

Elle prépare seulement le branchement sûr.

La prochaine étape pourra connecter une seule fonction de l'application
au nouveau noyau, avec possibilité immédiate de revenir à l'ancien chemin.
