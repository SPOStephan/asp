import { Check } from 'lucide-react';

interface IncludeListProps {
  items: string[];
  className?: string;
  pathPrefix?: string;
}

export function IncludeList({ items, className = '', pathPrefix }: IncludeListProps) {
  if (!items.length) return null;

  return (
    <ul className={['include-list', className].filter(Boolean).join(' ')}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          <Check className="include-list__check" size={16} strokeWidth={1.4} aria-hidden="true" />
          <span {...(pathPrefix ? { 'data-cms-path': `${pathPrefix}.${index}` } : {})}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
