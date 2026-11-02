import { Fragment } from 'react';
import { parseInline } from '../lib/inlineLinks';

// A CMS text with its links (see src/lib/inlineLinks.ts), quietly styled (look.css .text-link).
export function InlineText({ text }: { text: string }) {
  const parts = parseInline(text);
  if (parts.length === 1 && !('href' in parts[0])) return <>{text}</>;
  return (
    <>
      {parts.map((part, index) =>
        'href' in part ? (
          <a
            key={index}
            className="text-link"
            href={part.href}
            {...(/^https?:\/\//i.test(part.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {part.text}
          </a>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}
