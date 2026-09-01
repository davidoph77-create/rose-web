export type CalendarConnectorMode = "disabled" | "dry-run" | "ready";

export type CalendarControlledAction =
  | {
      type: "create_event";
      title: string;
      startIso?: string;
      endIso?: string;
      notes?: string;
      location?: string;
    }
  | {
      type: "update_event";
      eventId: string;
      title?: string;
      startIso?: string;
      endIso?: string;
      notes?: string;
      location?: string;
    }
  | {
      type: "delete_event";
      eventId: string;
    };

export type CalendarConnectorDecision = {
  approved: boolean;
  humanValidated: boolean;
  releaseGateConfirmed: boolean;
  evidenceIntegrityOk: boolean;
};

export type CalendarConnectorResult = {
  ok: boolean;
  mode: CalendarConnectorMode;
  executedExternally: boolean;
  message: string;
  action: CalendarControlledAction;
  provider: "calendar-controlled-connector";
  timestamp: string;
};
