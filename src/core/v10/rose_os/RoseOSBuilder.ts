import {
  Runtime,
} from "../runtime";
import {
  AgentManager,
  AgentRuntimeBridge,
} from "../agents";
import {
  BuiltinAgentHandlers,
  createBuiltinAgents,
} from "../agents/builtin";
import {
  MessageBus,
} from "../communication";
import {
  MemoryEngine,
  createMemoryAgentHandler,
} from "../memory";
import {
  PlannerEngineV3,
  createPlannerAgentHandler,
} from "../planner_v3";
import {
  GoalEngineV3,
} from "../goal_v3";
import {
  CognitiveRouter,
} from "../cognitive";
import {
  AutonomyLoopV3,
  DEFAULT_AUTONOMY_POLICY,
} from "../autonomy_v3";
import {
  RoseOSKernel,
} from "./RoseOSKernel";

export type RoseOSBuildOptions = {
  handlers?: BuiltinAgentHandlers;
  enableAutonomy?: boolean;
};

export function buildRoseOS(
  options:
    RoseOSBuildOptions = {}
) {
  const runtime =
    new Runtime();

  const manager =
    new AgentManager();

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

  const builtinHandlers:
    BuiltinAgentHandlers = {
      ...options.handlers,
      memory:
        options.handlers
          ?.memory ??
        createMemoryAgentHandler(
          memory
        ),
      planner:
        options.handlers
          ?.planner ??
        createPlannerAgentHandler(
          planner,
          memory
        ),
    };

  const bridge =
    new AgentRuntimeBridge(
      runtime,
      manager
    );

  bridge.install(
    createBuiltinAgents(
      builtinHandlers
    )
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

  const autonomy =
    new AutonomyLoopV3(
      cognitive,
      planner,
      manager,
      bus,
      memory,
      goals,
      {
        ...DEFAULT_AUTONOMY_POLICY,
        enabled:
          options.enableAutonomy ??
          false,
      }
    );

  const kernel =
    new RoseOSKernel(
      runtime,
      manager,
      bus,
      memory,
      planner,
      goals,
      cognitive,
      autonomy
    );

  return {
    kernel,
    runtime,
    manager,
    bus,
    memory,
    planner,
    goals,
    cognitive,
    autonomy,
  };
}
