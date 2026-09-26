import { Sparkles, type LucideIcon } from 'lucide-react';
import { resolveCmsIcon } from './cmsIcons';
import { useIconLibrary } from '../context/IconLibraryContext';

export function CmsGlyph({
  name,
  color,
  className,
  size = 22,
  title,
}: {
  name?: string;
  color?: string;
  className?: string;
  size?: number;
  title?: string;
}) {
  const { icons } = useIconLibrary();
  const custom = icons.find((icon) => icon.name === name && icon.kind !== 'lucide');
  const style = color ? { color, width: size, height: size } : { width: size, height: size };

  if (custom?.kind === 'svg' && custom.svg) {
    return (
      <span
        className={`cms-glyph cms-glyph--svg${className ? ` ${className}` : ''}`}
        style={style}
        title={title}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: custom.svg }}
      />
    );
  }

  if (custom?.kind === 'image' && custom.image_url) {
    return (
      <span
        className={`cms-glyph cms-glyph--image${className ? ` ${className}` : ''}`}
        style={{
          ...style,
          WebkitMaskImage: `url(${custom.image_url})`,
          maskImage: `url(${custom.image_url})`,
        }}
        title={title}
        aria-hidden="true"
      />
    );
  }

  const Icon: LucideIcon = resolveCmsIcon(name, Sparkles);
  return <Icon className={className} size={size} strokeWidth={1.25} color={color || undefined} aria-hidden="true" />;
}
