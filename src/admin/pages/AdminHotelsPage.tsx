import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { colorWorldLabel, colorWorldOf, type ColorWorld } from '../../lib/colorWorlds';

type HotelRow = {
  id: string;
  slug: string;
  name: string;
  domains: string[] | null;
  color_world: ColorWorld | null;
  is_active: boolean;
};

export function AdminHotelsPage() {
  const [hotels, setHotels] = useState<HotelRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase
      .from('hotels')
      .select('id, slug, name, domains, color_world, is_active')
      .order('name')
      .then(({ data, error: queryError }) => {
        if (queryError) setError(queryError.message);
        else setHotels((data ?? []) as HotelRow[]);
      });
  }, []);

  return (
    <>
      <div className="admin-row">
        <div>
          <h2>Hotels</h2>
          <p className="lead">Ambassador zuerst. Plus legt ein weiteres Haus auf derselben Plattform an.</p>
        </div>
        <Link className="admin-btn" to="/admin/hotels/new">
          + Hotel
        </Link>
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
                {colorWorldLabel(hotel.color_world)} · {hotel.is_active ? 'aktiv' : 'aus'}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
