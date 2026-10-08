// Filters above lists: per hotel, only useful ones, switchable. Run: npx tsx scripts/check-filters.ts
import { filterLabel, filtersSwitchedOn, readFilters, slugifyFilter, usefulFilters } from '../src/lib/listFilters';
import { ROOM_FILTERS, resolveRooms } from '../src/lib/rooms';

let failed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || detail === undefined ? '' : ` -> ${JSON.stringify(detail)}`}`);
  if (!ok) failed += 1;
}

const mountainRooms = [['zimmer'], ['zimmer'], ['suite'], ['suite', 'familie']];
check('no sea view filter without sea view rooms', usefulFilters(null, ROOM_FILTERS, mountainRooms).map((f) => f.id).join() === 'zimmer,suite,familie');
check('a filter that matches every room is left out', usefulFilters(null, ROOM_FILTERS, [['suite'], ['suite']]).length === 0);
const own = readFilters([{ label: 'Bergblick' }, { id: 'suite', label: 'Suiten & Lofts' }, { label: '' }, { id: 'alle', label: 'Alle' }, { label: 'Bergblick' }]);
check('own filters read, ids from labels, no duplicates or "alle"', JSON.stringify(own) === JSON.stringify([{ id: 'bergblick', label: 'Bergblick' }, { id: 'suite', label: 'Suiten & Lofts' }]), own);
check('own filters replace the suggestions', usefulFilters(own, ROOM_FILTERS, [['bergblick'], ['zimmer']]).map((f) => f.id).join() === 'bergblick');
check('labels from the hotel first', filterLabel(own, ROOM_FILTERS, 'suite') === 'Suiten & Lofts' && filterLabel(null, ROOM_FILTERS, 'familie') === 'Familie' && filterLabel(own, ROOM_FILTERS, 'x') === '');
check('switch: eye or old switch', filtersSwitchedOn({}) && !filtersSwitchedOn({ hidden_filters: true }) && !filtersSwitchedOn({ show_filters: false }));
check('umlauts in ids', slugifyFilter('Für Familien & Größere') === 'fuer-familien-groessere');
const rooms = resolveRooms([{ name: 'Ohne Filter', tags: [] }, { name: 'Eigene', tags: ['bergblick'] }] as never);
check('rooms keep empty and own tags', rooms[0].tags.length === 0 && rooms[1].tags[0] === 'bergblick', rooms.map((room) => room.tags));

if (failed) process.exit(1);
console.log('filters ok');
