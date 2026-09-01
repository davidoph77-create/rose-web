export type ValidationStatus =
  | "pending"
  | "approved"
  | "rejected";

export type ValidationRequest = {
  id: string;
  createdAt: string;
  agent: string;
  action: string;
  reason: string;
  external: boolean;
  status: ValidationStatus;
};

export type ValidationGateResult = {
  pending: ValidationRequest[];
  approved: ValidationRequest[];
  rejected: ValidationRequest[];
  blockedCount: number;
  summary: string;
};
