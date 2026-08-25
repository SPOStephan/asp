import { useLayoutEffect, useRef, useState } from 'react';
import { CmsSection } from '../cms/CmsSection';
import { useSection } from '../context/HotelContext';
import { PHONE_CHROME_MQ } from '../lib/phoneChrome';
import { HighlightStrip } from './HighlightStrip';
import { Reveal } from './Reveal';
import { TextCta } from './TextCta';

function WelcomeCopy({ paragraphs }: { paragraphs: string[] }) {
  const [open, setOpen] = useState(false);
  const [needsMore, setNeedsMore] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const copyId = 'welcome-copy';

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const measure = () => {
      const phone = window.matchMedia(PHONE_CHROME_MQ).matches;
      if (!phone || open) {
        setNeedsMore(false);
        return;
      }
      setNeedsMore(el.scrollHeight > el.clientHeight + 2);
    };

    measure();
    const media = window.matchMedia(PHONE_CHROME_MQ);
    media.addEventListener('change', measure);
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      media.removeEventListener('change', measure);
      observer.disconnect();
    };
  }, [open, paragraphs]);

  return (
    <div className={`welcome__text${open ? ' welcome__text--open' : ''}`} data-cms-focus="text">
      <div className="welcome__text-inner" id={copyId} ref={innerRef}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {needsMore && !open && (
        <TextCta
          className="welcome__more"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-controls={copyId}
        >
          Weiterlesen
        </TextCta>
      )}
    </div>
  );
}

export function Welcome() {
  const data = useSection('welcome');

  if (!data) return null;

  const paragraphs = [data.text_paragraph1, data.text_paragraph2].filter(Boolean);

  return (
    <CmsSection sectionKey="welcome" label="Welcome">
    <section className="welcome" id="welcome">
      <div className="container">
        <Reveal>
          <div className="welcome__head">
            <h2 className="welcome__title heading-font" data-cms-focus="title">
              {data.title_line1}<br />
              <span className="welcome__normal-word">{data.title_word_normal}</span>{' '}
              <span className="welcome__script">{data.title_word_script}</span>
            </h2>
            <p className="welcome__subtitle" data-cms-focus="subtitle">{data.subtitle}</p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <WelcomeCopy paragraphs={paragraphs} />
        </Reveal>

      </div>

      <HighlightStrip />
    </section>
    </CmsSection>
  );
}
