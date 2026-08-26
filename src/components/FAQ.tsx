import { CmsSection } from '../cms/CmsSection';
import { Reveal } from './Reveal';
import { TextCta } from './TextCta';
import { useHotelContent } from '../context/HotelContext';
import type { HotelFAQ } from '../lib/supabase';

function sortHomeFaqs(faqs: HotelFAQ[]): HotelFAQ[] {
  return [...faqs].sort((a, b) => {
    const aGeneral = a.category === 'Allgemein' ? 0 : 1;
    const bGeneral = b.category === 'Allgemein' ? 0 : 1;
    if (aGeneral !== bGeneral) return aGeneral - bGeneral;
    return a.sort_order - b.sort_order;
  });
}

function FaqItem({ item }: { item: HotelFAQ }) {
  return (
    <details className="faq__item">
      <summary className="faq__question">
        <span>{item.question}</span>
        <span className="faq__icon" aria-hidden="true" />
      </summary>
      <div className="faq__answer">
        <p>{item.answer}</p>
      </div>
    </details>
  );
}

export function FAQ() {
  const { content } = useHotelContent();
  const sectionData = content?.sections['faq_home_section'];

  if (!content || !sectionData) return null;

  const homeFaqs = sortHomeFaqs(content.faqs.filter((item) => item.show_on_home));
  const splitAt = Math.ceil(homeFaqs.length / 2);
  const leftFaqs = homeFaqs.slice(0, splitAt);
  const rightFaqs = homeFaqs.slice(splitAt);

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
    <CmsSection sectionKey="faq_home_section" label="FAQ">
    <section className="faq" id="faq" aria-label="Häufig gestellte Fragen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container">
        <Reveal>
          <div className="faq__head" data-cms-focus="title">
            <p className="eyebrow">{sectionData.eyebrow}</p>
            <h2 className="faq__title heading-font">{sectionData.title}</h2>
          </div>
        </Reveal>
      </div>

      <Reveal delay={100}>
        <div className="faq__list faq__list--home">
          <div className="faq__col">
            {leftFaqs.map((item) => (
              <FaqItem key={item.id} item={item} />
            ))}
          </div>
          <div className="faq__col">
            {rightFaqs.map((item) => (
              <FaqItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </Reveal>
      <Reveal delay={200}>
        <div className="faq__more">
          <TextCta href="/faqs" className="faq__more-link">
            Alle Fragen ansehen
          </TextCta>
        </div>
      </Reveal>
    </section>
    </CmsSection>
  );
}
