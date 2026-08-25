import { useEffect, useState } from 'react';

export const PHONE_CHROME_MQ =
  '(max-width: 600px), (max-height: 500px) and (pointer: coarse)';

export function usePhoneChrome() {
  const [phone, setPhone] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(PHONE_CHROME_MQ).matches
  );

  useEffect(() => {
    const media = window.matchMedia(PHONE_CHROME_MQ);
    const apply = () => setPhone(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  return phone;
}

export function isBookingHash(hash: string) {
  return hash === '#buchung' || hash === '#buchung-fixed';
}
