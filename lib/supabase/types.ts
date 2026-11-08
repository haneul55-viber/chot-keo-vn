export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface ProfileRecord {
  id: string;
  email: string | null;
  full_name: string;
  avatar_url: string | null;
  bank_bin: string | null;
  bank_name: string | null;
  bank_account_no: string | null;
  bank_account_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripRecord {
  id: string;
  owner_id: string | null;
  invite_code: string;
  name: string;
  origin_id: string;
  destination_id: string;
  start_date: string;
  end_date: string;
  adults: number;
  children: number;
  rooms: number;
  include_contingency: boolean;
  status: "draft" | "voting" | "locked";
  draft_data: Record<string, unknown>;
  budget_min: number;
  budget_max: number;
  created_at: string;
  updated_at: string;
}

export interface TripMemberRecord {
  id: string;
  trip_id: string;
  user_id: string | null;
  nickname: string;
  avatar_url: string | null;
  role: "owner" | "member";
  has_paid: boolean;
  joined_at: string;
}

export interface TripPollRecord {
  id: string;
  trip_id: string;
  category: "intercity" | "lodging" | "food" | "local_transport";
  status: "open" | "closed";
  created_at: string;
}

export interface TripVoteRecord {
  id: string;
  poll_id: string;
  member_id: string;
  option_id: string;
  option_title: string;
  price_estimate: number;
  metadata: Record<string, unknown>;
  voted_at: string;
}
