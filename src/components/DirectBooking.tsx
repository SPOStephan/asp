import { Reveal } from './Reveal';
import {
  BadgeCheck,
  BadgePercent,
  BedDouble,
  Car,
  Star,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { TextCta } from './TextCta';
import { useSection } from '../context/HotelContext';

const iconMap: Record<string, LucideIcon> = {
  BadgePercent,
  Car,
  BedDouble,
  BadgeCheck,
  Wifi,
  Star,
};

interface BenefitItem {
  icon: string;
  title: string;
  text?: string;
}

const FALLBACK = {
  eyebrow: 'Ihr Vorteil',
  title: 'Direktbuchung',
  subtitle: 'Buchen Sie direkt bei uns — und sichern Sie sich diese Extra-Leistungen.',
  cta_text: 'Jetzt direkt buchen',
  cta_href: '#buchung',
  items: [
    { icon: 'BadgePercent', title: 'Bestpreisgarantie' },
    { icon: 'Car', title: 'Parkrabatt 10 € pro Nacht', text: 'nach Verfügbarkeit' },
    { icon: 'BedDouble', title: 'Alle Zimmerkategorien' },
    { icon: 'BadgeCheck', title: 'Sofortige Buchungsbestätigung' },
    { icon: 'Wifi', title: 'Kostenfreies WLAN' },
    { icon: 'Star', title: 'Stammgastpass-Vorteil' },
  ] satisfies BenefitItem[],
};

export function DirectBooking() {
  const cms = useSection('direct_booking');
  const data = cms ?? FALLBACK;
  const items: BenefitItem[] = data.items ?? FALLBACK.items;

  return (
    <section className="direct-booking" id="direktbuchung" aria-label="Vorteile der Direktbuchung">
      <div className="direct-booking__inner">
        <Reveal>
          <div className="direct-booking__intro">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 className="direct-booking__title heading-font">{data.title}</h2>
            {data.subtitle ? <p className="direct-booking__subtitle">{data.subtitle}</p> : null}
            {data.cta_text ? (
              <TextCta className="direct-booking__link" href={data.cta_href || '#buchung'}>
                {data.cta_text}
              </TextCta>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={80}>
          <ul className="direct-booking__list">
            {items.map((item) => {
              const Icon = iconMap[item.icon] ?? Star;
              return (
                <li key={item.title} className="direct-booking__item">
                  <Icon className="direct-booking__icon" size={22} strokeWidth={1.25} aria-hidden="true" />
                  <div>
                    <p className="direct-booking__item-title">{item.title}</p>
                    {item.text ? <p className="direct-booking__item-text">{item.text}</p> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
