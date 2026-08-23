import { useEffect, useRef, useState } from 'react';
import { AvailabilityBarForm } from './AvailabilityBarForm';

export function AvailabilityBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const bar = barRef.current;
      if (!bar) return;
      const hero = bar.closest('.hero') as HTMLElement | null;
      if (!hero) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      setStuck(heroBottom <= bar.offsetHeight + 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('availability-stuck', stuck);
    return () => document.body.classList.remove('availability-stuck');
  }, [stuck]);

  return (
    <div
      ref={barRef}
      id="buchung"
      className={`availability-bar${stuck ? ' is-stuck' : ''}`}
    >
      <AvailabilityBarForm />
    </div>
  );
}
