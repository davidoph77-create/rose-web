import {
  Runtime,
} from "../runtime";
import {
  MemoryEngine,
} from "../memory";
import {
  PlannerEngineV3,
} from "./PlannerEngineV3";
import {
  createPlannerAgentHandler,
} from "./PlannerAgentBridge";

export async function runPlannerV3SelfTest() {
  const runtime =
    new Runtime();

  const memory =
    new MemoryEngine();

  memory.remember({
    kind: "project",
    title: "Rose",
    content:
      "Le projet utilise une architecture V10 modulaire.",
    tags: [
      "rose",
      "v10",
    ],
    importance: "high",
    confidence: 0.95,
  });

  const planner =
    new PlannerEngineV3();

  const handler =
    createPlannerAgentHandler(
      planner,
      memory
    );

  const result =
    await handler(
      {
        name:
          "planner.create",
        payload: {
          objective:
            "Organise un plan pour faire une recherche web puis ajouter un rendez-vous dans le calendrier.",
        },
      },
      {
        metadata: {},
      }
    );

  const plans =
    planner.listPlans();

  const health =
    runtime.health();

  return {
    success:
      plans.length === 1 &&
      Boolean(result) &&
      health.healthy,
    result,
    plans,
    health,
  };
}
