import { CMS_ICON_NAMES, resolveCmsIcon } from './cmsIcons';

export function CmsIconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  return (
    <div className="cms-icons">
      {CMS_ICON_NAMES.map((name) => {
        const Icon = resolveCmsIcon(name);
        return (
          <button
            key={name}
            type="button"
            className={`cms-icons__btn${value === name ? ' is-on' : ''}`}
            onClick={() => onChange(name)}
            title={name}
          >
            <Icon size={22} strokeWidth={1.35} />
            <span>{name}</span>
          </button>
        );
      })}
    </div>
  );
}
