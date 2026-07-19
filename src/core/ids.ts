/**
 * Rose Core IDs V7.4.1 STABLE
 * Générateur unique d'identifiants pour toute l'application.
 */

let counter = 0;

export function generateId(prefix = "rose"): string {
  counter++;

  return [
    prefix,
    Date.now().toString(36),
    counter.toString(36),
    Math.random().toString(36).slice(2, 10),
  ].join("_");
}

export function generateTimestamp(): string {
  return new Date().toISOString();
}

export function resetIdCounter(): void {
  counter = 0;
}