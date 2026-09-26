import { CmsSection } from '../cms/CmsSection';
import { SubpageHero } from '../components/SubpageHero';
import { usePageEnabled, useSection } from '../context/HotelContext';

const SECTIONS: Record<string, { label: string; fallbackTitle: string }> = {
  impressum: { label: 'Impressum', fallbackTitle: 'Impressum' },
  datenschutz: { label: 'Datenschutz', fallbackTitle: 'Datenschutz' },
  agb: { label: 'AGB', fallbackTitle: 'AGB' },
};

export function LegalPage({ pageKey }: { pageKey: 'impressum' | 'datenschutz' | 'agb' }) {
  const enabled = usePageEnabled(pageKey);
  const meta = SECTIONS[pageKey];
  const sectionKey = `legal_${pageKey}`;
  const data = useSection(sectionKey) ?? {};

  if (!enabled) {
    return (
      <main className="cms-missing">
        <h1>Seite nicht freigeschaltet</h1>
        <p>Dieses Muster ist für das Hotel aus.</p>
      </main>
    );
  }

  const title = String(data.title || meta.fallbackTitle);
  const body = String(data.body || '');
  const hero = String(data.hero_image || '');

  return (
    <CmsSection sectionKey={sectionKey} label={meta.label} hideable={false}>
      <main className="legal-page">
        {hero ? (
          <SubpageHero
            image={hero}
            imageAlt={String(data.hero_image_alt || title)}
            eyebrow={String(data.eyebrow || 'Rechtliches')}
            title={title}
            subtitle={String(data.subtitle || '')}
            focal={data.hero_focal}
            cms={{ section: sectionKey }}
          />
        ) : (
          <div className="faq-page__hero">
            <div className="container">
              <p className="eyebrow" data-cms-focus="head" data-cms-path="eyebrow">{String(data.eyebrow || 'Rechtliches')}</p>
              <h1 className="faq-page__title heading-font" data-cms-focus="title" data-cms-path="title">{title}</h1>
              {data.subtitle ? <p className="faq-page__subtitle" data-cms-focus="subtitle" data-cms-path="subtitle">{String(data.subtitle)}</p> : null}
            </div>
          </div>
        )}
        <div className="legal-page__body">
          <div data-cms-focus="body" data-cms-path="body" data-cms-kind="text">
            {body ? body.split(/\n{2,}/).map((part, index) => <p key={index}>{part}</p>) : <p>Dieser Container ist noch leer.</p>}
          </div>
        </div>
      </main>
    </CmsSection>
  );
}
