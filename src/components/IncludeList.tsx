import { Check } from 'lucide-react';

interface IncludeListProps {
  items: string[];
  className?: string;
}

export function IncludeList({ items, className = '' }: IncludeListProps) {
  if (!items.length) return null;

  return (
    <ul className={['include-list', className].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <li key={item}>
          <Check className="include-list__check" size={16} strokeWidth={1.4} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
