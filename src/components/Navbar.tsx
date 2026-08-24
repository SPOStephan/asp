import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { TextCta } from './TextCta';
import { useSection, useHotel } from '../context/HotelContext';
import { remapSiteHref } from '../lib/links';
import { menuGroupHref } from '../lib/wellness';

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

const FALLBACK_LANGUAGES: LanguageOption[] = [
  { code: 'de', label: 'DE' },
  { code: 'en', label: 'EN' },
];

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
      { label: 'Impressionen', href: '#impressionen' },
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
      { label: 'FAQ', href: '/faqs' },
      { label: 'Newsletter', href: '#newsletter' },
    ],
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState('de');
  const langRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const data = useSection('navbar');
  const hotel = useHotel();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-menu-open', menuOpen);
    return () => document.body.classList.remove('nav-menu-open');
  }, [menuOpen]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!langOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!langRef.current?.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLangOpen(false);
    };
    window.addEventListener('mousedown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [langOpen]);

  const handleNavClick = (href: string, label?: string) => {
    setMenuOpen(false);
    const target = remapSiteHref(href, label);
    if (target.startsWith('#')) {
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      const next = new URL(target, window.location.origin);
      navigate(`${next.pathname}${next.hash}`);
      if (!next.hash) {
        window.scrollTo({ top: 0 });
      }
    }
  };

  if (!data) return null;

  const navLinks: NavLink[] = data.links ?? [];
  const menuGroups: MenuGroup[] = data.menu_groups?.length ? data.menu_groups : FALLBACK_GROUPS;
  const languages: LanguageOption[] = data.languages?.length ? data.languages : FALLBACK_LANGUAGES;
  const currentLang = languages.find((item) => item.code === lang) ?? languages[0];
  const lightBar = scrolled || menuOpen;

  return (
    <nav
      className={`navbar${scrolled ? ' navbar--scrolled' : ''}${menuOpen ? ' navbar--menu-open' : ''}`}
      aria-label="Hauptnavigation"
    >
      <div className="navbar__inner">
        <div className="navbar__left">
          <TextCta
            className={lightBar ? '' : 'text-cta--on-dark'}
            onClick={() => {
              setLangOpen(false);
              setMenuOpen((open) => !open);
            }}
            aria-expanded={menuOpen}
            aria-controls="hauptmenue"
          >
            {data.menu_label || 'Menü'}
          </TextCta>
          <div className="navbar__links" aria-hidden={!scrolled}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                className="navbar__link link-underline"
                href={remapSiteHref(link.href, link.label)}
                tabIndex={scrolled ? 0 : -1}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href, link.label);
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <a
          href="/"
          className="navbar__logo"
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen(false);
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img
            className="navbar__logo-image navbar__logo-image--white"
            src={data.logo_white}
            alt={hotel?.name || ''}
          />
          <img
            className="navbar__logo-image navbar__logo-image--normal"
            src={data.logo_normal}
            alt={hotel?.name || ''}
          />
        </a>

        <div className="navbar__right">
          {menuOpen ? (
            <button
              type="button"
              className="navbar__close"
              onClick={() => setMenuOpen(false)}
            >
              <span>Schließen</span>
              <X size={18} strokeWidth={1.6} />
            </button>
          ) : (
            <>
              <div className="navbar__lang" ref={langRef}>
                <button
                  type="button"
                  className="navbar__lang-toggle"
                  aria-expanded={langOpen}
                  aria-haspopup="listbox"
                  aria-label="Sprache wählen"
                  onClick={() => setLangOpen((open) => !open)}
                >
                  {currentLang.label}
                </button>
                {langOpen && (
                  <ul className="navbar__lang-menu" role="listbox" aria-label="Sprachen">
                    {languages.map((item) => (
                      <li key={item.code}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={item.code === currentLang.code}
                          className={`navbar__lang-option${item.code === currentLang.code ? ' is-active' : ''}`}
                          onClick={() => {
                            setLang(item.code);
                            setLangOpen(false);
                          }}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="navbar__actions">
                <button className="navbar__cta" onClick={() => handleNavClick(data.cta_solid_href)}>
                  {data.cta_text}
                </button>
                <a
                  className="navbar__cta navbar__cta--solid"
                  href={data.cta_solid_href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(data.cta_solid_href);
                  }}
                >
                  {data.cta_solid_text}
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="navbar__backdrop"
            aria-label="Menü schließen"
            onClick={() => setMenuOpen(false)}
          />
          <div className="navbar__panel" id="hauptmenue">
            <div className="navbar__panel-inner">
              {menuGroups.map((group) => {
                const groupHref = menuGroupHref(group.title, group.href);
                return (
                <div key={group.title} className="navbar__group">
                  {groupHref ? (
                    <a
                      className="navbar__group-title"
                      href={groupHref}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(groupHref, group.title);
                      }}
                    >
                      {group.title}
                    </a>
                  ) : (
                    <h2 className="navbar__group-title">{group.title}</h2>
                  )}
                  <ul className="navbar__group-links">
                    {group.links.map((link) => (
                      <li key={`${group.title}-${link.label}`}>
                        <a
                          href={remapSiteHref(link.href, link.label)}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(link.href, link.label);
                          }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
