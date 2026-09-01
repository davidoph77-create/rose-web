export type VerificationStatus =
  | "verified"
  | "warning"
  | "failed";

export type InvocationVerification = {
  id: string;
  createdAt: string;
  invocationId: string;
  adapterId: string;
  capability: string;
  status: VerificationStatus;
  externalExecutionDetected: false;
  checks: {
    invocationCompleted: boolean;
    simulationOnly: boolean;
    noExternalExecution: boolean;
    outputPresent: boolean;
  };
  summary: string;
};
