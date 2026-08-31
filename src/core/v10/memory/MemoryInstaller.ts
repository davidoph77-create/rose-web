import {
  Runtime,
} from "../runtime";
import {
  MemoryEngine,
} from "./MemoryEngine";
import {
  MemoryRuntime,
} from "./MemoryRuntime";

export function installMemoryEngine(
  runtime: Runtime,
  engine =
    new MemoryEngine()
) {
  const module =
    new MemoryRuntime(
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
