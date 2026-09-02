export type AgendaCalendarItem = {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  source: "google-calendar";
  readOnly: true;
};

export type AgendaCalendarSnapshot = {
  updatedAt: string;
  items: AgendaCalendarItem[];
  readOnly: true;
  error?: string;
};
