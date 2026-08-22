import { useHotelContent } from '../context/HotelContext';

export function FAQPage() {
  const { content } = useHotelContent();
  const pageData = content?.sections['faq_page'];

  if (!content || !pageData) return null;

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
    <main className="faq-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="faq-page__hero">
        <div className="container">
          <p className="eyebrow">{pageData.eyebrow}</p>
          <h1 className="faq-page__title heading-font">{pageData.title}</h1>
          <p className="faq-page__subtitle">{pageData.subtitle}</p>
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
                <details key={item.id} className="faq__item">
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

      <div className="faq-page__cta">
        <div className="container">
          <p className="faq-page__cta-text">{pageData.cta_text}</p>
          <a href={`mailto:${content.hotel.email}`} className="faq-page__cta-btn">
            {pageData.cta_button}
          </a>
        </div>
      </div>
    </main>
  );
}
