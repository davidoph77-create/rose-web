import {
  AgentManager,
  AgentRuntimeBridge,
  BaseAgent,
  AgentContextValue,
} from "../agents";
import {
  Runtime,
  RuntimeCommand,
} from "../runtime";
import {
  SupervisionRuntimeBridge,
} from "./SupervisionRuntimeBridge";

class StableTestAgent
  extends BaseAgent
{
  readonly id =
    "supervision-test-agent";
  readonly name =
    "Supervision Test Agent";
  readonly version = "1.0.0";
  readonly priority =
    "normal" as const;
  readonly capabilities = [
    "supervision-test",
  ];

  canHandle(
    command: RuntimeCommand
  ): boolean {
    return (
      command.name ===
      "supervision.echo"
    );
  }

  protected async handle<T = unknown>(
    command: RuntimeCommand,
    context: AgentContextValue
  ): Promise<T> {
    return {
      payload:
        command.payload,
      context,
    } as T;
  }
}

export async function runSupervisionSelfTest() {
  const runtime =
    new Runtime();

  const manager =
    new AgentManager();

  const agentBridge =
    new AgentRuntimeBridge(
      runtime,
      manager
    );

  agentBridge.install([
    new StableTestAgent(),
  ]);

  await runtime.start();

  const supervision =
    new SupervisionRuntimeBridge(
      runtime,
      manager,
      {
        heartbeatIntervalMs: 1000,
        heartbeatTimeoutMs: 5000,
        maxMissesBeforeRestart: 2,
        maxRestartAttempts: 2,
        autoRestart: true,
      }
    );

  supervision.beat(
    "supervision-test-agent"
  );

  supervision.scheduler.schedule({
    agentId:
      "supervision-test-agent",
    commandName:
      "supervision.echo",
    payload: {
      message:
        "Supervision V10-004C OK",
    },
    priority: "high",
  });

  const taskResult =
    await supervision.scheduler.runNext();

  const report =
    await supervision.tick();

  const health =
    await supervision.health.check();

  await runtime.stop();

  return {
    success:
      Boolean(
        taskResult &&
        "success" in taskResult &&
        taskResult.success
      ) &&
      report.healthy &&
      health.healthy,
    taskResult,
    report,
    health,
  };
}
