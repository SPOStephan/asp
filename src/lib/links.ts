import { remapCulinaryHref } from './culinary';
import { remapRoomsHref } from './rooms';

export function remapSiteHref(href: string, label?: string) {
  return remapCulinaryHref(remapRoomsHref(href, label), label);
}
