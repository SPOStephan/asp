import { slugifyFilter, type ListFilter } from '../lib/listFilters';

type Entry = { id: string; name: string; tags: string[] };

// The hotel's filters (rooms, blog topics): name them, sort them, and say which entry
// belongs where. Filters without entries never show on the website.
export function CmsFilterEditor({
  title,
  filters,
  entries,
  multi,
  onChange,
}: {
  title: string;
  filters: ListFilter[];
  entries: Entry[];
  // rooms: several filters per room; blog: one topic per post
  multi: boolean;
  onChange: (filters: ListFilter[], tags: Record<string, string[]>) => void;
}) {
  const tagsOf = () => Object.fromEntries(entries.map((entry) => [entry.id, entry.tags]));

  function setFilters(next: ListFilter[]) {
    const ids = new Set(next.map((filter) => filter.id));
    // Removing a filter removes it from every entry, too.
    const tags = Object.fromEntries(entries.map((entry) => [entry.id, entry.tags.filter((tag) => ids.has(tag))]));
    onChange(next, tags);
  }

  function rename(index: number, label: string) {
    setFilters(filters.map((filter, at) => (at === index ? { ...filter, label } : filter)));
  }

  function move(index: number, step: number) {
    const target = index + step;
    if (target < 0 || target >= filters.length) return;
    const next = filters.slice();
    [next[index], next[target]] = [next[target], next[index]];
    setFilters(next);
  }

  function add() {
    const taken = new Set(filters.map((filter) => filter.id));
    let id = 'neu';
    for (let n = 2; taken.has(id); n += 1) id = `neu-${n}`;
    setFilters([...filters, { id, label: 'Neuer Filter' }]);
  }

  function toggle(entryId: string, filterId: string, on: boolean) {
    const tags = tagsOf();
    const current = tags[entryId] ?? [];
    tags[entryId] = multi ? (on ? [...new Set([...current, filterId])] : current.filter((tag) => tag !== filterId)) : on ? [filterId] : [];
    onChange(filters, tags);
  }

  return (
    <fieldset className="cms-filters" data-cms-panel-focus="filters">
      <legend>{title}</legend>
      <p className="cms-muted">
        Leiste ein- oder ausblenden: Auge an der Filterleiste. Filter ohne zugeordnete Einträge erscheinen nicht.
      </p>
      {filters.map((filter, index) => (
        <div key={filter.id} className="cms-filters__row">
          <input
            aria-label="Filtername"
            value={filter.label}
            onChange={(event) => rename(index, event.target.value)}
            onBlur={(event) => {
              // A new filter gets its address from its first real name.
              if (filter.id.startsWith('neu') && event.target.value.trim() && event.target.value !== 'Neuer Filter') {
                const id = slugifyFilter(event.target.value);
                if (id && !filters.some((other) => other.id === id)) {
                  const tags = Object.fromEntries(entries.map((entry) => [entry.id, entry.tags.map((tag) => (tag === filter.id ? id : tag))]));
                  onChange(filters.map((item, at) => (at === index ? { id, label: event.target.value.trim() } : item)), tags);
                }
              }
            }}
          />
          <button type="button" className="cms-item-move" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Nach vorn">
            ↑
          </button>
          <button type="button" className="cms-item-move" disabled={index === filters.length - 1} onClick={() => move(index, 1)} aria-label="Nach hinten">
            ↓
          </button>
          <button type="button" className="cms-item-move" onClick={() => setFilters(filters.filter((_, at) => at !== index))} aria-label={`${filter.label} löschen`}>
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="cms-btn cms-btn--ghost" onClick={add}>
        Filter hinzufügen
      </button>
      {filters.length && entries.length ? (
        <table className="cms-filters__matrix">
          <thead>
            <tr>
              <th />
              {filters.map((filter) => (
                <th key={filter.id}>{filter.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <th>{entry.name}</th>
                {filters.map((filter) => (
                  <td key={filter.id}>
                    <input
                      type={multi ? 'checkbox' : 'radio'}
                      name={multi ? undefined : `topic-${entry.id}`}
                      aria-label={`${entry.name}: ${filter.label}`}
                      checked={entry.tags.includes(filter.id)}
                      onChange={(event) => toggle(entry.id, filter.id, event.target.checked)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </fieldset>
  );
}
