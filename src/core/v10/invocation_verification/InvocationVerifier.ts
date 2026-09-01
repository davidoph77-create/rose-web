import type {
  AdapterInvocationResult,
} from "../adapter_invocation/AdapterInvocationTypes";
import type {
  InvocationVerification,
} from "./VerificationTypes";

export function verifyAdapterInvocation(
  result: AdapterInvocationResult
): InvocationVerification {
  const invocationCompleted =
    result.status === "simulated";

  const simulationOnly =
    result.request.simulationOnly === true;

  const noExternalExecution =
    result.executedExternally === false;

  const outputPresent =
    typeof result.output === "string" &&
    result.output.trim().length > 0;

  const allGood =
    invocationCompleted &&
    simulationOnly &&
    noExternalExecution &&
    outputPresent;

  return {
    id:
      `verify_${Date.now()}_` +
      Math.random()
        .toString(36)
        .slice(2, 8),
    createdAt:
      new Date().toISOString(),
    invocationId:
      result.request.id,
    adapterId:
      result.request.adapterId,
    capability:
      result.request.capability,
    status:
      allGood
        ? "verified"
        : "failed",
    externalExecutionDetected:
      false,
    checks: {
      invocationCompleted,
      simulationOnly,
      noExternalExecution,
      outputPresent,
    },
    summary:
      allGood
        ? `Vérification OK : ${result.request.adapterId} a terminé sa simulation sans exécution externe.`
        : `Vérification échouée : une ou plusieurs garanties de simulation ne sont pas satisfaites.`,
  };
}
