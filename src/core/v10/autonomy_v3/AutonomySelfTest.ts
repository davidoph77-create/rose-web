import {
  Runtime,
} from "../runtime";
import {
  AgentManager,
  AgentRuntimeBridge,
} from "../agents";
import {
  createBuiltinAgents,
} from "../agents/builtin";
import {
  MessageBus,
} from "../communication";
import {
  CognitiveRouter,
} from "../cognitive";
import {
  MemoryEngine,
} from "../memory";
import {
  PlannerEngineV3,
} from "../planner_v3";
import {
  GoalEngineV3,
} from "../goal_v3";
import {
  AutonomyLoopV3,
} from "./AutonomyLoopV3";

export async function runAutonomyV3SelfTest() {
  const runtime =
    new Runtime();

  const manager =
    new AgentManager();

  const bridge =
    new AgentRuntimeBridge(
      runtime,
      manager
    );

  bridge.install(
    createBuiltinAgents({
      memory: async () => ({
        ok: true,
      }),
      planner: async () => ({
        ok: true,
      }),
      web: async () => ({
        ok: true,
      }),
      calendar: async () => ({
        ok: true,
      }),
    })
  );

  const bus =
    new MessageBus(
      manager
    );

  const cognitive =
    new CognitiveRouter(
      manager,
      bus
    );

  const memory =
    new MemoryEngine();

  const planner =
    new PlannerEngineV3();

  const goals =
    new GoalEngineV3(
      undefined,
      undefined,
      planner,
      memory
    );

  const goal =
    goals.createGoal({
      title:
        "Préparer une recherche web pour Rose",
      description:
        "Chercher une information sur Internet et produire un plan.",
    });

  await runtime.start();

  const loop =
    new AutonomyLoopV3(
      cognitive,
      planner,
      manager,
      bus,
      memory,
      goals,
      {
        enabled: true,
        maxCycles: 3,
        requireValidationForExternalActions: true,
        requireValidationForBusinessActions: true,
        requireValidationForCalendarActions: true,
        allowMemoryWrites: true,
        allowGoalProgressUpdates: true,
      }
    );

  const first =
    await loop.run({
      message:
        "Recherche cette information sur le web puis prépare la suite.",
      goalId:
        goal.goal.id,
    });

  const approvedIds =
    first.pendingValidation.map(
      (action) =>
        action.id
    );

  loop.resetCycles();

  const second =
    await loop.run(
      {
        message:
          "Recherche cette information sur le web puis prépare la suite.",
        goalId:
          goal.goal.id,
      },
      approvedIds
    );

  await runtime.stop();

  return {
    success:
      first.state ===
        "waiting_validation" &&
      second.executedActions
        .length >= 1 &&
      memory.snapshot().count >=
        1,
    first,
    second,
    memory:
      memory.snapshot(),
  };
}
