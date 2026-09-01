import type {
  ExecutionQueueItem,
} from "../execution_queue/ExecutionQueueTypes";
import {
  upsertReleaseGateRecord,
} from "./ReleaseGateStore";

export async function prepareReleaseGate(
  item: ExecutionQueueItem
) {
  if (item.status !== "reviewed") {
    return {
      record: null,
      summary:
        "Release Gate : action non prête. Le Dry Run doit d'abord être revu.",
    };
  }

  const record = {
    id:
      `release_${Date.now()}_` +
      Math.random()
        .toString(36)
        .slice(2, 8),
    createdAt:
      new Date().toISOString(),
    queueItemId:
      item.id,
    actionId:
      item.actionId,
    kind:
      item.kind,
    message:
      item.message,
    risk:
      item.risk,
    status:
      "ready_for_release" as const,
    simulationOnly:
      true as const,
  };

  await upsertReleaseGateRecord(
    record
  );

  return {
    record,
    summary:
      `Release Gate : action prête pour une seconde confirmation humaine. ` +
      `Aucune exécution externe réelle n'est autorisée dans V10-023.`,
  };
}
