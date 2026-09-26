import { useParams } from 'react-router-dom';
import { CmsSection } from '../cms/CmsSection';
import { SubpageHero } from '../components/SubpageHero';
import { usePageEnabled, useSection } from '../context/HotelContext';
import { genericSectionKey } from '../lib/pageTemplates';

export function GenericHotelPage() {
  const { slug = '' } = useParams();
  const enabled = usePageEnabled(slug);
  const sectionKey = genericSectionKey(slug);
  const data = useSection(sectionKey) ?? {};
  const items = Array.isArray(data.items) ? (data.items as Array<Record<string, unknown>>) : [];

  if (!enabled) {
    return (
      <main className="cms-missing">
        <h1>Seite nicht freigeschaltet</h1>
        <p>Diese Vorlage ist für das Hotel nicht aktiv.</p>
      </main>
    );
  }

  const title = String(data.title || slug);
  const body = String(data.body || data.intro || '');
  const hero = String(data.hero_image || '');

  return (
    <CmsSection sectionKey={sectionKey} label={title} hideable={false}>
      <main className="legal-page">
        {hero ? (
          <SubpageHero
            image={hero}
            imageAlt={String(data.hero_image_alt || title)}
            eyebrow={String(data.eyebrow || '')}
            title={title}
            subtitle={String(data.subtitle || '')}
            focal={data.hero_focal}
            cms={{ section: sectionKey }}
          />
        ) : (
          <div className="faq-page__hero">
            <div className="container">
              <p className="eyebrow" data-cms-focus="head" data-cms-path="eyebrow">{String(data.eyebrow || '')}</p>
              <h1 className="faq-page__title heading-font" data-cms-focus="title" data-cms-path="title">{title}</h1>
              {data.subtitle ? <p className="faq-page__subtitle" data-cms-focus="subtitle" data-cms-path="subtitle">{String(data.subtitle)}</p> : null}
            </div>
          </div>
        )}
        <div className="legal-page__body">
          <div data-cms-focus="body" data-cms-path="body" data-cms-kind="text">
            {body ? body.split(/\n{2,}/).map((part, index) => <p key={index}>{part}</p>) : <p>Dieser Container ist noch leer.</p>}
          </div>
          {items.length ? (
            <div className="legal-page__items">
              {items.map((item, index) => (
                <article key={String(item.id ?? index)} data-cms-focus={`items:${index}`}>
                  <h2>{String(item.title || item.name || `Element ${index + 1}`)}</h2>
                  {item.text ? <p>{String(item.text)}</p> : null}
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </main>
    </CmsSection>
  );
}
