# Rose V10-012A — Safe App Hook

Cette étape prépare le premier branchement réel de l'application vers Rose OS
avec un mécanisme de sécurité simple :

- V10 désactivée par défaut ;
- ancien chemin conservé ;
- fallback automatique vers l'ancien système ;
- autonomie V10 désactivée ;
- activation réversible par feature flag.

## Pourquoi ne pas modifier App.tsx automatiquement ?

Le fichier App.tsx actuel contient encore la logique historique de Rose.
Pour ne pas casser une version qui fonctionne, cette archive ajoute uniquement
le hook sécurisé.

La modification d'App.tsx sera faite dans V10-012B après inspection du fichier
App.tsx réellement utilisé par l'application.

## Exemple de principe

```ts
const hook = createRoseAppHook(
  async ({ message }) => {
    return ancienneFonctionRose(message);
  }
);

const result = await hook.run({
  message,
});
```

Si V10 échoue et `fallbackToLegacy` est actif, le chemin historique continue.
