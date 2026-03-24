import { normalizeText } from "./utils.ts";

export type TaskCandidate = {
  title: string;
  description: string;
  priority: number;
};

export function extractTaskCandidates(message: string): TaskCandidate[] {
  const text = normalizeText(message);

  if (!/tache|todo|a faire|checklist|mission/.test(text)) {
    return [];
  }

  return [
    {
      title: "Nouvelle tâche détectée",
      description: message.trim(),
      priority: 70,
    },
  ];
}