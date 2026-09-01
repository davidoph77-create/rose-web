import {
  ExecutionQueueItem,
  DryRunReviewResult,
} from "./ExecutionQueueTypes";

export function reviewDryRunItem(
  item: ExecutionQueueItem
): DryRunReviewResult {
  return {
    item: {
      ...item,
      status: "reviewed",
    },
    summary:
      `Dry Run Review : ${item.kind} / risque=${item.risk}. ` +
      `Action vérifiée en simulation uniquement. ` +
      `Aucune exécution externe réelle n'est autorisée dans V10-021.`,
  };
}
