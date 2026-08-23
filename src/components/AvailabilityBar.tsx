import { useEffect, useRef, useState } from 'react';
import { AvailabilityBarForm } from './AvailabilityBarForm';

export function AvailabilityBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [slotHeight, setSlotHeight] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const bar = barRef.current;
      const slot = slotRef.current;
      if (!bar || !slot) return;
      const height = bar.offsetHeight;
      if (height) setSlotHeight(height);
      const slotBottom = slot.getBoundingClientRect().bottom;
      setStuck(slotBottom <= height + 1);
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
      ref={slotRef}
      className="availability-bar__slot"
      style={stuck && slotHeight ? { height: slotHeight } : undefined}
    >
      <div
        ref={barRef}
        id="buchung"
        className={`availability-bar${stuck ? ' is-stuck' : ''}`}
      >
        <AvailabilityBarForm />
      </div>
    </div>
  );
}
