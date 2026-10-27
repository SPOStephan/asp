// The "Preise anzeigen" switch: on by default, off drops only the lines naming an amount.
import assert from 'node:assert/strict';
import { isPriceText, offerDetails, pricesShown } from '../src/lib/prices';

assert.equal(pricesShown(undefined), true);
assert.equal(pricesShown({}), true);
assert.equal(pricesShown({ show_prices: true }), true);
assert.equal(pricesShown({ show_prices: false }), false);

for (const text of ['ab 276,50 Euro p. P.', '3 Nächte ab 379,50 Euro p. P.', '€ 55,00', 'ab 630 EUR', '89,90 €']) assert.ok(isPriceText(text), text);
for (const text of ['2 Nächte', 'Preis auf Anfrage', '2 Nächte geschenkt', 'Euro-Raum', '25 Jahre Erfahrung']) assert.ok(!isPriceText(text), text);

const details = ['2 Nächte', 'ab 276,50 Euro p. P.'];
assert.deepEqual(offerDetails(details, true), details);
assert.deepEqual(offerDetails(details, false), ['2 Nächte']);

console.log('prices ok');
