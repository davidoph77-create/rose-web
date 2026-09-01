export type AdapterInvocationStatus =
  | "prepared"
  | "simulated"
  | "blocked"
  | "failed";

export type AdapterInvocationRequest = {
  id: string;
  createdAt: string;
  adapterId: string;
  capability: string;
  message: string;
  releaseGateId?: string;
  simulationOnly: true;
};

export type AdapterInvocationResult = {
  request: AdapterInvocationRequest;
  status: AdapterInvocationStatus;
  executedExternally: false;
  output: string;
};
