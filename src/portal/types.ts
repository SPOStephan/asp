export type Tier = { id: string; name: string; min_points: number };

export type ProgramSettings = {
  points_per_euro?: number;
  direct_bonus_percent?: number;
  points_valid_months?: number;
  tier_window_months?: number;
  tiers?: Tier[];
  // Member rate: code and the parameter the booking engine expects (e.g. "code", "promo").
  member_rate_code?: string;
  member_rate_param?: string;
  contact_email?: string;
  // Legal pages of the programme, linked in the portal's footer.
  terms_url?: string;
  privacy_url?: string;
  imprint_url?: string;
};

export type Member = {
  user_id: string;
  member_number: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  birthday: string | null;
  favourite_hotel_id: string | null;
  marketing_opt_in: boolean;
  created_at: string;
};

export type Summary = {
  member: Member;
  program: { name: string; settings: ProgramSettings };
  balance: number;
  qualifying_points: number;
  tier: Tier | null;
  next_tier: Tier | null;
  stats?: { stays: number; nights: number; hotels: number; upcoming: number };
};

export type Stay = {
  id: string;
  hotel_id: string | null;
  hotel_name: string;
  booking_ref: string;
  arrival: string;
  departure: string;
  room: string;
  guests: number;
  amount_eur: number;
  channel: 'direct' | 'portal' | 'ota' | 'other';
  status: 'booked' | 'stayed' | 'cancelled';
};

export type LedgerRow = { id: string; points: number; reason: string; stay_id: string | null; created_at: string; expires_at: string | null };

export type Benefit = {
  id: string;
  hotel_id: string | null;
  kind: 'perk' | 'reward' | 'rate';
  title: string;
  description: string;
  image: string;
  min_tier: string;
  points_cost: number | null;
  link: string;
  valid_until: string | null;
};

export type Redemption = { id: string; title: string; points: number; code: string; status: string; created_at: string };

export type PortalHotel = {
  id: string;
  name: string;
  slug: string;
  domains: string[];
  booking_url: string | null;
  address: string | null;
  image: string;
};

// What the start page shows before login (programme, public settings, active benefits).
export type PortalInfo = {
  name: string | null;
  settings: ProgramSettings | null;
  benefits: Array<Omit<Benefit, 'link' | 'valid_until'>>;
};
