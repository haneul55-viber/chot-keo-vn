import { createClient } from "./client";
import { ProfileRecord, TripRecord, TripMemberRecord } from "./types";
import { TripDraft, PriceRange } from "@/lib/types";

export interface SaveTripParams {
  id?: string;
  name: string;
  draft: TripDraft;
  totalRange: PriceRange;
  ownerId?: string | null;
}

export async function fetchUserProfile(userId: string): Promise<ProfileRecord | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as ProfileRecord;
}

export async function updateUserBankProfile(
  userId: string,
  params: {
    bankBin: string;
    bankName: string;
    accountNo: string;
    accountName: string;
  }
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("profiles")
    .update({
      bank_bin: params.bankBin,
      bank_name: params.bankName,
      bank_account_no: params.accountNo,
      bank_account_name: params.accountName.toUpperCase(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  return !error;
}

export async function saveTripToSupabase({
  id,
  name,
  draft,
  totalRange,
  ownerId,
}: SaveTripParams): Promise<TripRecord | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const payload = {
    name,
    origin_id: draft.originId,
    destination_id: draft.destinationId,
    start_date: draft.startDate,
    end_date: draft.endDate,
    adults: draft.adults,
    children: draft.children,
    rooms: draft.rooms,
    include_contingency: draft.includeContingency,
    draft_data: draft as unknown as Record<string, unknown>,
    budget_min: totalRange.min,
    budget_max: totalRange.max,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { data, error } = await supabase
      .from("trips")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return null;
    return data as TripRecord;
  }

  const { data, error } = await supabase
    .from("trips")
    .insert({
      ...payload,
      owner_id: ownerId ?? null,
    })
    .select()
    .single();

  if (error || !data) return null;

  const createdTrip = data as TripRecord;

  // If created by owner, automatically add as owner member
  if (ownerId) {
    await supabase.from("trip_members").insert({
      trip_id: createdTrip.id,
      user_id: ownerId,
      nickname: "Trưởng nhóm",
      role: "owner",
    });
  }

  return createdTrip;
}

export async function fetchUserTrips(userId: string): Promise<TripRecord[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as TripRecord[];
}

export async function fetchTripByInviteCode(
  inviteCode: string
): Promise<{ trip: TripRecord; members: TripMemberRecord[] } | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("invite_code", inviteCode)
    .single();

  if (error || !trip) return null;

  const { data: members } = await supabase
    .from("trip_members")
    .select("*")
    .eq("trip_id", trip.id)
    .order("joined_at", { ascending: true });

  return {
    trip: trip as TripRecord,
    members: (members ?? []) as TripMemberRecord[],
  };
}
