import { remapCulinaryHref } from './culinary';
import { remapImpressionsHref } from './impressions';
import { remapRoomsHref } from './rooms';
import { remapWellnessHref } from './wellness';

export function remapSiteHref(href: string, label?: string) {
  return remapImpressionsHref(
    remapWellnessHref(remapCulinaryHref(remapRoomsHref(href, label), label), label),
    label
  );
}
