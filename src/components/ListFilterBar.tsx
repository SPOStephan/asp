import { useSearchParams } from 'react-router-dom';
import { useCms } from '../cms/CmsContext';
import { ALL_FILTER, filtersSwitchedOn, readFilters, usefulFilters, type ListFilter } from '../lib/listFilters';

// Shared by the rooms page and the blog: the hotel's own filters from the section
// (`filters`), the chosen one in the address (?filter=… / ?thema=…).
export function useListFilter(section: Record<string, unknown> | null | undefined, defaults: ListFilter[], entries: string[][], param: string) {
  const [params, setParams] = useSearchParams();
  const configured = readFilters(section?.filters);
  const filters = usefulFilters(configured, defaults, entries);
  const requested = params.get(param);
  const active = requested && filters.some((filter) => filter.id === requested) ? requested : ALL_FILTER;
  const setActive = (next: string) => {
    const nextParams = new URLSearchParams(params);
    if (next === ALL_FILTER) nextParams.delete(param);
    else nextParams.set(param, next);
    setParams(nextParams, { replace: true });
  };
  return { filters, active, setActive, configured, switchedOn: filtersSwitchedOn(section) };
}

export function ListFilterBar({
  filters,
  active,
  onChange,
  className,
  label,
}: {
  filters: ListFilter[];
  active: string;
  onChange: (id: string) => void;
  className: string;
  label: string;
}) {
  const editing = Boolean(useCms());
  if (!filters.length) {
    return editing ? <p className={`${className}s ${className}s--empty`}>Keine Filter: Einträgen im Bearbeitungsfeld Filter zuordnen.</p> : null;
  }
  return (
    <div className={`${className}s`} role="tablist" aria-label={label}>
      {[{ id: ALL_FILTER, label: 'Alle' }, ...filters].map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={active === item.id}
          className={`${className}${active === item.id ? ' is-active' : ''}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
