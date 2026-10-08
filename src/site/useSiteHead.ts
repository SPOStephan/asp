import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useHotelContent } from '../context/HotelContext';
import { SiteModel } from './pageModel';
import { canonicalOrigin, isPrivatePath } from './renderSite';

function setMeta(selector: string, create: () => HTMLElement, attribute: string, value: string) {
  let node = document.head.querySelector<HTMLElement>(selector);
  if (!node) {
    node = create();
    document.head.appendChild(node);
  }
  node.setAttribute(attribute, value);
}

// Keeps title, description and canonical in step with the server while visitors navigate.
export function useSiteHead(active: boolean) {
  const { content } = useHotelContent();
  const location = useLocation();

  useEffect(() => {
    if (!active || !content || isPrivatePath(location.pathname)) return;
    const site = new SiteModel(content, canonicalOrigin(content.hotel.domains, window.location.host));
    const model = site.page(location.pathname);
    document.title = model.title;
    setMeta('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }), 'content', model.description);
    setMeta('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', site.url(model.path));
    setMeta('meta[property="og:title"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      return meta;
    }, 'content', model.title);
  }, [active, content, location.pathname]);
}
