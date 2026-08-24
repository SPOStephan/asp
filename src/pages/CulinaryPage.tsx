import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { IncludeList } from '../components/IncludeList';
import { Reveal } from '../components/Reveal';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import {
  CULINARY_PAGE_FALLBACK,
  resolveCulinaryRhythm,
  resolveCulinaryVenues,
} from '../lib/culinary';

export function CulinaryPage() {
  const hotel = useHotel();
  const page = useSection('culinary_page');
  const home = useSection('culinary');
  const location = useLocation();
  const data = page ?? CULINARY_PAGE_FALLBACK;
  const items = resolveCulinaryVenues(data.items);
  const rhythm = resolveCulinaryRhythm(data.rhythm);
  const adviceHref = hotel?.email ? `mailto:${hotel.email}` : '#buchung';

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.title ?? 'Kulinarik'} | ${hotel?.name ?? 'ambassador hotel & spa'}`;

    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const timer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return () => {
        document.title = previous;
        window.clearTimeout(timer);
      };
    }

    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
    };
  }, [data.title, hotel?.name, location.hash]);

  return (
    <main>
      <SubpageHero
        image={data.hero_image ?? CULINARY_PAGE_FALLBACK.hero_image}
        imageAlt={data.hero_image_alt ?? home?.hero_image_alt ?? CULINARY_PAGE_FALLBACK.hero_image_alt}
        eyebrow={page?.eyebrow ?? CULINARY_PAGE_FALLBACK.eyebrow}
        title={page?.title ?? CULINARY_PAGE_FALLBACK.title}
        subtitle={page?.subtitle ?? CULINARY_PAGE_FALLBACK.subtitle}
      >
        <div className="culinary-page">
          <p className="culinary-page__intro">
            {data.intro ?? home?.text ?? CULINARY_PAGE_FALLBACK.intro}
          </p>

          <nav className="culinary-page__jump" aria-label="Restaurants">
            {items.map((venue) => (
              <a key={venue.id} href={`#${venue.id}`} className="culinary-page__jump-link">
                {venue.name}
              </a>
            ))}
          </nav>

          <section className="culinary-page__venues" aria-label="Restaurants im Haus">
            {items.map((venue, index) => (
              <Reveal key={venue.id} delay={index * 60}>
                <article
                  className={`culinary-venue${index % 2 === 1 ? ' culinary-venue--reverse' : ''}`}
                  id={venue.id}
                >
                  <figure className="culinary-venue__photo">
                    <img src={venue.image} alt={venue.image_alt} />
                  </figure>
                  <div className="culinary-venue__copy">
                    <p className="culinary-venue__kicker">{venue.kicker}</p>
                    <h2 className="culinary-venue__name heading-font">{venue.name}</h2>
                    <p className="culinary-venue__text">{venue.text}</p>
                    {venue.details.length ? (
                      <dl className="culinary-venue__facts">
                        {venue.details.map((fact) => (
                          <div key={fact.label}>
                            <dt>{fact.label}</dt>
                            <dd>{fact.value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                    <IncludeList items={venue.includes} />
                    <TextCta href={adviceHref}>Tisch reservieren</TextCta>
                  </div>
                </article>
              </Reveal>
            ))}
          </section>

          <section className="culinary-page__rhythm" aria-label="Vom Morgen bis in die Nacht">
            {rhythm.map((item) => (
              <article key={item.title} className="culinary-page__beat">
                <p className="culinary-page__beat-kicker">{item.kicker}</p>
                <h2 className="culinary-page__beat-title heading-font">{item.title}</h2>
                <p className="culinary-page__beat-text">{item.text}</p>
              </article>
            ))}
          </section>

          <p className="culinary-page__aside">
            <strong>{data.also_title ?? CULINARY_PAGE_FALLBACK.also_title}.</strong>{' '}
            {data.also_text ?? CULINARY_PAGE_FALLBACK.also_text}
          </p>

          <section className="culinary-page__note">
            <h2 className="culinary-page__note-title heading-font">
              {data.note_title ?? CULINARY_PAGE_FALLBACK.note_title}
            </h2>
            <p className="culinary-page__note-text">
              {data.note_text ?? CULINARY_PAGE_FALLBACK.note_text}
            </p>
            <TextCta href={data.note_cta_href ?? adviceHref}>
              {data.note_cta ?? CULINARY_PAGE_FALLBACK.note_cta}
            </TextCta>
          </section>
        </div>
      </SubpageHero>
    </main>
  );
}
