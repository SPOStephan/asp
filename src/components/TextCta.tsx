import { ArrowUpRight } from 'lucide-react';
import type { MouseEventHandler, ReactNode } from 'react';
import { useCms } from '../cms/CmsContext';
import { toCmsHref } from '../cms/cmsPages';

interface TextCtaProps {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  // Opens in a new tab (e.g. an external booking engine); not inside the CMS.
  newTab?: boolean;
}

export function TextCta({
  children,
  href,
  className = '',
  onClick,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  newTab = false,
}: TextCtaProps) {
  const cms = useCms();
  const resolved = href && cms ? toCmsHref(href) : href;
  const classes = ['text-cta', className].filter(Boolean).join(' ');
  const inner = (
    <>
      <span className="text-cta__label">{children}</span>
      <span className="text-cta__arrow" aria-hidden="true">
        <ArrowUpRight size={14} strokeWidth={1.6} />
      </span>
    </>
  );

  if (resolved) {
    const cmsNav = Boolean(
      cms && resolved && !resolved.startsWith('#') && !resolved.startsWith('mailto:') && !resolved.startsWith('tel:'),
    );
    return (
      <a
        className={classes}
        href={resolved}
        onClick={onClick}
        {...(newTab && !cms ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...(cmsNav ? { 'data-cms-nav': '' } : {})}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      {inner}
    </button>
  );
}
