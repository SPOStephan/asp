import { useEffect } from 'react';
import { fieldKind } from './cmsDraft';

const EXACT: Record<string, string> = {
  title: 'Titel',
  subtitle: 'Untertitel',
  eyebrow: 'Dachzeile',
  kicker: 'Dachzeile',
  intro: 'Einleitung',
  text: 'Text',
  body: 'Text',
  excerpt: 'Kurztext',
  name: 'Name',
  label: 'Bezeichnung',
  value: 'Wert',
  meta: 'Zusatz',
  price: 'Preis',
  price_note: 'Preishinweis',
  tagline: 'Slogan',
  caption: 'Bildunterschrift',
  cta_text: 'Button-Text',
  cta_button: 'Button-Text',
  travel_period: 'Reisezeitraum',
  travel_period_label: 'Bezeichnung Reisezeitraum',
};

// Turns a CMS path like "items.3.note_title" into the label an editor knows.
export function cmsFieldLabel(path: string): string {
  const leaf = path.split('.').pop() ?? path;
  if (EXACT[leaf]) return EXACT[leaf];
  if (leaf.endsWith('subtitle')) return 'Untertitel';
  if (leaf.endsWith('title')) return 'Titel';
  if (/(kicker|eyebrow)$/.test(leaf)) return 'Dachzeile';
  if (/cta|button/.test(leaf)) return 'Button-Text';
  if (/(text|intro|body|paragraph)/.test(leaf)) return 'Text';
  return leaf.replace(/_/g, ' ');
}

function label(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-cms-path]:not([data-cms-kind="image"])').forEach((node) => {
    const path = node.dataset.cmsPath ?? '';
    if (fieldKind(path) !== 'text') return;
    const next = cmsFieldLabel(path);
    if (node.dataset.cmsPlaceholder !== next) node.dataset.cmsPlaceholder = next;
  });
}

// Empty text fields in the preview show their field name instead of a blank area.
export function useCmsPlaceholders() {
  useEffect(() => {
    label(document);
    const observer = new MutationObserver(() => label(document));
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-cms-path'] });
    return () => observer.disconnect();
  }, []);
}
