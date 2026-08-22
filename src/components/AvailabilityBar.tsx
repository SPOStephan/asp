import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

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
      <form className="availability-bar__form" onSubmit={(e) => e.preventDefault()}>
        <div className="availability-bar__field">
          <label className="availability-bar__label" htmlFor="arrival">Anreise</label>
          <input className="availability-bar__input" type="date" id="arrival" />
        </div>
        <div className="availability-bar__field">
          <label className="availability-bar__label" htmlFor="departure">Abreise</label>
          <input className="availability-bar__input" type="date" id="departure" />
        </div>
        <div className="availability-bar__field">
          <label className="availability-bar__label" htmlFor="guests">Gäste</label>
          <select className="availability-bar__select" id="guests" defaultValue="2">
            <option value="1">1 Erwachsener</option>
            <option value="2">2 Erwachsene</option>
            <option value="3">2 Erwachsene, 1 Kind</option>
            <option value="4">2 Erwachsene, 2 Kinder</option>
            <option value="5">Familie</option>
          </select>
        </div>
        <button type="submit" className="availability-bar__btn">
          <Search size={16} strokeWidth={1.5} />
          Verfügbarkeit prüfen
        </button>
      </form>
    </div>
  );
}
