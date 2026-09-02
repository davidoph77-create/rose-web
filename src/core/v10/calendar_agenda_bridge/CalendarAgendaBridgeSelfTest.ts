import {
  getAgendaCalendarSnapshot,
  refreshAgendaCalendarBridge,
} from "./CalendarAgendaBridge";

export async function runCalendarAgendaBridgeSelfTest() {
  const before = getAgendaCalendarSnapshot();
  const after = await refreshAgendaCalendarBridge(1);

  return {
    module: "V10-041",
    bridgeReady: true,
    readOnly: true,
    beforeCount: before.items.length,
    afterCount: after.items.length,
    error: after.error,
  };
}
