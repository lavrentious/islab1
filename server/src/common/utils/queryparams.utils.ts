export function nullableBooleanFromString(
  s: string | boolean | undefined | null,
): string | boolean | undefined | null {
  if (typeof s === "boolean") return s;
  if (s === "null" || s === null) return null;
  if (s === undefined) return undefined;
  if (s === "true") return true;
  if (s === "false") return false;
  return s;
}
