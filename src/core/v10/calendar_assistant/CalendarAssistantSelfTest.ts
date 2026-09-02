import { answerGoogleCalendarQuestion } from "./CalendarNaturalLanguage";

export async function runCalendarAssistantSelfTest() {
  const ignored = await answerGoogleCalendarQuestion(
    "Bonjour Rose, comment vas-tu ?"
  );

  return {
    module: "V10-041C",
    ready: true,
    readOnly: true,
    nonCalendarIgnored: ignored.handled === false,
    calendarWriteEnabled: false,
    autonomyEnabled: false,
  };
}
