import { Reveal } from './Reveal';
import { TextCta } from './TextCta';
import { useHotelContent } from '../context/HotelContext';

export function FAQ() {
  const { content } = useHotelContent();
  const sectionData = content?.sections['faq_home_section'];

  if (!content || !sectionData) return null;

  const homeFaqs = content.faqs.filter((f) => f.show_on_home);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homeFaqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="faq" id="faq" aria-label="Häufig gestellte Fragen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container">
        <Reveal>
          <div className="faq__head">
            <p className="eyebrow">{sectionData.eyebrow}</p>
            <h2 className="faq__title heading-font">{sectionData.title}</h2>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="faq__list">
            {homeFaqs.map((item) => (
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
        </Reveal>
        <Reveal delay={200}>
          <div className="faq__more">
            <TextCta href="/faqs" className="faq__more-link">
              Alle Fragen ansehen
            </TextCta>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
