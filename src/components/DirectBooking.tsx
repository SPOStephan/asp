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
          <div className="direct-booking__head">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 className="direct-booking__title heading-font">{data.title}</h2>
            {data.subtitle ? <p className="direct-booking__subtitle">{data.subtitle}</p> : null}
          </div>
        </Reveal>

        <div className="direct-booking__grid">
          {items.map((item, i) => {
            const Icon = iconMap[item.icon] ?? Star;
            return (
              <Reveal key={item.title} delay={i * 70}>
                <article className="direct-booking__item">
                  <div className="direct-booking__icon" aria-hidden="true">
                    <Icon size={26} strokeWidth={1.4} />
                  </div>
                  <h3 className="direct-booking__item-title">{item.title}</h3>
                  {item.text ? <p className="direct-booking__item-text">{item.text}</p> : null}
                </article>
              </Reveal>
            );
          })}
        </div>

        {data.cta_text ? (
          <Reveal delay={200}>
            <div className="direct-booking__cta">
              <a className="btn-primary" href={data.cta_href || '#buchung'}>
                {data.cta_text}
              </a>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
