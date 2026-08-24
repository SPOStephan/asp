import { Reveal } from './Reveal';
import { TextCta } from './TextCta';

interface OverlapStageProps {
  kicker: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  front: string;
  frontAlt: string;
  back: string;
  backAlt: string;
}

export function OverlapStage({
  kicker,
  title,
  text,
  cta,
  href,
  front,
  frontAlt,
  back,
  backAlt,
}: OverlapStageProps) {
  return (
    <Reveal>
      <section className="overlap-stage" aria-label={title}>
        <div className="overlap-stage__copy">
          <p className="overlap-stage__kicker">{kicker}</p>
          <h2 className="overlap-stage__title heading-font">{title}</h2>
          <p className="overlap-stage__text">{text}</p>
          <TextCta href={href}>{cta}</TextCta>
        </div>
        <div className="overlap-stage__visual">
          <figure className="overlap-stage__front">
            <img src={front} alt={frontAlt} />
          </figure>
          <figure className="overlap-stage__back">
            <img src={back} alt={backAlt} />
          </figure>
        </div>
      </section>
    </Reveal>
  );
}
