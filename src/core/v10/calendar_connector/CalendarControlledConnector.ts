import {
  CalendarConnectorDecision,
  CalendarConnectorMode,
  CalendarConnectorResult,
  CalendarControlledAction,
} from "./CalendarConnectorTypes";

export class CalendarControlledConnector {
  private mode: CalendarConnectorMode = "dry-run";

  getMode(): CalendarConnectorMode {
    return this.mode;
  }

  setMode(mode: CalendarConnectorMode) {
    this.mode = mode;
  }

  async execute(
    action: CalendarControlledAction,
    decision: CalendarConnectorDecision
  ): Promise<CalendarConnectorResult> {
    const timestamp = new Date().toISOString();

    if (!decision.approved || !decision.humanValidated) {
      return {
        ok: false,
        mode: this.mode,
        executedExternally: false,
        message: "Calendar action blocked: human approval required.",
        action,
        provider: "calendar-controlled-connector",
        timestamp,
      };
    }

    if (!decision.releaseGateConfirmed || !decision.evidenceIntegrityOk) {
      return {
        ok: false,
        mode: this.mode,
        executedExternally: false,
        message: "Calendar action blocked: release gate or evidence integrity not confirmed.",
        action,
        provider: "calendar-controlled-connector",
        timestamp,
      };
    }

    if (this.mode !== "ready") {
      return {
        ok: true,
        mode: this.mode,
        executedExternally: false,
        message:
          "Calendar connector validated in controlled dry-run. No real calendar event was created.",
        action,
        provider: "calendar-controlled-connector",
        timestamp,
      };
    }

    // V10-037 intentionally stops here.
    // A real provider (Google Calendar / device calendar) must be injected in a later step.
    return {
      ok: true,
      mode: this.mode,
      executedExternally: false,
      message:
        "Calendar connector is ready, but real provider execution is still disabled in V10-037.",
      action,
      provider: "calendar-controlled-connector",
      timestamp,
    };
  }
}
