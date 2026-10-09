import { supabase } from "../lib/supabase";
import type { BusinessArea } from "./dashboard";

export type ActionStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export type ActionProgressUpdate = {
  id: string;
  action_id: string;
  business_id: string;
  progress_note: string;
  created_at: string;
};

export type AssessmentAction = {
  id: string;
  business_id: string;
  assessment_id: string;
  recommendation_index: number;
  business_area: BusinessArea;
  title: string;
  action_description: string;
  timeframe: "7 days" | "14 days" | "30 days";
  effort: "low" | "medium" | "high";
  reason: string | null;
  status: ActionStatus;
  target_date: string | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  progress_updates: ActionProgressUpdate[];
};

type ActionRow = Omit<AssessmentAction, "progress_updates">;

async function requireCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  if (!user) {
    throw new Error("You must be logged in to manage your action plan.");
  }

  return user;
}

async function attachProgressUpdates(
  rows: ActionRow[],
): Promise<AssessmentAction[]> {
  if (rows.length === 0) return [];

  const actionIds = rows.map((action) => action.id);

  const { data, error } = await supabase
    .from("action_progress_updates")
    .select("id, action_id, business_id, progress_note, created_at")
    .in("action_id", actionIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const updates = (data ?? []) as ActionProgressUpdate[];

  return rows.map((action) => ({
    ...action,
    progress_updates: updates.filter(
      (update) => update.action_id === action.id,
    ),
  }));
}

async function hydrateAction(row: ActionRow): Promise<AssessmentAction> {
  const [action] = await attachProgressUpdates([row]);
  return action;
}

export async function loadAssessmentActions(): Promise<AssessmentAction[]> {
  const { data, error } = await supabase.rpc("sync_assessment_actions");

  if (error) throw error;
  if (!data) return [];

  return attachProgressUpdates(data as ActionRow[]);
}

export async function updateActionStatus(
  actionId: string,
  status: ActionStatus,
): Promise<AssessmentAction> {
  const now = new Date().toISOString();

  const timestampUpdates =
    status === "not_started"
      ? { started_at: null, completed_at: null }
      : status === "in_progress"
        ? { started_at: now, completed_at: null }
        : { started_at: now, completed_at: now };

  const { data, error } = await supabase
    .from("assessment_actions")
    .update({
      status,
      ...timestampUpdates,
      updated_at: now,
    })
    .eq("id", actionId)
    .select("*")
    .single();

  if (error) throw error;
  return hydrateAction(data as ActionRow);
}

export async function updateActionNotes(
  actionId: string,
  notes: string,
  progressUpdateId?: string,
): Promise<AssessmentAction> {
  const user = await requireCurrentUser();
  const cleanNotes = notes.trim();

  if (!cleanNotes) {
    throw new Error("Please enter a progress update before saving.");
  }

  if (progressUpdateId) {
    const { error: progressError } = await supabase
      .from("action_progress_updates")
      .update({
        progress_note: cleanNotes,
        created_at: new Date().toISOString(),
      })
      .eq("id", progressUpdateId)
      .eq("action_id", actionId)
      .eq("business_id", user.id);

    if (progressError) throw progressError;
  } else {
    const { error: progressError } = await supabase
      .from("action_progress_updates")
      .insert({
        action_id: actionId,
        business_id: user.id,
        progress_note: cleanNotes,
      });

    if (progressError) throw progressError;
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("assessment_actions")
    .update({
      notes: cleanNotes,
      updated_at: now,
    })
    .eq("id", actionId)
    .eq("business_id", user.id)
    .select("*")
    .single();

  if (error) throw error;
  return hydrateAction(data as ActionRow);
}

export async function deleteActionNotes(
  actionId: string,
  progressUpdateId: string,
): Promise<AssessmentAction> {
  const user = await requireCurrentUser();

  const { error: deleteError } = await supabase
    .from("action_progress_updates")
    .delete()
    .eq("id", progressUpdateId)
    .eq("action_id", actionId)
    .eq("business_id", user.id);

  if (deleteError) throw deleteError;

  const { data: latestUpdate, error: latestError } = await supabase
    .from("action_progress_updates")
    .select("progress_note")
    .eq("action_id", actionId)
    .eq("business_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) throw latestError;

  const { data, error } = await supabase
    .from("assessment_actions")
    .update({
      notes: latestUpdate?.progress_note ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", actionId)
    .eq("business_id", user.id)
    .select("*")
    .single();

  if (error) throw error;
  return hydrateAction(data as ActionRow);
}
