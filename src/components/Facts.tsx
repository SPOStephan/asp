import { CmsSection } from '../cms/CmsSection';
import { Reveal } from './Reveal';
import { Clock, MapPin } from 'lucide-react';
import { resolveCmsIcon } from '../cms/cmsIcons';
import { useSection } from '../context/HotelContext';

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
    <CmsSection sectionKey="facts" label="Fakten">
    <section className="facts" id="anreise" aria-label="Wichtige Informationen">
      <div className="facts__inner">
        <Reveal>
          <div className="facts__head" data-cms-focus="title">
            <p className="eyebrow" data-cms-path="eyebrow">{data.eyebrow}</p>
            <h2 className="facts__title heading-font" data-cms-path="title">{data.title}</h2>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <dl className="facts__grid">
            {items.map((fact, index) => {
              const Icon = resolveCmsIcon(fact.icon, Clock);
              return (
                <div key={fact.label} className="facts__item" data-cms-focus={`items:${index}`}>
                  <Icon className="facts__icon" size={20} strokeWidth={1.25} aria-hidden="true" data-cms-path={`items.${index}.icon`} data-cms-kind="icon" />
                  <div>
                    <dt className="facts__label" data-cms-path={`items.${index}.label`}>{fact.label}</dt>
                    <dd className="facts__value" data-cms-path={`items.${index}.value`}>{fact.value}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </Reveal>
        <Reveal delay={200}>
          <div className="facts__location" data-cms-focus="location_text">
            <MapPin className="facts__location-icon" size={18} strokeWidth={1.25} aria-hidden="true" />
            <p className="facts__location-text">
              <strong>{data.location_label}</strong> {data.location_text}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
    </CmsSection>
  );
}
