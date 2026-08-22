import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useSection, useHotel } from '../context/HotelContext';

interface NavLink {
  label: string;
  href: string;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const data = useSection('navbar');
  const hotel = useHotel();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith('#')) {
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
      window.scrollTo({ top: 0 });
    }
  };

  if (!data) return null;

  const navLinks: NavLink[] = data.links ?? [];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} aria-label="Hauptnavigation">
      <div className="navbar__inner">
        <div className="navbar__left">
          <div className="navbar__links">
            {navLinks.map((link) => (
              <a
                key={link.href}
                className="navbar__link link-underline"
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
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
          <button className="navbar__lang">{data.lang_label}</button>
          <button className="navbar__cta" onClick={() => handleNavClick(data.cta_solid_href)}>
            {data.cta_text}
          </button>
          <a
            className="navbar__cta navbar__cta--solid"
            href={data.cta_solid_href}
            onClick={(e) => { e.preventDefault(); handleNavClick(data.cta_solid_href); }}
          >
            {data.cta_solid_text}
          </a>
        </div>

        <button
          className="navbar__burger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menü"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="navbar__mobile">
          {navLinks.map((link) => (
            <a
              key={link.href}
              className="navbar__mobile-link"
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            className="navbar__mobile-cta"
            href={data.cta_solid_href}
            onClick={(e) => { e.preventDefault(); handleNavClick(data.cta_solid_href); }}
          >
            Jetzt buchen
          </a>
        </div>
      )}
    </nav>
  );
}
