import { useLayoutEffect, useRef, useState } from 'react';
import { useCms } from '../cms/CmsContext';
import { CmsSection } from '../cms/CmsSection';
import { useSection } from '../context/HotelContext';
import { PHONE_CHROME_MQ } from '../lib/phoneChrome';
import { hasReadMore, READ_MORE_MARK, splitReadMore } from '../lib/readMore';
import { HighlightStrip } from './HighlightStrip';
import { Reveal } from './Reveal';
import { TextCta } from './TextCta';

// Phones show the welcome text shortened. Where "[weiterlesen]" stands in the text, the cut
// is exactly there; without it the text is cut after three lines. The folded part stays in
// the page (only hidden), so search engines and AI read all of it.
function WelcomeCopy({ paragraphs }: { paragraphs: Array<{ text: string; path: string }> }) {
  const editing = Boolean(useCms());
  const [open, setOpen] = useState(false);
  const [needsMore, setNeedsMore] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const copyId = 'welcome-copy';
  const markAt = paragraphs.findIndex((paragraph) => hasReadMore(paragraph.text));
  const marked = markAt >= 0;

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const measure = () => {
      const phone = window.matchMedia(PHONE_CHROME_MQ).matches;
      if (!phone || open) {
        setNeedsMore(false);
        return;
      }
      setNeedsMore(marked && !editing ? true : el.scrollHeight > el.clientHeight + 2);
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
  }, [open, paragraphs, marked, editing]);

  const body = (paragraph: { text: string; path: string }, index: number) => {
    const split = splitReadMore(paragraph.text);
    if (split && editing) {
      // In the CMS the mark stays visible (and part of the text when editing inline).
      return (
        <p key={paragraph.path} data-cms-path={paragraph.path}>
          {split.before}
          <span className="welcome__mark"> {READ_MORE_MARK} </span>
          {split.after}
        </p>
      );
    }
    if (split) {
      return (
        <p key={paragraph.path} data-cms-path={paragraph.path}>
          {split.before}
          {split.after ? <span className="welcome__rest"> {split.after}</span> : null}
        </p>
      );
    }
    const folded = marked && !editing && index > markAt;
    return (
      <p key={paragraph.path} data-cms-path={paragraph.path} className={folded ? 'welcome__rest' : undefined}>
        {paragraph.text}
      </p>
    );
  };

  const mode = marked && !editing ? ` welcome__text--marked${needsMore ? ' welcome__text--cut' : ''}` : '';
  return (
    <div className={`welcome__text${mode}${open ? ' welcome__text--open' : ''}`} data-cms-focus="text">
      <div className="welcome__text-inner" id={copyId} ref={innerRef}>
        {paragraphs.map(body)}
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
  // With the hero in sub-page style its heading lands here and becomes the page's first
  // heading, so the welcome heading would repeat it.
  const heroLeads = useSection('hero')?.layout !== 'classic';

  if (!data) return null;

  const paragraphs = [
    data.text_paragraph1 ? { text: String(data.text_paragraph1), path: 'text_paragraph1' } : null,
    data.text_paragraph2 ? { text: String(data.text_paragraph2), path: 'text_paragraph2' } : null,
  ].filter((item): item is { text: string; path: string } => Boolean(item));

  return (
    <CmsSection sectionKey="welcome" label="Welcome">
    <section className={`welcome${heroLeads ? ' welcome--after-hero' : ''}`} id="welcome">
      <div className="container">
        {heroLeads ? null : (
        <Reveal>
          <div className="welcome__head">
            <h2 className="welcome__title heading-font" data-cms-focus="title">
              {data.title_line1}<br />
              <span className="welcome__normal-word">{data.title_word_normal}</span>{' '}
              <span className="welcome__script">{data.title_word_script}</span>
            </h2>
            <p className="welcome__subtitle" data-cms-focus="subtitle" data-cms-path="subtitle">{data.subtitle}</p>
          </div>
        </Reveal>
        )}

        <Reveal delay={heroLeads ? 0 : 120}>
          <WelcomeCopy paragraphs={paragraphs} />
        </Reveal>

      </div>

      <HighlightStrip />
    </section>
    </CmsSection>
  );
}
