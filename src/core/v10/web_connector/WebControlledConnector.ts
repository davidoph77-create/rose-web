import {
  WebConnectorDecision,
  WebConnectorMode,
  WebConnectorResult,
  WebControlledAction,
} from "./WebConnectorTypes";

export class WebControlledConnector {
  private mode: WebConnectorMode = "dry-run";

  getMode(): WebConnectorMode {
    return this.mode;
  }

  setMode(mode: WebConnectorMode) {
    this.mode = mode;
  }

  async execute(
    action: WebControlledAction,
    decision: WebConnectorDecision
  ): Promise<WebConnectorResult> {
    const timestamp = new Date().toISOString();

    if (!decision.approved || !decision.humanValidated) {
      return {
        ok: false,
        mode: this.mode,
        executedExternally: false,
        message: "Web action blocked: human approval required.",
        action,
        provider: "web-controlled-connector",
        timestamp,
      };
    }

    if (!decision.releaseGateConfirmed || !decision.evidenceIntegrityOk) {
      return {
        ok: false,
        mode: this.mode,
        executedExternally: false,
        message: "Web action blocked: release gate or evidence integrity not confirmed.",
        action,
        provider: "web-controlled-connector",
        timestamp,
      };
    }

    if (this.mode !== "ready") {
      return {
        ok: true,
        mode: this.mode,
        executedExternally: false,
        message:
          "Web connector validated in controlled dry-run. No real network request was executed.",
        action,
        provider: "web-controlled-connector",
        timestamp,
      };
    }

    return {
      ok: true,
      mode: this.mode,
      executedExternally: false,
      message:
        "Web connector is ready, but real provider execution is still disabled in V10-038.",
      action,
      provider: "web-controlled-connector",
      timestamp,
    };
  }
}
