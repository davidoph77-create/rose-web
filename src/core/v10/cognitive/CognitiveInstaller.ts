import {
  AgentManager,
} from "../agents";
import {
  MessageBus,
} from "../communication";
import {
  Runtime,
} from "../runtime";
import {
  CognitiveRuntime,
} from "./CognitiveRuntime";

export function installCognitiveLayer(
  runtime: Runtime,
  manager: AgentManager
) {
  const bus =
    new MessageBus(
      manager
    );

  const cognitive =
    new CognitiveRuntime(
      runtime,
      manager,
      bus
    );

  cognitive.register();

  return {
    cognitive,
    bus,
  };
}
