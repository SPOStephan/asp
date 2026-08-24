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
}

export function RoomAmenityGrid({ items }: RoomAmenityGridProps) {
  if (!items.length) return null;

  return (
    <ul className="room-amenities" aria-label="Ausstattung">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        return (
          <li key={item.label} className="room-amenities__item">
            <Icon size={22} strokeWidth={1.4} aria-hidden="true" />
            <span>{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
