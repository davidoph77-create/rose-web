import {
  AgentManager,
} from "../agents";
import {
  MessageBus,
} from "../communication";
import {
  CognitiveRouter,
} from "../cognitive";
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
} from "../goal_v3";
import {
  AutonomyLoopV3,
} from "./AutonomyLoopV3";
import {
  AutonomyRuntime,
} from "./AutonomyRuntime";
import {
  AutonomyPolicy,
} from "./AutonomyTypes";

export function installAutonomyV3(
  runtime: Runtime,
  options: {
    manager: AgentManager;
    bus: MessageBus;
    cognitive: CognitiveRouter;
    planner: PlannerEngineV3;
    memory?: MemoryEngine;
    goals?: GoalEngineV3;
    policy?: AutonomyPolicy;
  }
) {
  const loop =
    new AutonomyLoopV3(
      options.cognitive,
      options.planner,
      options.manager,
      options.bus,
      options.memory,
      options.goals,
      options.policy
    );

  const module =
    new AutonomyRuntime(
      loop
    );

  if (
    !runtime
      .getRegistry()
      .get(module.id)
  ) {
    runtime.register(
      module
    );
  }

  return {
    loop,
    module,
  };
}
