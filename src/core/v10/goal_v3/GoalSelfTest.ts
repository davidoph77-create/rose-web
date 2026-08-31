import {
  Runtime,
} from "../runtime";
import {
  MemoryEngine,
} from "../memory";
import {
  PlannerEngineV3,
} from "../planner_v3";
import {
  GoalEngineV3,
} from "./GoalEngineV3";

export async function runGoalV3SelfTest() {
  const runtime =
    new Runtime();

  const memory =
    new MemoryEngine();

  memory.remember({
    kind: "project",
    title: "Rose V10",
    content:
      "Projet IA modulaire avec Runtime et agents.",
    tags: [
      "rose",
      "v10",
    ],
    importance: "high",
    confidence: 0.95,
  });

  const planner =
    new PlannerEngineV3();

  const goals =
    new GoalEngineV3(
      undefined,
      undefined,
      planner,
      memory
    );

  const created =
    goals.createGoal({
      title:
        "Construire la prochaine évolution du projet Rose V10",
      description:
        "Créer un plan et utiliser la mémoire du projet.",
      priority:
        "high",
      tags: [
        "rose",
        "v10",
      ],
    });

  const updated =
    goals.updateProgress(
      created.goal.id,
      1,
      created.plan?.steps.length ??
        1
    );

  return {
    success:
      goals.listGoals()
        .length === 1 &&
      Boolean(
        created.plan
      ) &&
      Array.isArray(
        created.memories
      ) &&
      updated.progress.percent >
        0 &&
      runtime.health().healthy,
    created,
    updated,
  };
}
