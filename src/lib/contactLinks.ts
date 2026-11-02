import { useHotel, useSection } from '../context/HotelContext';

export interface ContactLinks {
  mail: string;
  phone: string;
  arrival: string;
  voucher: string;
}

// Mail, phone, arrival and vouchers of the hotel, as set in the CMS (Logo & Leiste). Vouchers
// only with a link; arrival opens the address in Google Maps unless another target is set.
export function useContactLinks(): ContactLinks {
  const hotel = useHotel();
  const bar = useSection('navbar') ?? {};
  const voucher = typeof bar.bar_voucher_href === 'string' ? bar.bar_voucher_href.trim() : '';
  const ownArrival = typeof bar.bar_arrival_href === 'string' ? bar.bar_arrival_href.trim() : '';
  const mapsQuery = [hotel?.name, hotel?.address].filter(Boolean).join(', ');
  return {
    mail: hotel?.email ? `mailto:${hotel.email}` : '',
    phone: hotel?.phone ? `tel:${hotel.phone.replace(/\s/g, '')}` : '',
    arrival: ownArrival || (mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}` : ''),
    voucher,
  };
}

export function externalProps(href: string) {
  return /^https?:\/\//i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}
