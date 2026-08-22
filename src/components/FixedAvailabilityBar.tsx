import { Search } from 'lucide-react';

export function FixedAvailabilityBar() {
  return (
    <div id="buchung-fixed" className="availability-bar is-stuck">
      <form className="availability-bar__form" onSubmit={(e) => e.preventDefault()}>
        <div className="availability-bar__field">
          <label className="availability-bar__label" htmlFor="arrival-fixed">Anreise</label>
          <input className="availability-bar__input" type="date" id="arrival-fixed" />
        </div>
        <div className="availability-bar__field">
          <label className="availability-bar__label" htmlFor="departure-fixed">Abreise</label>
          <input className="availability-bar__input" type="date" id="departure-fixed" />
        </div>
        <div className="availability-bar__field">
          <label className="availability-bar__label" htmlFor="guests-fixed">Gäste</label>
          <select className="availability-bar__select" id="guests-fixed" defaultValue="2">
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
