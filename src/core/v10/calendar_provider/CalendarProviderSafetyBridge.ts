import { CalendarProviderRegistry } from "./CalendarProviderRegistry";
import {
  CalendarEventDraft,
  CalendarProviderContext,
  CalendarProviderResult,
} from "./CalendarProviderTypes";

function safetyOk(context: CalendarProviderContext) {
  return (
    context.humanApproved &&
    context.releaseGateConfirmed &&
    context.evidenceIntegrityOk
  );
}

export async function calendarProviderRead(
  context: CalendarProviderContext
): Promise<CalendarProviderResult> {
  const provider = CalendarProviderRegistry.get();

  if (!safetyOk(context)) {
    return {
      ok: false,
      provider: provider.id,
      executedExternally: false,
      message:
        "Calendar provider read blocked by V10 safety gate.",
      timestamp: new Date().toISOString(),
    };
  }

  if (!provider.listUpcoming) {
    return {
      ok: false,
      provider: provider.id,
      executedExternally: false,
      message: "Calendar provider has no read capability.",
      timestamp: new Date().toISOString(),
    };
  }

  return provider.listUpcoming(context);
}

export async function calendarProviderCreate(
  event: CalendarEventDraft,
  context: CalendarProviderContext
): Promise<CalendarProviderResult> {
  const provider = CalendarProviderRegistry.get();

  if (!safetyOk(context)) {
    return {
      ok: false,
      provider: provider.id,
      executedExternally: false,
      message:
        "Calendar write blocked by V10 safety gate.",
      timestamp: new Date().toISOString(),
    };
  }

  if (context.dryRun) {
    return {
      ok: true,
      provider: provider.id,
      executedExternally: false,
      message:
        "Calendar creation approved by V10 safety gate but kept in dry-run.",
      data: event,
      timestamp: new Date().toISOString(),
    };
  }

  if (!provider.createEvent) {
    return {
      ok: false,
      provider: provider.id,
      executedExternally: false,
      message: "Calendar provider has no create capability.",
      timestamp: new Date().toISOString(),
    };
  }

  return provider.createEvent(event, context);
}
