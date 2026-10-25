import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// A new page starts at the top – only when the address changes, never when the page merely
// renders again (in the CMS the preview updates all the time while editing).
export function usePageTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
}
