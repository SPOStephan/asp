import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TextCta } from '../components/TextCta';
import type { HotelFAQ } from '../lib/supabase';

// "/ueber-uns#geschichte": straight to that part once the page is there.
export function useHashScroll() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    return () => window.clearTimeout(timer);
  }, [hash]);
}

// Questions of a page (chosen in its CMS section), with the way to all questions.
export function FaqList({ id, title, faqs, more }: { id: string; title: string; faqs: HotelFAQ[]; more: boolean }) {
  return (
    <section className="hotel-faq container" id={id} aria-label={title}>
      <h2 className="hotel-section__title heading-font" data-cms-path="faq_title">
        {title}
      </h2>
      <div className="faq__list">
        {faqs.map((item) => (
          <details key={item.id} className="faq__item" data-cms-focus="faq_ids">
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
      {more ? (
        <div className="hotel-faq__more">
          <TextCta href="/faqs">ALLE FRAGEN</TextCta>
        </div>
      ) : null}
    </section>
  );
}
