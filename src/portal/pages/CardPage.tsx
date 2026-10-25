import qrcode from 'qrcode-generator';
import { useMemo } from 'react';
import { useProgramName } from '../PortalApp';
import { formatPoints } from '../format';
import { tierClass } from '../parts';
import { usePortal } from '../PortalData';

function Qr({ value }: { value: string }) {
  const svg = useMemo(() => {
    const code = qrcode(0, 'M');
    code.addData(value);
    code.make();
    return code.createSvgTag({ cellSize: 6, margin: 0, scalable: true });
  }, [value]);
  return <div className="portal-qr" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function CardPage() {
  const { summary } = usePortal();
  const name = useProgramName();
  if (!summary) return null;
  const member = summary.member;
  const number = member.member_number.replace(/(\d{4})(?=\d)/g, '$1 ');
  return (
    <div className="portal-page">
      <p className="portal-eyebrow">Beim Check-in</p>
      <h1 className="heading portal-title">Ihre Mitgliedskarte</h1>
      <div className="portal-cardpage">
      <div className={`portal-member-card ${tierClass(summary.tier?.id)}`}>
        <div className="portal-member-card__top">
          <span className="heading">{name}</span>
          <span>{summary.tier?.name}</span>
        </div>
        <p className="portal-member-card__name heading">{member.first_name} {member.last_name}</p>
        <p className="portal-member-card__number">{number}</p>
        <p className="portal-member-card__points">{formatPoints(summary.balance)} Punkte</p>
      </div>
      <div className="portal-card portal-card--center">
        <Qr value={`MEMBER:${member.member_number}`} />
        <p className="portal-muted">Zeigen Sie den Code beim Check-in – so landen Aufenthalt und Punkte sicher auf Ihrem Konto.</p>
      </div>
      </div>
    </div>
  );
}
