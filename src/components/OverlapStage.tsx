import { Reveal } from './Reveal';
import { TextCta } from './TextCta';

interface OverlapStageCms {
  focus?: string;
  kicker?: string;
  title?: string;
  text?: string;
  front?: string;
  back?: string;
}

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
  cms?: OverlapStageCms;
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
  cms,
}: OverlapStageProps) {
  return (
    <Reveal>
      <section className="overlap-stage" aria-label={title} data-cms-focus={cms?.focus ?? 'overlap'}>
        <div className="overlap-stage__copy">
          <p className="overlap-stage__kicker" data-cms-path={cms?.kicker ?? 'overlap_kicker'}>{kicker}</p>
          <h2 className="overlap-stage__title heading-font" data-cms-path={cms?.title ?? 'overlap_title'}>{title}</h2>
          <p className="overlap-stage__text" data-cms-path={cms?.text ?? 'overlap_text'}>{text}</p>
          <TextCta href={href}>{cta}</TextCta>
        </div>
        <div className="overlap-stage__visual">
          <figure className="overlap-stage__front" data-cms-path={cms?.front ?? 'overlap_front'} data-cms-kind="image">
            <img src={front} alt={frontAlt} />
          </figure>
          <figure className="overlap-stage__back" data-cms-path={cms?.back ?? 'overlap_back'} data-cms-kind="image">
            <img src={back} alt={backAlt} />
          </figure>
        </div>
      </section>
    </Reveal>
  );
}
