import { Mood } from "./types.ts";
import { clamp, normalizeText } from "./utils.ts";

export function detectMood(message: string): Mood {
  const text = normalizeText(message);

  if (/heureux|super|genial|cool|ravi|content|incroyable/.test(text)) {
    return "joy";
  }

  if (/triste|deprime|malheureux|seul|vide|decu/.test(text)) {
    return "sadness";
  }

  if (/enerve|furieux|colere|rage|saoule|marre/.test(text)) {
    return "anger";
  }

  if (/peur|angoisse|panique|inquiet|terrifi/.test(text)) {
    return "fear";
  }

  if (/stress|stresse|pression|submerge|anxieux|urgent/.test(text)) {
    return "stress";
  }

  if (/amour|je t aime|affection|tendre|je tiens a toi/.test(text)) {
    return "love";
  }

  return "neutral";
}

export function detectMoodScore(message: string): number {
  const text = normalizeText(message);
  let score = 20;

  if (/heureux|super|genial|cool|ravi|content|incroyable/.test(text)) score += 30;
  if (/triste|deprime|malheureux|seul|vide|decu/.test(text)) score += 35;
  if (/enerve|furieux|colere|rage|saoule|marre/.test(text)) score += 35;
  if (/peur|angoisse|panique|inquiet|terrifi/.test(text)) score += 40;
  if (/stress|stresse|pression|submerge|anxieux|urgent/.test(text)) score += 35;
  if (/amour|je t aime|affection|tendre|je tiens a toi/.test(text)) score += 30;

  return clamp(score, 20, 100);
}