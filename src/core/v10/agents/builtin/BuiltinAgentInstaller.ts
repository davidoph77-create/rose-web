import {
  AgentManager,
} from "../AgentManager";
import {
  Runtime,
} from "../../runtime";
import {
  AgentRuntimeBridge,
} from "../AgentRuntimeBridge";
import {
  BuiltinAgentHandlers,
  createBuiltinAgents,
} from "./BuiltinAgentFactory";

export function installBuiltinAgents(
  runtime: Runtime,
  handlers: BuiltinAgentHandlers = {},
  manager = new AgentManager()
) {
  const bridge =
    new AgentRuntimeBridge(
      runtime,
      manager
    );

  const agents =
    createBuiltinAgents(
      handlers
    );

  bridge.install(agents);

  return {
    manager,
    agents,
    bridge,
  };
}
