import { Gift, Mail, MapPin, Phone, Search } from 'lucide-react';
import { AiChatIcon } from './AiChatIcon';
import { useHotel } from '../context/HotelContext';

interface AvailabilityBarFormLegacyProps {
  idPrefix?: string;
}

/** Previous two-field date + select form. Restore via AVAILABILITY_UI_MODE = 'legacy'. */
export function AvailabilityBarFormLegacy({ idPrefix = '' }: AvailabilityBarFormLegacyProps) {
  const hotel = useHotel();
  const arrivalId = `${idPrefix}arrival`;
  const departureId = `${idPrefix}departure`;
  const guestsId = `${idPrefix}guests`;
  const phoneHref = hotel?.phone ? `tel:${hotel.phone.replace(/\s/g, '')}` : '#';
  const mailHref = hotel?.email ? `mailto:${hotel.email}` : '#';

  return (
    <form className="availability-bar__form availability-bar__form--legacy" onSubmit={(e) => e.preventDefault()}>
      <div className="availability-bar__field">
        <label className="availability-bar__label" htmlFor={arrivalId}>Anreise</label>
        <input className="availability-bar__input" type="date" id={arrivalId} />
      </div>
      <div className="availability-bar__field">
        <label className="availability-bar__label" htmlFor={departureId}>Abreise</label>
        <input className="availability-bar__input" type="date" id={departureId} />
      </div>
      <div className="availability-bar__field">
        <label className="availability-bar__label" htmlFor={guestsId}>Gäste</label>
        <select className="availability-bar__select" id={guestsId} defaultValue="2">
          <option value="1">1 Erwachsener</option>
          <option value="2">2 Erwachsene</option>
          <option value="3">2 Erwachsene, 1 Kind</option>
          <option value="4">2 Erwachsene, 2 Kinder</option>
          <option value="5">Familie</option>
        </select>
      </div>
      <button type="submit" className="availability-bar__btn">
        <Search size={16} strokeWidth={1.5} />
        Verfügbarkeit prüfen
      </button>
      <div className="availability-bar__tools" aria-label="Schnelle Kontakte">
        <a className="availability-bar__tool" href="#" aria-label="Geschenkgutscheine">
          <Gift size={18} strokeWidth={1.5} />
        </a>
        <a className="availability-bar__tool" href={mailHref} aria-label="E-Mail schreiben">
          <Mail size={18} strokeWidth={1.5} />
        </a>
        <a className="availability-bar__tool" href={phoneHref} aria-label="Anrufen">
          <Phone size={18} strokeWidth={1.5} />
        </a>
        <a className="availability-bar__tool" href="#anreise" aria-label="Anreise und Lage">
          <MapPin size={18} strokeWidth={1.5} />
        </a>
      </div>
      <button type="button" className="availability-bar__chat" aria-label="Frage stellen">
        <AiChatIcon />
      </button>
    </form>
  );
}
