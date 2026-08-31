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

export class WebAgent extends BaseAgent {
  readonly id = "web-agent";
  readonly name = "Rose Web Agent";
  readonly version = "10.0.4D";
  readonly priority = "normal" as const;
  readonly capabilities = ["web"];

  constructor(
    private readonly handler?: OptionalAgentHandler
  ) {
    super();
  }

  canHandle(command: RuntimeCommand): boolean {
    return (
      command.name.startsWith("web.") ||
      command.name.startsWith("search.") ||
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
        "WebAgent prêt. Aucune requête réseau n'est lancée tant qu'un handler Web n'est pas branché.",
    } as T;
  }
}
