import { CmsSection } from '../cms/CmsSection';
import { FAQ_PAGE_FALLBACK } from '../cms/cmsPages';
import { useHotelContent } from '../context/HotelContext';

export function FAQPage() {
  const { content } = useHotelContent();
  const pageData = { ...FAQ_PAGE_FALLBACK, ...content?.sections['faq_page'] };

  if (!content) return null;

  const faqsByCategory = content.faqs.reduce<
    Record<string, typeof content.faqs>
  >((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const categories = Object.keys(faqsByCategory);
  const allFaqs = content.faqs;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <CmsSection sectionKey="faq_page" label="FAQ">
    <main className="faq-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="faq-page__hero">
        <div className="container">
          <p className="eyebrow" data-cms-focus="head" data-cms-path="eyebrow">{pageData.eyebrow}</p>
          <h1 className="faq-page__title heading-font" data-cms-focus="title" data-cms-path="title">{pageData.title}</h1>
          <p className="faq-page__subtitle" data-cms-focus="subtitle" data-cms-path="subtitle">{pageData.subtitle}</p>
        </div>
      </div>

      <div className="faq-page__nav">
        <div className="container">
          <nav className="faq-page__cats" aria-label="FAQ-Kategorien">
            {categories.map((cat) => (
              <a
                key={cat}
                href={`#${cat.replace(/\s+/g, '-').toLowerCase()}`}
                className="faq-page__cat-link link-underline"
              >
                {cat}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="container">
        {categories.map((cat) => (
          <section
            key={cat}
            className="faq-page__section"
            id={cat.replace(/\s+/g, '-').toLowerCase()}
            aria-label={cat}
          >
            <h2 className="faq-page__cat-title heading-font">{cat}</h2>
            <div className="faq__list">
              {faqsByCategory[cat].map((item) => (
                <details key={item.id} className="faq__item" data-cms-focus={`faq:${item.id}`}>
                  <summary className="faq__question">
                    <span>{item.question}</span>
                    <span className="faq__icon" aria-hidden="true" />
                  </summary>
                  <div className="faq__answer">
                    <p>{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="faq-page__cta" data-cms-focus="cta">
        <div className="container">
          <p className="faq-page__cta-text" data-cms-path="cta_text">{pageData.cta_text}</p>
          <a href={`mailto:${content.hotel.email}`} className="faq-page__cta-btn" data-cms-path="cta_button">
            {pageData.cta_button}
          </a>
        </div>
      </div>
    </main>
    </CmsSection>
  );
}
