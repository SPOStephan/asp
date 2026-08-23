import { Reveal } from './Reveal';
import { HighlightStrip } from './HighlightStrip';
import { useSection } from '../context/HotelContext';

export function Welcome() {
  const data = useSection('welcome');

  if (!data) return null;

  return (
    <section className="welcome" id="welcome">
      <div className="container">
        <Reveal>
          <div className="welcome__head">
            <h2 className="welcome__title heading-font">
              {data.title_line1}<br />
              <span className="welcome__normal-word">{data.title_word_normal}</span>{' '}
              <span className="welcome__script">{data.title_word_script}</span>
            </h2>
            <p className="welcome__subtitle">{data.subtitle}</p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="welcome__text">
            <p>{data.text_paragraph1}</p>
            <p>{data.text_paragraph2}</p>
          </div>
        </Reveal>

      </div>

      <HighlightStrip />
    </section>
  );
}
