export type ControlledActionKind =
  | "calendar"
  | "web"
  | "business"
  | "memory"
  | "planning"
  | "general";

export type ControlledActionStatus =
  | "prepared"
  | "authorized"
  | "blocked"
  | "rejected"
  | "simulated";

export type ControlledAction = {
  id: string;
  createdAt: string;
  kind: ControlledActionKind;
  message: string;
  agent: string;
  approvalId?: string;
  status: ControlledActionStatus;
  external: boolean;
  reason: string;
};

export type ControlledExecutionResult = {
  action: ControlledAction;
  executedExternally: false;
  simulated: boolean;
  summary: string;
};
