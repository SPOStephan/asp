import { ArrowUpRight } from 'lucide-react';
import type { MouseEventHandler, ReactNode } from 'react';

interface TextCtaProps {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
}

export function TextCta({ children, href, className = '', onClick }: TextCtaProps) {
  const classes = ['text-cta', className].filter(Boolean).join(' ');
  const inner = (
    <>
      <span className="text-cta__label">{children}</span>
      <span className="text-cta__arrow" aria-hidden="true">
        <ArrowUpRight size={14} strokeWidth={1.6} />
      </span>
    </>
  );

  if (href) {
    return (
      <a className={classes} href={href} onClick={onClick}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {inner}
    </button>
  );
}
