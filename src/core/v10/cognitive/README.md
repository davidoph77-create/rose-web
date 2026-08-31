# Rose V10-005 — Cognitive Layer

Cette version ajoute une vraie couche cognitive au Runtime V10.

## Fonction principale

Rose peut désormais analyser une demande et choisir automatiquement
les agents adaptés à son contenu.

## Intentions reconnues

- memory
- planning
- calendar
- business
- voice
- web
- general

## Exemple

```ts
const result =
  await runtime.invoke({
    name:
      "cognitive.route",
    target:
      "v10-cognitive-runtime",
    payload: {
      message:
        "Recherche cette information sur Internet.",
    },
  });
```

La couche cognitive :
1. analyse le message ;
2. détermine l'intention ;
3. sélectionne une ou plusieurs capacités ;
4. choisit les agents correspondants ;
5. transmet la demande via le MessageBus.

## Sécurité

La couche cognitive choisit des agents et transmet des demandes.
Elle ne contourne pas les validations propres aux agents ou aux services.
