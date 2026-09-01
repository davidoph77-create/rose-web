export type ReleaseGateStatus =
  | "not_ready"
  | "ready_for_release"
  | "release_confirmed"
  | "release_cancelled";

export type ReleaseGateRecord = {
  id: string;
  createdAt: string;
  queueItemId: string;
  actionId: string;
  kind: string;
  message: string;
  risk: string;
  status: ReleaseGateStatus;
  simulationOnly: true;
  confirmedBy?: string;
  confirmedAt?: string;
};
