import { useHotel, useHotelContent, useSection } from '../context/HotelContext';
import { ARRIVAL_PATH, mapsSearchHref } from './arrivalPage';

export interface ContactLinks {
  mail: string;
  phone: string;
  arrival: string;
  voucher: string;
}

// Mail, phone, arrival and vouchers of the hotel, as set in the CMS (Logo & Leiste). Vouchers
// only with a link. Arrival: an own target if set, else the arrival page (if switched on),
// else the address in Google Maps.
export function useContactLinks(): ContactLinks {
  const hotel = useHotel();
  const bar = useSection('navbar') ?? {};
  const voucher = typeof bar.bar_voucher_href === 'string' ? bar.bar_voucher_href.trim() : '';
  const ownArrival = typeof bar.bar_arrival_href === 'string' ? bar.bar_arrival_href.trim() : '';
  const { isPageEnabled } = useHotelContent();
  const maps = mapsSearchHref(hotel?.name, hotel?.address);
  return {
    mail: hotel?.email ? `mailto:${hotel.email}` : '',
    phone: hotel?.phone ? `tel:${hotel.phone.replace(/\s/g, '')}` : '',
    arrival: ownArrival || (isPageEnabled('anreise') ? ARRIVAL_PATH : maps),
    voucher,
  };
}

export function externalProps(href: string) {
  return /^https?:\/\//i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}
