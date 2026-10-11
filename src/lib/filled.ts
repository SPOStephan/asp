// True when at least one value has content (text, list entries); used to hide empty parts.
export function filled(...values: unknown[]) {
  return values.some((value) => (typeof value === 'string' ? value.trim() !== '' : Array.isArray(value) ? value.length > 0 : false));
}
