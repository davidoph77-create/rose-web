import { CalendarControlledConnector } from "./CalendarControlledConnector";
import { CalendarConnectorAuditStore } from "./CalendarConnectorAuditStore";
import {
  CalendarConnectorDecision,
  CalendarControlledAction,
  CalendarConnectorResult,
} from "./CalendarConnectorTypes";

const connector = new CalendarControlledConnector();

export async function runControlledCalendarAction(
  action: CalendarControlledAction,
  decision: CalendarConnectorDecision
): Promise<CalendarConnectorResult> {
  const result = await connector.execute(action, decision);
  CalendarConnectorAuditStore.add(result);
  return result;
}

export function getCalendarControlledConnector() {
  return connector;
}
