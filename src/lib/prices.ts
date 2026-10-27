// Hotels that only work with daily prices switch fixed prices off in the CMS (Angebote page,
// "Preise anzeigen"): the lines with an amount of the offers and the "from" prices of the rooms
// are then left out everywhere – on the website, in the page for search engines and in the
// concierge's knowledge. Stored as offers_page.show_prices; on unless switched off.
type Section = Record<string, unknown> | null | undefined;

export function pricesShown(offersPage: Section) {
  return offersPage?.show_prices !== false;
}

const AMOUNT = /\d[\d.,]*\s*(?:€|Euro\b|EUR\b)|(?:€|EUR)\s*\d/i;

export function isPriceText(text: string) {
  return AMOUNT.test(text);
}

// The detail lines of an offer, without those naming an amount when prices are off.
export function offerDetails(details: string[], shown: boolean) {
  return shown ? details : details.filter((line) => !isPriceText(line));
}
