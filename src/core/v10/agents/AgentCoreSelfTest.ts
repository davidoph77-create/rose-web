import {
  Runtime,
  RuntimeCommand,
} from "../runtime";
import {
  BaseAgent,
} from "./BaseAgent";
import {
  AgentContextValue,
} from "./AgentTypes";
import {
  AgentRuntimeBridge,
} from "./AgentRuntimeBridge";

class EchoAgent
  extends BaseAgent
{
  readonly id =
    "agent-test-echo";
  readonly name =
    "Agent Test Echo";
  readonly version = "1.0.0";
  readonly priority =
    "normal" as const;
  readonly capabilities = [
    "general",
  ];

  canHandle(
    command: RuntimeCommand
  ): boolean {
    return (
      command.name ===
      "echo"
    );
  }

  protected async handle<T = unknown>(
    command: RuntimeCommand,
    context: AgentContextValue
  ): Promise<T> {
    return {
      echo:
        command.payload,
      context,
    } as T;
  }
}

export async function runAgentCoreSelfTest() {
  const runtime =
    new Runtime();

  const bridge =
    new AgentRuntimeBridge(
      runtime
    );

  const manager =
    bridge.install([
      new EchoAgent(),
    ]);

  manager.setContext({
    userId: "test-user",
    sessionId:
      "agent-core-test",
    metadata: {
      roseVersion:
        "V10-004A",
    },
  });

  await runtime.start();

  const list =
    await runtime.invoke({
      name: "agent.list",
      target: manager.id,
    });

  const execution =
    await runtime.invoke({
      name: "agent.execute",
      target: manager.id,
      payload: {
        commandName:
          "echo",
        payload: {
          message:
            "Agent Core OK",
        },
      },
    });

  const health =
    runtime.health();

  await runtime.stop();

  return {
    success:
      list.success &&
      execution.success &&
      health.healthy,
    list,
    execution,
    health,
  };
}
