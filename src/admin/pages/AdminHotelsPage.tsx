import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { managedOrgs, useAdminAuth } from '../AdminAuth';
import { colorWorldLabel, colorWorldOf, type ColorWorld } from '../../lib/colorWorlds';

type HotelRow = {
  id: string;
  slug: string;
  name: string;
  domains: string[] | null;
  color_world: ColorWorld | null;
  is_active: boolean;
  organization_id: string | null;
};

export function AdminHotelsPage() {
  const { admin } = useAdminAuth();
  const [hotels, setHotels] = useState<HotelRow[]>([]);
  const [orgNames, setOrgNames] = useState<Record<string, string>>({});
  const canCreate = Boolean(admin?.platform || managedOrgs(admin).length);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase
      .from('hotels')
      .select('id, slug, name, domains, color_world, is_active, organization_id')
      .order('name')
      .then(({ data, error: queryError }) => {
        if (queryError) setError(queryError.message);
        else {
          const rows = (data ?? []) as HotelRow[];
          // Hotels are public data; the list shows only the ones this person works on.
          setHotels(admin?.platform ? rows : rows.filter((hotel) => admin?.organizations.some((org) => org.id === hotel.organization_id)));
        }
      });
    void supabase
      .from('organizations')
      .select('id, name')
      .then(({ data }) => setOrgNames(Object.fromEntries((data ?? []).map((org) => [org.id, org.name]))));
  }, [admin]);

  return (
    <>
      <div className="admin-row">
        <div>
          <h2>Hotels</h2>
          <p className="lead">
            Plus legt ein weiteres Haus an — Inhalte können von einem bestehenden Hotel kopiert werden. Ein
            fehlgeschlagener erster Versuch legt das Haus trotzdem an: dann das vorhandene öffnen, nicht noch
            einmal + Hotel.
          </p>
        </div>
        {canCreate ? (
          <Link className="admin-btn" to="/admin/hotels/new">
            + Hotel
          </Link>
        ) : null}
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="admin-list">
        {hotels.map((hotel) => {
          const world = colorWorldOf(hotel.color_world);
          return (
            <Link key={hotel.id} className="admin-card admin-hotel" to={`/admin/hotels/${hotel.id}`}>
              <span className="admin-dot" style={{ background: world.primary }} />
              <span>
                <strong>{hotel.name}</strong>
                <span>
                  {hotel.slug}
                  {hotel.domains?.length ? ` · ${hotel.domains.join(', ')}` : ''}
                </span>
              </span>
              <span>
                {hotel.organization_id && orgNames[hotel.organization_id] ? `${orgNames[hotel.organization_id]} · ` : ''}
                {colorWorldLabel(hotel.color_world)} · {hotel.is_active ? 'aktiv' : 'aus'}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
