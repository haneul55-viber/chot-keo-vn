import { createClient } from "./client";
import { TripPollRecord, TripVoteRecord } from "./types";

export interface PollTallyOption {
  optionId: string;
  optionTitle: string;
  priceEstimate: number;
  voteCount: number;
  voterNicknames: string[];
}

export interface PollCategoryTally {
  pollId: string;
  category: string;
  status: "open" | "closed";
  leadingOptionId: string | null;
  totalVotes: number;
  options: Record<string, PollTallyOption>;
}

export async function getOrCreateTripPoll(
  tripId: string,
  category: "intercity" | "lodging" | "food" | "local_transport"
): Promise<TripPollRecord | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from("trip_polls")
    .select("*")
    .eq("trip_id", tripId)
    .eq("category", category)
    .maybeSingle();

  if (existing) return existing as TripPollRecord;

  const { data: created, error } = await supabase
    .from("trip_polls")
    .insert({ trip_id: tripId, category, status: "open" })
    .select()
    .single();

  if (error || !created) return null;
  return created as TripPollRecord;
}

export async function castTripVote(params: {
  pollId: string;
  memberId: string;
  optionId: string;
  optionTitle: string;
  priceEstimate: number;
  metadata?: Record<string, unknown>;
}): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase.from("trip_votes").upsert(
    {
      poll_id: params.pollId,
      member_id: params.memberId,
      option_id: params.optionId,
      option_title: params.optionTitle,
      price_estimate: params.priceEstimate,
      metadata: params.metadata ?? {},
      voted_at: new Date().toISOString(),
    },
    { onConflict: "poll_id,member_id" }
  );

  return !error;
}

export async function fetchPollVotes(pollId: string): Promise<TripVoteRecord[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("trip_votes")
    .select("*")
    .eq("poll_id", pollId);

  if (error || !data) return [];
  return data as TripVoteRecord[];
}

export async function closeTripPoll(pollId: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("trip_polls")
    .update({ status: "closed" })
    .eq("id", pollId);

  return !error;
}

export async function lockTripAndFinalize(
  tripId: string,
  budgetMin: number,
  budgetMax: number
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("trips")
    .update({
      status: "locked",
      budget_min: budgetMin,
      budget_max: budgetMax,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tripId);

  // Close all open polls in this trip
  await supabase
    .from("trip_polls")
    .update({ status: "closed" })
    .eq("trip_id", tripId);

  return !error;
}

export async function toggleMemberPaidStatus(
  memberId: string,
  hasPaid: boolean
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("trip_members")
    .update({ has_paid: hasPaid })
    .eq("id", memberId);

  return !error;
}
