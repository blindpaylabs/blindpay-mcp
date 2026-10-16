/** Narrowing helpers for parsed JSON shared by the scripts/lib rule sets. */

export type Json = Record<string, unknown>;

export function asObject(value: unknown): Json {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : {};
}

export function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}
