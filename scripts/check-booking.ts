import assert from 'node:assert/strict';
import { bookingUrl, inquiryMailHref } from '../src/lib/availability';

const stay = { arrival: '2026-10-16', departure: '2026-10-18', adults: 2, children: 0 };

assert.equal(
  bookingUrl('https://onepagebooking.com/lohbeckambassador', stay),
  'https://onepagebooking.com/lohbeckambassador?arrival=16.10.2026&departure=18.10.2026',
);
assert.equal(
  bookingUrl('https://buchen.oversum-vitalresort.de/', stay),
  'https://buchen.oversum-vitalresort.de/?arrival=16.10.2026&departure=18.10.2026',
);
assert.equal(
  bookingUrl('onepagebooking.com/lohbeckambassador?lang=de', stay),
  'https://onepagebooking.com/lohbeckambassador?lang=de&arrival=16.10.2026&departure=18.10.2026',
  'keeps existing parameters and adds https',
);
assert.equal(
  bookingUrl('https://onepagebooking.com/lohbeckambassador', { ...stay, arrival: null, departure: null }),
  'https://onepagebooking.com/lohbeckambassador',
  'without dates the guest lands on the plain booking page',
);
assert.equal(bookingUrl('', stay), null);
assert.equal(bookingUrl(null, stay), null);
assert.match(inquiryMailHref('info@hotel.de', stay), /^mailto:info@hotel\.de\?subject=Anfrage%2016\.10\.2026/);

console.log('booking links ok');
