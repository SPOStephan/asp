import { useState } from 'react';
import { formatPoints, formatShort, sized, hideBroken } from '../format';
import { usePortal } from '../PortalData';
import { portal } from '../portalClient';
import type { Benefit } from '../types';

export function BenefitsPage() {
  const { benefits, summary, redemptions, hotels, reload } = usePortal();
  const [confirm, setConfirm] = useState<Benefit | null>(null);
  const [result, setResult] = useState<{ title: string; code: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!summary) return null;
  const tiers = summary.program.settings.tiers ?? [];
  const rank = (id: string) => tiers.findIndex((tier) => tier.id === id);
  const myRank = rank(summary.tier?.id ?? '');
  const hotelName = (id: string | null) => hotels.find((hotel) => hotel.id === id)?.name;

  async function redeem(benefit: Benefit) {
    setError(null);
    const { data, error: redeemError } = await portal.rpc('loyalty_redeem', { benefit: benefit.id });
    if (redeemError) {
      setError(redeemError.message);
      return;
    }
    setConfirm(null);
    setResult({ title: benefit.title, code: (data as { code: string }).code });
    await reload();
  }

  return (
    <div className="portal-page">
      <h1 className="heading portal-title">Ihre Vorteile</h1>
      <p className="portal-lead">Sie haben <strong>{formatPoints(summary.balance)} Punkte</strong>. Vorteile mit Stufe gelten automatisch, Prämien lösen Sie mit Punkten ein.</p>

      <div className="portal-benefits">
        {benefits.map((benefit) => {
          const locked = benefit.min_tier && rank(benefit.min_tier) > myRank;
          const tooExpensive = (benefit.points_cost ?? 0) > summary.balance;
          const tierName = tiers.find((tier) => tier.id === benefit.min_tier)?.name;
          return (
            <article key={benefit.id} className={`portal-benefit${locked ? ' is-locked' : ''}`}>
              {benefit.image ? <img src={sized(benefit.image, 700)} alt="" loading="lazy" onError={hideBroken} /> : null}
              <div className="portal-benefit__body">
                <p className="portal-eyebrow">
                  {benefit.kind === 'rate' ? 'Mitgliederpreis' : benefit.kind === 'reward' ? 'Prämie' : 'Vorteil'}
                  {hotelName(benefit.hotel_id) ? ` · ${hotelName(benefit.hotel_id)}` : ''}
                </p>
                <h2 className="heading">{benefit.title}</h2>
                {benefit.description ? <p>{benefit.description}</p> : null}
                <p className="portal-benefit__foot">
                  {benefit.points_cost ? <strong>{formatPoints(benefit.points_cost)} Punkte</strong> : <strong>inklusive</strong>}
                  {tierName ? <span>ab {tierName}</span> : null}
                  {benefit.valid_until ? <span>bis {formatShort(benefit.valid_until)}</span> : null}
                </p>
                {locked ? (
                  <p className="portal-muted">Verfügbar ab Stufe {tierName}.</p>
                ) : benefit.points_cost ? (
                  <button type="button" className="portal-btn portal-btn--small" disabled={tooExpensive} onClick={() => setConfirm(benefit)}>
                    {tooExpensive ? 'Noch nicht genug Punkte' : 'Einlösen'}
                  </button>
                ) : benefit.link ? (
                  <a className="portal-btn portal-btn--small" href={benefit.link} target="_blank" rel="noreferrer">Ansehen</a>
                ) : null}
              </div>
            </article>
          );
        })}
        {!benefits.length ? <p className="portal-card portal-empty">Bald finden Sie hier exklusive Vorteile.</p> : null}
      </div>

      {redemptions.length ? (
        <section className="portal-section">
          <h2 className="heading">Eingelöst</h2>
          <ul className="portal-ledger">
            {redemptions.map((item) => (
              <li key={item.id}>
                <span>{item.title}<small>{formatShort(item.created_at)} · Code {item.code}</small></span>
                <strong>{item.status === 'used' ? 'genutzt' : item.status === 'cancelled' ? 'storniert' : 'offen'}</strong>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {confirm || result ? (
        <div className="portal-dialog" role="dialog" aria-modal="true">
          <div className="portal-dialog__card">
            {result ? (
              <>
                <h2 className="heading">Eingelöst</h2>
                <p>{result.title}</p>
                <p className="portal-code">{result.code}</p>
                <p className="portal-muted">Nennen Sie den Code bei der Buchung oder an der Rezeption. Sie finden ihn jederzeit unter „Eingelöst“.</p>
                <button type="button" className="portal-btn" onClick={() => setResult(null)}>Fertig</button>
              </>
            ) : confirm ? (
              <>
                <h2 className="heading">{confirm.title}</h2>
                <p>Für {formatPoints(confirm.points_cost ?? 0)} Punkte einlösen? Danach haben Sie {formatPoints(summary.balance - (confirm.points_cost ?? 0))} Punkte.</p>
                {error ? <p className="portal-error">{error}</p> : null}
                <div className="portal-dialog__actions">
                  <button type="button" className="portal-btn portal-btn--ghost" onClick={() => setConfirm(null)}>Abbrechen</button>
                  <button type="button" className="portal-btn" onClick={() => void redeem(confirm)}>Einlösen</button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
