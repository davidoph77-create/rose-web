# Rose V8-009 — Multi-Agent Intelligence

Cette étape ajoute une vraie orchestration multi-agents au Rose Core.

## Nouveaux fichiers

- `src/core/agents/types.ts`
- `src/core/agents/AgentRegistry.ts`
- `src/core/agents/MultiAgentOrchestrator.ts`
- `src/core/agents/index.ts`
- `src/core/agents/builtin/MemoryAgent.ts`
- `src/core/agents/builtin/KnowledgeAgent.ts`
- `src/core/agents/builtin/PlanningAgent.ts`
- `src/core/agents/builtin/GoalAgent.ts`
- `src/core/agents/builtin/BusinessAgent.ts`
- `src/core/agents/builtin/index.ts`

## Fichiers remplacés

- `src/core/agents/AgentManager.ts`
- `src/core/brain/BrainEngine.ts`
- `src/core/events/types.ts`
- `src/core/events/CoreEventLogger.ts`
- `src/core/index.ts`

## Capacités

- registre dynamique d’agents ;
- sélection automatique selon le contexte ;
- exécution parallèle ;
- collecte des contributions ;
- calcul d’une confiance collective ;
- consensus lisible ;
- validation humaine si nécessaire ;
- journal d’événements multi-agents ;
- ajout ultérieur de nouveaux agents sans modifier le BrainEngine.

## Agents fournis

- Memory Agent
- Knowledge Agent
- Planning Agent
- Goal Agent
- Business Agent

## Exemple

```ts
const brain = new BrainEngine();
await brain.initialize();

const agents = brain.getAgents();

console.log(
  agents.getAgents().map(
    (agent) => agent.name
  )
);

const result = await brain.execute({
  message:
    "Organise mes objectifs et mes chantiers.",
  metadata: {
    userName: "David",
  },
});

console.log(result.response);
```

## Sécurité

Les contributions sont consultatives.
Toute action externe importante reste soumise à validation.
