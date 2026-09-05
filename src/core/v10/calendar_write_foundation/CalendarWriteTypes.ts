export type CalendarWriteAction =
  | "create_event"
  | "update_event"
  | "delete_event";

export type CalendarWriteDraft = {
  id: string;
  action: CalendarWriteAction;
  title: string;
  start?: string;
  end?: string;
  location?: string;
  notes?: string;
  sourceMessage: string;
  requiresApproval: true;
  writeEnabled: false;
  status: "draft";
};

export type CalendarWritePreparationResult = {
  handled: boolean;
  draft?: CalendarWriteDraft;
  text: string;
  requiresApproval: true;
  writeEnabled: false;
};
