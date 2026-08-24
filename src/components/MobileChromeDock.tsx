import { useEffect } from 'react';
import { Menu, Phone } from 'lucide-react';
import { ChatCircleTextIcon } from '@phosphor-icons/react';
import { useHotel } from '../context/HotelContext';
import { useMobileChrome } from '../context/MobileChromeContext';
import { isBookingHash, usePhoneChrome } from '../lib/phoneChrome';
import { AvailabilityBarForm } from './AvailabilityBarForm';
import './MobileChromeDock.css';

function telHref(phone?: string | null) {
  const cleaned = (phone || '').replace(/\s/g, '');
  return cleaned ? `tel:${cleaned}` : '#';
}

export function MobileChromeDock() {
  const hotel = useHotel();
  const phone = usePhoneChrome();
  const { panel, openBook, closePanels, toggleBook, toggleChat, openMenu } = useMobileChrome();
  const mailHref = hotel?.email ? `mailto:${hotel.email}` : undefined;

  useEffect(() => {
    if (!phone) return;
    if (isBookingHash(window.location.hash)) openBook();
  }, [phone, openBook]);

  useEffect(() => {
    if (!phone) return;
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      const hash = new URL(link.href, window.location.origin).hash;
      if (!isBookingHash(hash)) return;
      event.preventDefault();
      openBook();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [phone, openBook]);

  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanels();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel, closePanels]);

  return (
    <div
      className="mobile-chrome"
      style={{ ['--mobile-dock' as string]: hotel?.primary_color || 'var(--primary-500)' }}
    >
      {panel === 'book' ? (
        <div
          id="buchung-mobile"
          className="availability-bar mobile-chrome__query"
          role="dialog"
          aria-label="Verfügbarkeit"
        >
          <AvailabilityBarForm idPrefix="dock-" hideExtras />
        </div>
      ) : null}

      {panel === 'chat' ? (
        <div className="mobile-chrome__chat-sheet" role="dialog" aria-label="Chat">
          <p>Schreiben Sie uns — der Chat sitzt hier, sobald er angebunden ist.</p>
          {mailHref ? <a href={mailHref}>E-Mail an das Hotel</a> : null}
        </div>
      ) : null}

      <nav className="mobile-chrome__dock" aria-label="App-Leiste">
        <button
          type="button"
          className="mobile-chrome__icon"
          aria-label="Menü"
          onClick={openMenu}
        >
          <Menu size={26} strokeWidth={1.5} />
        </button>
        <a className="mobile-chrome__icon" href={telHref(hotel?.phone)} aria-label="Hotel anrufen">
          <Phone size={24} strokeWidth={1.5} />
        </a>
        <button
          type="button"
          className={`mobile-chrome__book${panel === 'book' ? ' is-on' : ''}`}
          onClick={toggleBook}
        >
          Buchen
        </button>
      </nav>

      <button
        type="button"
        className={`mobile-chrome__fab${panel === 'chat' ? ' is-on' : ''}`}
        aria-label="Chat"
        onClick={toggleChat}
      >
        <ChatCircleTextIcon size={28} weight="thin" />
      </button>
    </div>
  );
}
