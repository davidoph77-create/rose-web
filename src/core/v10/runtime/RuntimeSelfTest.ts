import {
  Runtime,
} from "./Runtime";
import {
  ModuleStatus,
  RuntimeCommand,
  UnifiedRuntimeModule,
} from "./RuntimeTypes";

class TestEchoModule
  implements UnifiedRuntimeModule
{
  readonly id = "test-echo";
  readonly name = "Test Echo";
  readonly version = "1.0.0";

  private status:
    ModuleStatus = "idle";

  async initialize(): Promise<void> {
    this.status = "ready";
  }

  async stop(): Promise<void> {
    this.status = "stopped";
  }

  getStatus(): ModuleStatus {
    return this.status;
  }

  canHandle(
    command: RuntimeCommand
  ): boolean {
    return command.name === "echo";
  }

  async invoke<T = unknown>(
    command: RuntimeCommand
  ): Promise<T> {
    return {
      echo: command.payload,
    } as T;
  }
}

export async function runRuntimeSelfTest() {
  const runtime = new Runtime();
  const events: string[] = [];

  runtime.subscribe(
    "*",
    (event) => {
      events.push(event.name);
    }
  );

  runtime.register(
    new TestEchoModule()
  );

  await runtime.start();

  const result =
    await runtime.invoke({
      name: "echo",
      payload: {
        message:
          "Rose V10 Runtime OK",
      },
    });

  const health =
    runtime.health();

  const snapshot =
    runtime.snapshot();

  await runtime.stop();

  return {
    success:
      result.success &&
      health.healthy,
    result,
    health,
    snapshot,
    events,
  };
}
