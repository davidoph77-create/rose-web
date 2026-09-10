import type { CalendarUpdateDraft } from "../calendar_update_foundation";
import type { ResolvedCalendarEvent } from "../calendar_event_resolver";

export type PendingCalendarUpdate = {
  draft: CalendarUpdateDraft;
  event: ResolvedCalendarEvent;
  createdAt: number;
};

export type CalendarUpdateApprovalResult = {
  handled: boolean;
  approved: boolean;
  text: string;
  pending?: PendingCalendarUpdate;
};

let pendingUpdate: PendingCalendarUpdate | null = null;

function normalize(input: string) {
  return (input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function rememberPendingCalendarUpdate(
  draft: CalendarUpdateDraft,
  event: ResolvedCalendarEvent
) {
  pendingUpdate = {
    draft,
    event,
    createdAt: Date.now(),
  };
}

export function clearPendingCalendarUpdate() {
  pendingUpdate = null;
}

export function getPendingCalendarUpdate() {
  return pendingUpdate;
}

export function handleCalendarUpdateApproval(
  message: string
): CalendarUpdateApprovalResult {
  if (!pendingUpdate) {
    return { handled: false, approved: false, text: "" };
  }

  // Expire stale conversational approvals after 15 minutes.
  if (Date.now() - pendingUpdate.createdAt > 15 * 60 * 1000) {
    pendingUpdate = null;
    return {
      handled: true,
      approved: false,
      text:
        "La demande de modification a expiré. Recommence la demande afin que je relise Google Calendar avant toute validation.",
    };
  }

  const n = normalize(message);

  const approve =
    /\b(oui|valide|valider|confirme|confirmer|d'accord|ok)\b/.test(n) &&
    /\b(modification|rendez-vous|rdv|changement|decalage|décalage|valide|confirme)\b/.test(n);

  const cancel =
    /\b(non|annule|annuler|abandonne|abandonner|laisse tomber)\b/.test(n);

  if (cancel) {
    pendingUpdate = null;
    return {
      handled: true,
      approved: false,
      text:
        "D’accord. La modification du rendez-vous est annulée. Aucun changement n’a été envoyé à Google Calendar.",
    };
  }

  if (!approve) {
    return { handled: false, approved: false, text: "" };
  }

  const current = pendingUpdate;
  const oldTime = current.draft.oldTime ?? "heure actuelle";
  const newTime = current.draft.newTime ?? "nouvelle heure à confirmer";

  return {
    handled: true,
    approved: true,
    pending: current,
    text:
      `Modification APPROUVÉE pour « ${current.event.summary} » : ${oldTime} → ${newTime}. ` +
      `L’événement Google Calendar identifié est ${current.event.id}. ` +
      "À cette étape, aucun PATCH, PUT ou DELETE n’est encore envoyé à Google Calendar.",
  };
}
