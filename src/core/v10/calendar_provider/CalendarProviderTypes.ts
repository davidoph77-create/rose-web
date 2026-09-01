export type CalendarProviderCapability =
  | "read"
  | "create"
  | "update"
  | "delete";

export type CalendarProviderStatus =
  | "not-configured"
  | "ready"
  | "unavailable";

export type CalendarEventDraft = {
  title: string;
  startISO: string;
  endISO?: string;
  description?: string;
  location?: string;
};

export type CalendarProviderContext = {
  humanApproved: boolean;
  releaseGateConfirmed: boolean;
  evidenceIntegrityOk: boolean;
  dryRun: boolean;
};

export type CalendarProviderResult<T = unknown> = {
  ok: boolean;
  provider: string;
  executedExternally: boolean;
  message: string;
  data?: T;
  timestamp: string;
};
