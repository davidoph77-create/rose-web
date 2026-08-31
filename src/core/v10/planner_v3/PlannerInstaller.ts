import {
  Runtime,
} from "../runtime";
import {
  PlannerEngineV3,
} from "./PlannerEngineV3";
import {
  PlannerRuntime,
} from "./PlannerRuntime";

export function installPlannerV3(
  runtime: Runtime,
  engine =
    new PlannerEngineV3()
) {
  const module =
    new PlannerRuntime(
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
