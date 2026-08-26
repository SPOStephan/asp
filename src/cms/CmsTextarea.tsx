import { useLayoutEffect, useRef } from 'react';

export function CmsTextarea({
  value,
  onChange,
  minRows = 5,
}: {
  value: string;
  onChange: (value: string) => void;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0px';
    const styles = getComputedStyle(el);
    const line = Number.parseFloat(styles.lineHeight) || 24;
    const pad = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
    const min = minRows * line + pad;
    const max = Math.round(window.innerHeight * 0.55);
    el.style.height = `${Math.min(max, Math.max(min, el.scrollHeight))}px`;
  }, [value, minRows]);

  return (
    <textarea
      ref={ref}
      className="cms-textarea"
      rows={minRows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
