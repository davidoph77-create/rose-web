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

export class CalendarAgent extends BaseAgent {
  readonly id = "calendar-agent";
  readonly name = "Rose Calendar Agent";
  readonly version = "10.0.4D";
  readonly priority = "normal" as const;
  readonly capabilities = ["calendar"];

  constructor(
    private readonly handler?: OptionalAgentHandler
  ) {
    super();
  }

  canHandle(command: RuntimeCommand): boolean {
    return (
      command.name.startsWith("calendar.") ||
      command.name.startsWith("agenda.") ||
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
        "CalendarAgent prêt. Aucun connecteur calendrier n'est exécuté sans handler explicite.",
    } as T;
  }
}
