import { remapRegionHref } from './occasions';
import { remapCulinaryHref } from './culinary';
import { remapImpressionsHref } from './impressions';
import { remapRoomsHref } from './rooms';
import { remapWellnessHref } from './wellness';

export function remapSiteHref(href: string, label?: string) {
  return remapImpressionsHref(
    remapWellnessHref(remapCulinaryHref(remapRoomsHref(remapRegionHref(href), label), label), label),
    label
  );
}
