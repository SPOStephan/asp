import { useEffect, useState } from 'react';
import { AvailabilityBarForm } from './AvailabilityBarForm';

// revealOnScroll: hidden while the hero fills the screen, slides in once the visitor scrolls.
export function FixedAvailabilityBar({ revealOnScroll = false }: { revealOnScroll?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!revealOnScroll) return;
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [revealOnScroll]);

  const waiting = revealOnScroll && !scrolled;
  return (
    <div id="buchung-fixed" className={`availability-bar is-stuck${waiting ? ' is-waiting' : ''}`}>
      <AvailabilityBarForm idPrefix="fixed-" />
    </div>
  );
}
