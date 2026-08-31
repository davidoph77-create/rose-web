import {
  AgentHandler,
} from "./AgentHandlerTypes";
import {
  MemoryAgent,
} from "./MemoryAgent";
import {
  PlannerAgent,
} from "./PlannerAgent";
import {
  CalendarAgent,
} from "./CalendarAgent";
import {
  BusinessAgent,
} from "./BusinessAgent";
import {
  VoiceAgent,
} from "./VoiceAgent";
import {
  WebAgent,
} from "./WebAgent";

export type BuiltinAgentHandlers = {
  memory?: AgentHandler;
  planner?: AgentHandler;
  calendar?: AgentHandler;
  business?: AgentHandler;
  voice?: AgentHandler;
  web?: AgentHandler;
};

export function createBuiltinAgents(
  handlers: BuiltinAgentHandlers = {}
) {
  return [
    new MemoryAgent(
      handlers.memory
    ),
    new PlannerAgent(
      handlers.planner
    ),
    new CalendarAgent(
      handlers.calendar
    ),
    new BusinessAgent(
      handlers.business
    ),
    new VoiceAgent(
      handlers.voice
    ),
    new WebAgent(
      handlers.web
    ),
  ];
}
