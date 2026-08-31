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

export class PlannerAgent extends BaseAgent {
  readonly id = "planner-agent";
  readonly name = "Rose Planner Agent";
  readonly version = "10.0.4D";
  readonly priority = "high" as const;
  readonly capabilities = ["planning"];

  constructor(
    private readonly handler?: OptionalAgentHandler
  ) {
    super();
  }

  canHandle(command: RuntimeCommand): boolean {
    return (
      command.name.startsWith("planner.") ||
      command.name.startsWith("plan.") ||
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
        "PlannerAgent prêt. Branche le Planner existant pour exécuter cette commande.",
    } as T;
  }
}
