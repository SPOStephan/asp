import { useEffect } from 'react';
import { ChatCircleTextIcon } from '@phosphor-icons/react';
import { ConciergeChat } from './ConciergeChat';
import { useConcierge } from './ConciergeContext';

// Desktop: a panel at the bottom right. It opens from the chat circle of the booking bar
// or, where that circle is not visible, from a small button of its own.
export function ConciergeDesktop() {
  const { config, open, setOpen, toggle } = useConcierge();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  return (
    <>
      {open ? (
        <div className="concierge-panel" role="dialog" aria-label="Chat">
          <ConciergeChat onClose={() => setOpen(false)} />
        </div>
      ) : null}
      {config.enabled ? (
        <button type="button" className={`concierge-launcher${open ? ' is-on' : ''}`} aria-label="Frage stellen" aria-expanded={open} onClick={toggle}>
          <ChatCircleTextIcon size={34} weight="thin" />
        </button>
      ) : null}
    </>
  );
}
