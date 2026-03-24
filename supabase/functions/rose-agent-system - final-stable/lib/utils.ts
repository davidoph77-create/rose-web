export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-–—]/g, " ")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsKeyword(text: string, keywords: string[]): boolean {
  const normalized = normalizeText(text);
  return keywords.some((keyword) =>
    normalized.includes(normalizeText(keyword))
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function truncate(text: string, length = 200): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function nowISO(): string {
  return new Date().toISOString();
}