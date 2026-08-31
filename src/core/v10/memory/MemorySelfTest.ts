import {
  Runtime,
} from "../runtime";
import {
  installMemoryEngine,
} from "./MemoryInstaller";

export async function runMemorySelfTest() {
  const runtime =
    new Runtime();

  const {
    engine,
    module,
  } = installMemoryEngine(
    runtime
  );

  await runtime.start();

  const remembered =
    await runtime.invoke({
      name:
        "memory.remember",
      target:
        module.id,
      payload: {
        kind:
          "project",
        title:
          "Rose V10",
        content:
          "Memory Engine V2",
        tags: [
          "rose",
          "v10",
          "memory",
        ],
        importance:
          "high",
        confidence:
          0.95,
      },
    });

  const search =
    await runtime.invoke({
      name:
        "memory.search",
      target:
        module.id,
      payload: {
        query:
          "Rose V10 memory",
        limit: 5,
      },
    });

  const snapshot =
    engine.snapshot();

  const health =
    runtime.health();

  await runtime.stop();

  return {
    success:
      remembered.success &&
      search.success &&
      snapshot.count === 1 &&
      health.healthy,
    remembered,
    search,
    snapshot,
    health,
  };
}
