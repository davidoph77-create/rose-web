export type CalendarResponseValidationInput = {
  originalMessage: string; resolvedQuery: string; answerText: string;
  intent?: string | null; eventCount?: number | null;
};
export type CalendarResponseValidationResult = {
  valid: boolean; warnings: string[]; normalizedText: string; diagnostic: string;
};
