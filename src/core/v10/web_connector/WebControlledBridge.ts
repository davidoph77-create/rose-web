import { WebControlledConnector } from "./WebControlledConnector";
import { WebConnectorAuditStore } from "./WebConnectorAuditStore";
import {
  WebConnectorDecision,
  WebControlledAction,
  WebConnectorResult,
} from "./WebConnectorTypes";

const connector = new WebControlledConnector();

export async function runControlledWebAction(
  action: WebControlledAction,
  decision: WebConnectorDecision
): Promise<WebConnectorResult> {
  const result = await connector.execute(action, decision);
  WebConnectorAuditStore.add(result);
  return result;
}

export function getWebControlledConnector() {
  return connector;
}
