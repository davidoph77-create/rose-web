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
  MessageBus,
} from "./MessageBus";
import {
  CommunicationHealth,
} from "./CommunicationHealth";

class SenderAgent
  extends BaseAgent
{
  readonly id =
    "communication-test-sender";
  readonly name =
    "Communication Test Sender";
  readonly version = "1.0.0";
  readonly priority =
    "normal" as const;
  readonly capabilities = [
    "sender",
  ];

  canHandle(
    _command: RuntimeCommand
  ): boolean {
    return false;
  }

  protected async handle<T = unknown>():
    Promise<T> {
    return {} as T;
  }
}

class ReceiverAgent
  extends BaseAgent
{
  readonly id =
    "communication-test-receiver";
  readonly name =
    "Communication Test Receiver";
  readonly version = "1.0.0";
  readonly priority =
    "normal" as const;
  readonly capabilities = [
    "echo",
  ];

  canHandle(
    command: RuntimeCommand
  ): boolean {
    return (
      command.name ===
      "communication.echo"
    );
  }

  protected async handle<T = unknown>(
    command: RuntimeCommand,
    context: AgentContextValue
  ): Promise<T> {
    return {
      received:
        command.payload,
      context,
    } as T;
  }
}

export async function runCommunicationSelfTest() {
  const runtime =
    new Runtime();

  const manager =
    new AgentManager();

  const bridge =
    new AgentRuntimeBridge(
      runtime,
      manager
    );

  bridge.install([
    new SenderAgent(),
    new ReceiverAgent(),
  ]);

  manager.setContext({
    userId:
      "communication-test-user",
    sessionId:
      "communication-test-session",
    metadata: {
      roseVersion:
        "V10-004B",
    },
  });

  await runtime.start();

  const bus =
    new MessageBus(
      manager
    );

  const eventNames:
    string[] = [];

  bus.getEvents().subscribe(
    "*",
    (event) => {
      eventNames.push(
        event.name
      );
    }
  );

  const delivery =
    await bus.send({
      sourceAgentId:
        "communication-test-sender",
      target: {
        type: "capability",
        capability: "echo",
      },
      type:
        "communication.echo",
      payload: {
        message:
          "Communication V10-004B OK",
      },
      priority: "high",
    });

  const health =
    new CommunicationHealth(
      bus,
      manager
    ).check();

  const receiverInbox =
    bus.getInbox(
      "communication-test-receiver"
    ).getAll();

  await runtime.stop();

  return {
    success:
      delivery.deliveredTo.includes(
        "communication-test-receiver"
      ) &&
      receiverInbox.length === 1 &&
      health.healthy,
    delivery,
    health,
    eventNames,
    receiverInbox,
  };
}
