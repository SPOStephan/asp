import { useEffect } from 'react';
import './TypePreviewHome.css';

const FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2?family=Mr+Dafoe&family=Newsreader:opsz,wght@6..72,300..700&display=swap';

export function TypePreviewHomeNote() {
  useEffect(() => {
    const link = document.createElement('link');
    link.id = 'type-preview-fonts';
    link.rel = 'stylesheet';
    link.href = FONT_STYLESHEET;
    document.head.appendChild(link);

    const previousTitle = document.title;
    document.title = 'Schriftvorschau · Newsreader + Mr Dafoe';

    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);

    return () => {
      link.remove();
      robots.remove();
      document.title = previousTitle;
    };
  }, []);

  return (
    <p className="type-preview__note">
      Schriftvorschau · Newsreader + Mr Dafoe · nicht live
      {' · '}
      <a href="/schriften">Labor</a>
      {' · '}
      <a href="/">Original</a>
    </p>
  );
}
