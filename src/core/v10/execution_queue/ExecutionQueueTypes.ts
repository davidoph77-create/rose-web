export type ExecutionQueueStatus =
  | "queued"
  | "reviewed"
  | "cancelled";

export type ExecutionQueueItem = {
  id: string;
  createdAt: string;
  actionId: string;
  approvalId?: string;
  kind: string;
  message: string;
  risk: string;
  status: ExecutionQueueStatus;
  simulationOnly: true;
};

export type DryRunReviewResult = {
  item: ExecutionQueueItem;
  summary: string;
};
