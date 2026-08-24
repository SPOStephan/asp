import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHotel, useSection } from '../context/HotelContext';
import { remapSiteHref } from '../lib/links';
import { menuGroupHref } from '../lib/wellness';
import { TextCta } from '../components/TextCta';
import './MobileMenuLab.css';

interface NavLink {
  label: string;
  href: string;
}

interface MenuGroup {
  title: string;
  href?: string;
  links: NavLink[];
}

interface LanguageOption {
  code: string;
  label: string;
}

const FALLBACK_GROUPS: MenuGroup[] = [
  {
    title: 'Zimmer & Suiten',
    href: '/zimmer',
    links: [
      { label: 'Zimmer & Suiten', href: '/zimmer' },
      { label: 'Für jede Generation', href: '#suiten' },
      { label: 'Direkt buchen', href: '#direktbuchung' },
    ],
  },
  {
    title: 'Angebote',
    href: '/angebote',
    links: [
      { label: 'Aktuelle Angebote', href: '/angebote' },
      { label: 'Wellnessurlaub', href: '/angebote/wellnessurlaub' },
      { label: 'Feiertage', href: '/angebote/feiertage' },
    ],
  },
  {
    title: 'Erlebnisse',
    links: [
      { label: 'Hotel-Highlights', href: '#highlights' },
      { label: 'Entdecken', href: '#discover' },
      { label: 'Impressionen', href: '/impressionen' },
    ],
  },
  {
    title: 'Wellness',
    href: '/wellness',
    links: [
      { label: 'Schwimmbad & Sauna', href: '/wellness/schwimmbad-sauna' },
      { label: 'Wellness-Informationen', href: '/wellness/informationen' },
      { label: 'Auramaris Spa', href: '/wellness/auramaris' },
      { label: 'Termin-Vereinbarung', href: '/wellness/termin' },
      { label: 'Spa-Preisliste', href: '/wellness/preisliste' },
      { label: 'Angebot des Monats', href: '/wellness/angebot' },
    ],
  },
  {
    title: 'Kulinarik',
    href: '/kulinarik',
    links: [
      { label: 'Restaurant & Bar', href: '/kulinarik#restaurant' },
      { label: 'Strandstube', href: '/kulinarik#strandstube' },
      { label: 'Grill & Dine', href: '/kulinarik#grill' },
    ],
  },
  {
    title: 'Hotel',
    links: [
      { label: 'Das Resort', href: '#welcome' },
      { label: 'Anreise', href: '#anreise' },
      { label: 'Blog', href: '/blog' },
      { label: 'FAQ', href: '/faqs' },
      { label: 'Newsletter', href: '#newsletter' },
    ],
  },
];

const FALLBACK_LANGUAGES: LanguageOption[] = [
  { code: 'de', label: 'DE' },
  { code: 'en', label: 'EN' },
];

const SECONDARY = [
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faqs' },
];

function labGroupHref(title: string, href?: string) {
  const known = menuGroupHref(title, href);
  if (known) return known;
  if (title === 'Erlebnisse') return '#highlights';
  if (title === 'Hotel') return '#welcome';
  return undefined;
}

function useMenuData() {
  const data = useSection('navbar');
  const hotel = useHotel();
  const groups: MenuGroup[] = data?.menu_groups?.length ? data.menu_groups : FALLBACK_GROUPS;
  const languages: LanguageOption[] = data?.languages?.length ? data.languages : FALLBACK_LANGUAGES;
  return {
    groups,
    languages,
    logo: data?.logo_normal as string | undefined,
    hotelName: hotel?.name || 'ambassador hotel & spa',
    inquireHref: (data?.cta_solid_href as string | undefined) || '#anfragen',
    inquireLabel: (data?.cta_text as string | undefined) || 'Anfragen',
    bookHref: (data?.cta_solid_href as string | undefined) || '#buchen',
    bookLabel: (data?.cta_solid_text as string | undefined) || 'Buchen',
  };
}

function useMenuNavigation(onDone?: () => void) {
  const navigate = useNavigate();

  return (href: string, label?: string) => {
    onDone?.();
    const target = remapSiteHref(href, label);
    if (target.startsWith('#')) {
      navigate('/');
      window.setTimeout(() => {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const next = new URL(target, window.location.origin);
    navigate(`${next.pathname}${next.hash}`);
    if (!next.hash) window.scrollTo({ top: 0 });
  };
}

function TwoStepMenu({
  variant,
  onClose,
}: {
  variant: 'frame' | 'overlay';
  onClose?: () => void;
}) {
  const { groups, languages, logo, hotelName, inquireHref, inquireLabel, bookHref, bookLabel } =
    useMenuData();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [lang, setLang] = useState('de');
  const go = useMenuNavigation(onClose);
  const group = groups.find((item) => item.title === openGroup) ?? null;
  const groupHref = group ? labGroupHref(group.title, group.href) : undefined;

  useEffect(() => {
    if (variant !== 'overlay') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (openGroup) setOpenGroup(null);
      else onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [variant, openGroup, onClose]);

  return (
    <div className={`menu-proto menu-proto--${variant}`}>
      <header className="menu-proto__bar">
        {openGroup ? (
          <button type="button" className="menu-proto__back" onClick={() => setOpenGroup(null)}>
            <ChevronLeft size={20} strokeWidth={1.5} />
            <span>Zurück</span>
          </button>
        ) : (
          <span className="menu-proto__bar-spacer" />
        )}
        {logo ? (
          <img className="menu-proto__logo" src={logo} alt={hotelName} />
        ) : (
          <strong className="menu-proto__wordmark">{hotelName}</strong>
        )}
        <button
          type="button"
          className="menu-proto__close"
          onClick={onClose ?? (() => setOpenGroup(null))}
          aria-label="Menü schließen"
        >
          <span>Schließen</span>
          <X size={18} strokeWidth={1.6} />
        </button>
      </header>

      <div className="menu-proto__body">
        {group ? (
          <div className="menu-proto__level">
            <h2 className="menu-proto__group-title">{group.title}</h2>
            <ul className="menu-proto__links">
              {groupHref &&
              !group.links.some((link) => remapSiteHref(link.href, link.label) === groupHref) ? (
                <li>
                  <a
                    className="menu-proto__hub"
                    href={groupHref}
                    onClick={(event) => {
                      event.preventDefault();
                      go(groupHref, group.title);
                    }}
                  >
                    {group.title}
                  </a>
                </li>
              ) : null}
              {group.links.map((link) => (
                <li key={`${group.title}-${link.label}`}>
                  <a
                    href={remapSiteHref(link.href, link.label)}
                    onClick={(event) => {
                      event.preventDefault();
                      go(link.href, link.label);
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="menu-proto__level">
            <ul className="menu-proto__roots">
              {groups.map((item) => {
                const hub = labGroupHref(item.title, item.href);
                return (
                  <li key={item.title}>
                    <div className="menu-proto__root">
                      {hub ? (
                        <a
                          href={hub}
                          onClick={(event) => {
                            event.preventDefault();
                            go(hub, item.title);
                          }}
                        >
                          {item.title}
                        </a>
                      ) : (
                        <button type="button" onClick={() => setOpenGroup(item.title)}>
                          {item.title}
                        </button>
                      )}
                      <button
                        type="button"
                        className="menu-proto__more"
                        aria-label={`${item.title}: Unterpunkte`}
                        onClick={() => setOpenGroup(item.title)}
                      >
                        <ChevronRight size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <ul className="menu-proto__secondary">
              {SECONDARY.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(event) => {
                      event.preventDefault();
                      go(item.href, item.label);
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="menu-proto__langs" role="group" aria-label="Sprache">
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className={item.code === lang ? 'is-active' : ''}
                  onClick={() => setLang(item.code)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="menu-proto__dock">
        <button type="button" onClick={onClose ?? (() => setOpenGroup(null))} aria-label="Schließen">
          <X size={18} strokeWidth={1.6} />
        </button>
        <button type="button" onClick={() => go(inquireHref, inquireLabel)}>
          {inquireLabel}
        </button>
        <button type="button" onClick={() => go(bookHref, bookLabel)}>
          {bookLabel}
        </button>
      </footer>
    </div>
  );
}

export function MobileMenuLab() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Menü mobil · ambassador hotel & spa';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
      robots.remove();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-lab-open', open);
    return () => document.body.classList.remove('menu-lab-open');
  }, [open]);

  return (
    <main className="menu-lab">
      <header className="menu-lab__hero">
        <div className="container">
          <p className="menu-lab__kicker">Nur zum Anschauen · keine globale Änderung</p>
          <h1>Menü mobil</h1>
          <p className="menu-lab__lead">
            Links oben bleibt das <strong>heutige Menü</strong> — lange Liste, alle Unterpunkte
            zugleich. Daneben die <strong>zweistufige Variante</strong>: der Name des Hauptpunkts
            öffnet die Übersichtsseite, der Pfeil die Unterpunkte. Das Logo bleibt frei.
          </p>
        </div>
      </header>

      <section className="menu-lab__compare">
        <div className="container menu-lab__grid">
          <article className="menu-lab__card">
            <p className="menu-lab__card-kicker">Aktuell</p>
            <h2>Langes Menü</h2>
            <p>
              Über <em>Menü</em> oben links. Unverändert — zum direkten Vergleich, auch das
              Überlaufen über das Logo.
            </p>
          </article>

          <article className="menu-lab__card">
            <p className="menu-lab__card-kicker">Vorschlag</p>
            <h2>Zwei Stufen</h2>
            <p>
              Den Namen antippen — Wellness, Kulinarik, Zimmer — führt auf die Seite. Nur der
              Pfeil öffnet die Unterpunkte. Zurück führt in die Übersicht.
            </p>
            <TextCta onClick={() => setOpen(true)}>Variante öffnen</TextCta>
          </article>
        </div>

        <div className="menu-lab__stage" aria-hidden={open}>
          <div className="menu-lab__phone">
            <TwoStepMenu variant="frame" />
          </div>
        </div>
      </section>

      {open ? (
        <div className="menu-lab__overlay" role="dialog" aria-modal="true" aria-label="Zweistufiges Menü">
          <TwoStepMenu variant="overlay" onClose={() => setOpen(false)} />
        </div>
      ) : null}
    </main>
  );
}
