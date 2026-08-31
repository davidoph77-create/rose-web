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

export class BusinessAgent extends BaseAgent {
  readonly id = "business-agent";
  readonly name = "Rose Business Agent";
  readonly version = "10.0.4D";
  readonly priority = "normal" as const;
  readonly capabilities = ["business"];

  constructor(
    private readonly handler?: OptionalAgentHandler
  ) {
    super();
  }

  canHandle(command: RuntimeCommand): boolean {
    return (
      command.name.startsWith("business.") ||
      command.name.startsWith("entreprise.") ||
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
        "BusinessAgent prêt. Branche les données entreprise existantes via un handler.",
    } as T;
  }
}
