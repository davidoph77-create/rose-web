import {
  AgentContextValue,
} from "../AgentTypes";
import {
  RuntimeCommand,
} from "../../runtime";

export type AgentHandler<T = unknown> = (
  command: RuntimeCommand,
  context: AgentContextValue
) => Promise<T>;

export type OptionalAgentHandler<T = unknown> =
  AgentHandler<T> | undefined;
