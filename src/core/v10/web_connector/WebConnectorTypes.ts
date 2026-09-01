export type WebConnectorMode = "disabled" | "dry-run" | "ready";

export type WebControlledAction =
  | {
      type: "search";
      query: string;
    }
  | {
      type: "open_url";
      url: string;
    }
  | {
      type: "fetch";
      url: string;
    };

export type WebConnectorDecision = {
  approved: boolean;
  humanValidated: boolean;
  releaseGateConfirmed: boolean;
  evidenceIntegrityOk: boolean;
};

export type WebConnectorResult = {
  ok: boolean;
  mode: WebConnectorMode;
  executedExternally: boolean;
  message: string;
  action: WebControlledAction;
  provider: "web-controlled-connector";
  timestamp: string;
};
