import { remapCulinaryHref } from './culinary';
import { remapRoomsHref } from './rooms';
import { remapWellnessHref } from './wellness';

export function remapSiteHref(href: string, label?: string) {
  return remapWellnessHref(remapCulinaryHref(remapRoomsHref(href, label), label), label);
}
