import { Reveal } from './Reveal';
import { Clock, Car, Dog, Wifi, Dumbbell, Utensils, MapPin, Plane, type LucideIcon } from 'lucide-react';
import { useSection } from '../context/HotelContext';

const iconMap: Record<string, LucideIcon> = {
  Clock,
  Car,
  Dog,
  Wifi,
  Dumbbell,
  Utensils,
  MapPin,
  Plane,
};

interface FactItem {
  icon: string;
  label: string;
  value: string;
}

export function Facts() {
  const data = useSection('facts');

  if (!data) return null;

  const items: FactItem[] = data.items ?? [];

  return (
    <section className="facts" id="anreise" aria-label="Wichtige Informationen">
      <div className="container">
        <Reveal>
          <div className="facts__head">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 className="facts__title heading-font">{data.title}</h2>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <dl className="facts__grid">
            {items.map((fact) => {
              const Icon = iconMap[fact.icon] ?? Clock;
              return (
                <div key={fact.label} className="facts__item">
                  <div className="facts__icon" aria-hidden="true">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <dt className="facts__label">{fact.label}</dt>
                  <dd className="facts__value">{fact.value}</dd>
                </div>
              );
            })}
          </dl>
        </Reveal>
        <Reveal delay={200}>
          <div className="facts__location">
            <div className="facts__location-icon" aria-hidden="true">
              <MapPin size={22} strokeWidth={1.5} />
            </div>
            <p className="facts__location-text">
              <strong>{data.location_label}</strong> {data.location_text}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
