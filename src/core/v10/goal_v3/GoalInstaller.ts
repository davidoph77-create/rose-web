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
import {
  GoalRuntime,
} from "./GoalRuntime";

export function installGoalEngineV3(
  runtime: Runtime,
  options?: {
    memory?: MemoryEngine;
    planner?: PlannerEngineV3;
  }
) {
  const engine =
    new GoalEngineV3(
      undefined,
      undefined,
      options?.planner,
      options?.memory
    );

  const module =
    new GoalRuntime(
      engine
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
    engine,
    module,
  };
}
