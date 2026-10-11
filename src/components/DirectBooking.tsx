import { CmsSection } from '../cms/CmsSection';
import { useCms } from '../cms/CmsContext';
import { Reveal } from './Reveal';
import { CmsGlyph } from '../cms/CmsGlyph';
import { TextCta } from './TextCta';
import { useSection } from '../context/HotelContext';

interface BenefitItem {
  icon: string;
  icon_color?: string;
  title: string;
  text?: string;
}

// A hotel without its own section shows none: benefits differ from hotel to hotel.
const FALLBACK: { eyebrow: string; title: string; subtitle: string; cta_text: string; cta_href: string; items: BenefitItem[] } = {
  eyebrow: '',
  title: 'Direkt buchen',
  subtitle: '',
  cta_text: '',
  cta_href: '#buchung',
  items: [],
};

export function DirectBooking() {
  const editing = Boolean(useCms());
  const cms = useSection('direct_booking');
  const data: Record<string, any> = cms ?? FALLBACK;
  const items: BenefitItem[] = data.items ?? FALLBACK.items;

  if (!cms && !editing) return null;

  return (
    <CmsSection sectionKey="direct_booking" label="Direktbuchung">
    <section className="direct-booking" id="direktbuchung" aria-label="Vorteile der Direktbuchung">
      <div className="direct-booking__inner">
        <Reveal>
          <div className="direct-booking__intro" data-cms-focus="title">
            <p className="eyebrow" data-cms-path="eyebrow">{data.eyebrow}</p>
            <h2 className="direct-booking__title heading-font" data-cms-path="title">{data.title}</h2>
            {data.subtitle || editing ? <p className="direct-booking__subtitle" data-cms-path="subtitle">{data.subtitle}</p> : null}
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
              return (
                <li key={index} className="direct-booking__item" data-cms-focus={`items:${index}`}>
                  <span data-cms-path={`items.${index}.icon`} data-cms-kind="icon">
                    <CmsGlyph className="direct-booking__icon" name={item.icon} color={item.icon_color || data.icon_color} size={22} />
                  </span>
                  <div>
                    <p className="direct-booking__item-title" data-cms-path={`items.${index}.title`}>{item.title}</p>
                    {item.text || (editing && item.text !== undefined) ? <p className="direct-booking__item-text" data-cms-path={`items.${index}.text`}>{item.text}</p> : null}
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
