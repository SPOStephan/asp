import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';

interface OfferLink {
  label: string;
  href: string;
}

interface OfferStory {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  details: string[];
  includes: string[];
  links: OfferLink[];
  image: string;
  image_alt: string;
}

const FALLBACK = {
  eyebrow: 'Arrangements',
  title_line1: 'Unsere besten Angebote',
  title_line2: 'für Ihre',
  title_script: 'Nordsee-Ferien',
  intro:
    'Zwei Arrangements, klar erzählt. Kein Buchungsraster — sondern zwei Geschichten vom Meer, mit allem was dazugehört.',
  note_title: 'Ein anderes Arrangement?',
  note_text: 'Wir stellen Ihnen gern ein individuelles Paket zusammen — passend zu Anreise, Anlass und Tempo.',
  note_cta: 'Persönliche Beratung',
  items: [
    {
      id: 'wellnessurlaub',
      title: 'Wellnessurlaub',
      subtitle: 'Auszeit am Meer',
      text:
        'Drei Nächte zwischen Suite, Spa und Salzwasser. Ein Guthaben für Anwendungen, der Pool mit Weitblick und Zeit, die niemand plant.',
      details: ['3 Nächte', 'ab 655 Euro pro Person'],
      includes: [
        'Übernachtung mit Frühstück',
        '50 € Wellnessguthaben',
        'Zugang zum gesamten Spa',
        'Late Check-out nach Verfügbarkeit',
      ],
      links: [
        { label: 'Jetzt buchen', href: '#buchung' },
      ],
      image: '/teaser-spa.webp',
      image_alt: 'Wellness und Spa im ambassador hotel & spa',
    },
    {
      id: 'feiertage',
      title: 'Feiertage',
      subtitle: 'Weihnachten mit Meerblick',
      text:
        'Die stillen Tage am Deich. Festliche Menüs, ein helles Zimmer zum Meer und Abende, die länger werden als der Kalender.',
      details: ['3 Nächte', 'ab 655 Euro pro Person'],
      includes: [
        'Übernachtung mit Frühstück',
        'Festtagsmenüs an den Feiertagen',
        'Zugang zum gesamten Spa',
        'Kleine Aufmerksamkeit zur Anreise',
      ],
      links: [
        { label: 'Jetzt buchen', href: '#buchung' },
      ],
      image: '/collage-dining1.webp',
      image_alt: 'Festliche Kulinarik im Hotel',
    },
  ] satisfies OfferStory[],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function OffersPage() {
  const location = useLocation();
  const hotel = useHotel();
  const page = useSection('offers_page');
  const homeOffers = useSection('offers');

  const data = page ?? FALLBACK;
  const rawItems = (data.items ?? homeOffers?.items ?? FALLBACK.items) as Array<
    Partial<OfferStory> & { image_primary?: string; image_primary_alt?: string }
  >;
  const items: OfferStory[] = rawItems.map((item, index) => {
    const fallback = FALLBACK.items[index] ?? FALLBACK.items[0];
    return {
      id: item.id ?? slugify(item.title ?? fallback.title),
      title: item.title ?? fallback.title,
      subtitle: item.subtitle ?? fallback.subtitle,
      text: item.text ?? fallback.text,
      details: item.details ?? fallback.details,
      includes: item.includes ?? fallback.includes,
      links: item.links?.length ? item.links : fallback.links,
      image: item.image ?? item.image_primary ?? fallback.image,
      image_alt: item.image_alt ?? item.image_primary_alt ?? fallback.image_alt,
    };
  });

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.title_line1 ?? 'Angebote'} | ${hotel?.name ?? 'ambassador hotel & spa'}`;
    return () => {
      document.title = previous;
    };
  }, [data.title_line1, hotel?.name]);

  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (!id) {
      window.scrollTo({ top: 0 });
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);

  const adviceHref = hotel?.email ? `mailto:${hotel.email}` : '#buchung';

  return (
    <main className="offers-page">
      <header className="offers-page__hero">
        <p className="eyebrow">{data.eyebrow ?? FALLBACK.eyebrow}</p>
        <h1 className="offers-page__title heading-font">
          {data.title_line1 ?? FALLBACK.title_line1}
          <br />
          {data.title_line2 ?? FALLBACK.title_line2}{' '}
          <span className="offers-page__script">{data.title_script ?? FALLBACK.title_script}</span>
        </h1>
        <p className="offers-page__intro">{data.intro ?? FALLBACK.intro}</p>
      </header>

      <section className="offers-page__pair" aria-label="Aktuelle Angebote">
        {items.map((item, index) => (
          <Reveal key={item.id} delay={index * 80}>
            <article className="offers-page__story" id={item.id}>
              <figure className="offers-page__photo">
                <img src={item.image} alt={item.image_alt} />
              </figure>
              <p className="offers-page__kicker">{item.title}</p>
              <h2 className="offers-page__name heading-font">{item.subtitle}</h2>
              <p className="offers-page__text">{item.text}</p>
              {item.includes.length ? (
                <ul className="offers-page__includes">
                  {item.includes.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              ) : null}
              {item.details.length ? (
                <div className="offers-page__meta">
                  {item.details.map((detail) => (
                    <p key={detail}>{detail}</p>
                  ))}
                </div>
              ) : null}
              {item.links.length ? (
                <div className="offers-page__links">
                  {item.links.map((link) => (
                    <TextCta key={link.label} href={link.href}>
                      {link.label}
                    </TextCta>
                  ))}
                </div>
              ) : null}
            </article>
          </Reveal>
        ))}
      </section>

      <section className="offers-page__note">
        <h2 className="offers-page__note-title heading-font">
          {data.note_title ?? FALLBACK.note_title}
        </h2>
        <p className="offers-page__note-text">{data.note_text ?? FALLBACK.note_text}</p>
        <TextCta href={data.note_cta_href ?? adviceHref}>
          {data.note_cta ?? FALLBACK.note_cta}
        </TextCta>
      </section>
    </main>
  );
}
