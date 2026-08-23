import { AvailabilityBarForm } from './AvailabilityBarForm';

export function FixedAvailabilityBar() {
  return (
    <div id="buchung-fixed" className="availability-bar is-stuck">
      <AvailabilityBarForm idPrefix="fixed-" />
    </div>
  );
}
