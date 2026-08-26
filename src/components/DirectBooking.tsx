import { CmsSection } from '../cms/CmsSection';
import { Reveal } from './Reveal';
import { Star } from 'lucide-react';
import { resolveCmsIcon } from '../cms/cmsIcons';
import { TextCta } from './TextCta';
import { useSection } from '../context/HotelContext';

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
    <CmsSection sectionKey="direct_booking" label="Direktbuchung">
    <section className="direct-booking" id="direktbuchung" aria-label="Vorteile der Direktbuchung">
      <div className="direct-booking__inner">
        <Reveal>
          <div className="direct-booking__intro" data-cms-focus="title">
            <p className="eyebrow" data-cms-path="eyebrow">{data.eyebrow}</p>
            <h2 className="direct-booking__title heading-font" data-cms-path="title">{data.title}</h2>
            {data.subtitle ? <p className="direct-booking__subtitle" data-cms-path="subtitle">{data.subtitle}</p> : null}
            {data.cta_text ? (
              <TextCta className="direct-booking__link" href={data.cta_href || '#buchung'}>
                {data.cta_text}
              </TextCta>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={80}>
          <ul className="direct-booking__list">
            {items.map((item, index) => {
              const Icon = resolveCmsIcon(item.icon, Star);
              return (
                <li key={item.title} className="direct-booking__item" data-cms-focus={`items:${index}`}>
                  <Icon className="direct-booking__icon" size={22} strokeWidth={1.25} aria-hidden="true" data-cms-path={`items.${index}.icon`} data-cms-kind="icon" />
                  <div>
                    <p className="direct-booking__item-title" data-cms-path={`items.${index}.title`}>{item.title}</p>
                    {item.text ? <p className="direct-booking__item-text">{item.text}</p> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
    </CmsSection>
  );
}
