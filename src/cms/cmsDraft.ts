export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getPath(data: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, part) => {
    if (current == null) return undefined;
    if (Array.isArray(current)) {
      const byId = current.find((item) => isPlainObject(item) && item.id === part);
      if (byId) return byId;
      const index = Number(part);
      return Number.isInteger(index) ? current[index] : undefined;
    }
    if (isPlainObject(current)) return current[part];
    return undefined;
  }, data);
}

export function setPath(data: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const parts = path.split('.');
  const root = structuredClone(data);

  const write = (node: unknown, index: number): unknown => {
    const part = parts[index];
    const last = index === parts.length - 1;

    if (Array.isArray(node)) {
      const copy = node.slice();
      const byId = copy.findIndex((item) => isPlainObject(item) && item.id === part);
      const slot = byId >= 0 ? byId : Number(part);
      if (!Number.isInteger(slot) || slot < 0) return node;
      copy[slot] = last ? value : write(copy[slot] ?? {}, index + 1);
      return copy;
    }

    const object = isPlainObject(node) ? { ...node } : {};
    object[part] = last ? value : write(object[part], index + 1);
    return object;
  };

  return write(root, 0) as Record<string, unknown>;
}

export function fieldKind(key: string, value?: unknown): 'icon' | 'image' | 'text' | 'other' {
  const name = key.split('.').pop() ?? key;
  if (name === 'icon' || name.endsWith('_icon')) return 'icon';
  if (
    name === 'src' ||
    name === 'image' ||
    name.endsWith('_image') ||
    name.endsWith('_src') ||
    (name.includes('image_') && !name.endsWith('_alt') && !name.endsWith('_href'))
  ) {
    return 'image';
  }
  if (typeof value === 'string' || value == null) return 'text';
  return 'other';
}

export function isLongText(value: string, key = '') {
  const name = key.split('.').pop() ?? key;
  if (/text|intro|note|desc|copy|paragraph|amenities/i.test(name)) return true;
  return value.length > 72 || value.includes('\n');
}
