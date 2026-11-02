import {
  Armchair,
  Bath,
  BedDouble,
  Lock,
  Shirt,
  Sparkles,
  SunMedium,
  Tv,
  Users,
  Waves,
  Wifi,
  Wine,
  type LucideIcon,
} from 'lucide-react';
import type { AmenityIcon, RoomFeature } from '../lib/rooms';
import { useBench } from '../context/BenchContext';
import { benchAmenityIcon } from '../benchmark/benchAmenityIcon';

const ICONS: Record<AmenityIcon, LucideIcon> = {
  bed: BedDouble,
  terrace: SunMedium,
  view: Waves,
  bath: Bath,
  robe: Shirt,
  spa: Sparkles,
  wifi: Wifi,
  tv: Tv,
  minibar: Wine,
  safe: Lock,
  sitting: Armchair,
  family: Users,
};

interface RoomAmenityGridProps {
  items: RoomFeature[];
  color?: string;
}

export function RoomAmenityGrid({ items, color }: RoomAmenityGridProps) {
  const bench = useBench();
  if (!items.length) return null;

  return (
    <ul className="room-amenities" aria-label="Ausstattung">
      {items.map((item) => {
        const Icon = (bench && benchAmenityIcon(item.label)) || ICONS[item.icon];
        return (
          <li key={item.label} className="room-amenities__item" style={color ? { color } : undefined}>
            <Icon size={22} strokeWidth={1.4} aria-hidden="true" />
            <span>{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
