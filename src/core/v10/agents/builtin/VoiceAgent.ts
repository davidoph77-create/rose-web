import {
  BaseAgent,
} from "../BaseAgent";
import {
  AgentContextValue,
} from "../AgentTypes";
import {
  RuntimeCommand,
} from "../../runtime";
import {
  OptionalAgentHandler,
} from "./AgentHandlerTypes";

export class VoiceAgent extends BaseAgent {
  readonly id = "voice-agent";
  readonly name = "Rose Voice Agent";
  readonly version = "10.0.4D";
  readonly priority = "high" as const;
  readonly capabilities = ["voice"];

  constructor(
    private readonly handler?: OptionalAgentHandler
  ) {
    super();
  }

  canHandle(command: RuntimeCommand): boolean {
    return (
      command.name.startsWith("voice.") ||
      command.name.startsWith("speech.") ||
      command.target === this.id
    );
  }

  protected async handle<T = unknown>(
    command: RuntimeCommand,
    context: AgentContextValue
  ): Promise<T> {
    if (this.handler) {
      return this.handler(
        command,
        context
      ) as Promise<T>;
    }

    return {
      agent: this.id,
      available: true,
      connected: false,
      command: command.name,
      message:
        "VoiceAgent prêt. Le micro/TTS existant pourra être branché sans être remplacé.",
    } as T;
  }
}
