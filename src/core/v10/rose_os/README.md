# Rose V10-010 — Rose OS Integration

Cette version assemble les briques V10 dans un point d'entrée unique.

## Point d'entrée principal

`RoseOSFacade`

Exemple :

```ts
const rose =
  new RoseOSFacade({
    enableAutonomy: false,
  });

await rose.start();

const response =
  await rose.ask(
    "Organise mon projet."
  );

console.log(response);
```

## Éléments assemblés

- Runtime V10
- Agent Manager
- agents intégrés
- MessageBus
- Cognitive Layer
- Memory Engine V2
- Planner Engine V3
- Goal Engine V3
- Autonomy Loop V3

## Important

L'autonomie est désactivée par défaut dans `buildRoseOS()`.
Il faut l'activer explicitement.

Rose OS n'est pas encore connecté automatiquement à App.tsx.
Cette séparation permet de valider le noyau avant de modifier l'interface existante.
