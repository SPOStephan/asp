import { useState } from 'react';
import { CmsSection } from '../cms/CmsSection';
import { Reveal } from './Reveal';
import { Mail, Check, ArrowRight } from 'lucide-react';
import { useSection } from '../context/HotelContext';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const data = useSection('newsletter');

  if (!data) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubmitted(true);
    }
  };

  return (
    <CmsSection sectionKey="newsletter" label="Newsletter">
    <section className="newsletter" id="newsletter">
      <div className="newsletter__bg" />
      <Reveal>
        <div className="newsletter__inner">
          <div className="newsletter__text" data-cms-focus="title_line1">
            <p className="eyebrow newsletter__eyebrow">{data.eyebrow}</p>
            <h2 className="newsletter__title heading-font">
              {data.title_line1}<br />
              <em>{data.title_line2_em}</em>
            </h2>
            <p className="newsletter__desc" data-cms-focus="description">{data.description}</p>
          </div>

          <div className="newsletter__form-wrap">
            {submitted ? (
              <div className="newsletter__success">
                <Check size={28} strokeWidth={1.5} />
                <p>{data.success_message}</p>
              </div>
            ) : (
              <form className="newsletter__form" onSubmit={handleSubmit}>
                <div className="newsletter__input-group">
                  <Mail size={20} strokeWidth={1.5} />
                  <input
                    type="email"
                    placeholder="Ihre E-Mail-Adresse"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="newsletter__submit">
                  Abonnieren <ArrowRight size={18} strokeWidth={1.5} />
                </button>
              </form>
            )}
            <p className="newsletter__note">{data.note}</p>
          </div>
        </div>
      </Reveal>
    </section>
    </CmsSection>
  );
}
