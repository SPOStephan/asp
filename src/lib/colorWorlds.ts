export type ColorWorld = 'blue' | 'red' | 'green';

export const COLOR_WORLDS: {
  id: ColorWorld;
  label: string;
  primary: string;
  accent: string;
}[] = [
  { id: 'blue', label: 'Blau', primary: '#133b5c', accent: '#957640' },
  { id: 'red', label: 'Rot', primary: '#6b1d2a', accent: '#957640' },
  { id: 'green', label: 'Grün', primary: '#1e4a38', accent: '#957640' },
];

export function colorWorldOf(id?: string | null) {
  return COLOR_WORLDS.find((item) => item.id === id) ?? COLOR_WORLDS[0];
}

export function colorWorldLabel(id?: string | null) {
  return colorWorldOf(id).label;
}

export function hotelColorsFromWorld(id?: string | null) {
  const world = colorWorldOf(id);
  return {
    primary_color: world.primary,
    secondary_color: world.accent,
    accent_color: world.accent,
  };
}
