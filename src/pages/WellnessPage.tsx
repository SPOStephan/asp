import { SubpageHero } from '../components/SubpageHero';
import { useSection } from '../context/HotelContext';

const WELLNESS_HERO_IMAGE = '/hotel-nordsee-wellness02.webp';

export function WellnessPage() {
  const data = useSection('wellness_page');

  if (!data) return null;

  return (
    <main>
      <SubpageHero
        image={WELLNESS_HERO_IMAGE}
        imageAlt={data.hero_image_alt || ''}
        eyebrow={data.eyebrow}
        title={data.title}
        subtitle={data.subtitle}
      >
        <div className="wellness-page__content">
          <div className="container">
            <p className="eyebrow">{data.content_eyebrow}</p>
            <h2 className="heading-font" style={{ marginTop: '8px' }}>{data.content_title}</h2>
            <p style={{ maxWidth: '640px', marginTop: '24px', lineHeight: 1.7 }}>
              {data.content_text}
            </p>
          </div>
        </div>
      </SubpageHero>
    </main>
  );
}
