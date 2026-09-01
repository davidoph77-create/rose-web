import {
  AdapterDescriptor,
} from "../adapter_registry/AdapterTypes";
import {
  AdapterInvocationRequest,
  AdapterInvocationResult,
} from "./AdapterInvocationTypes";

export function prepareAdapterInvocation(
  adapter: AdapterDescriptor,
  message: string,
  releaseGateId?: string
): AdapterInvocationRequest {
  return {
    id:
      `invoke_${Date.now()}_` +
      Math.random()
        .toString(36)
        .slice(2, 8),
    createdAt:
      new Date().toISOString(),
    adapterId:
      adapter.id,
    capability:
      adapter.capability,
    message,
    releaseGateId,
    simulationOnly:
      true,
  };
}

export function invokeAdapterInSandbox(
  request: AdapterInvocationRequest
): AdapterInvocationResult {
  if (!request.simulationOnly) {
    return {
      request,
      status: "blocked",
      executedExternally: false,
      output:
        "Invocation bloquée : V10-025 n'autorise que la simulation.",
    };
  }

  return {
    request,
    status: "simulated",
    executedExternally: false,
    output:
      `Adaptateur ${request.adapterId} invoqué dans la Sandbox V10. ` +
      `Capacité=${request.capability}. ` +
      `Aucune action externe réelle n'a été exécutée.`,
  };
}
