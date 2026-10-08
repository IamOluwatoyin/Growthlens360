import { supabase } from "../lib/supabase";
import type { BusinessArea } from "./dashboard";

export type ActionStatus =
  | "not_started"
  | "in_progress"
  | "completed";

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
};

export async function loadAssessmentActions(): Promise<
  AssessmentAction[]
> {
  const { data, error } = await supabase.rpc(
    "sync_assessment_actions",
  );

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  return data as AssessmentAction[];
}

export async function updateActionStatus(
  actionId: string,
  status: ActionStatus,
): Promise<AssessmentAction> {
  const now = new Date().toISOString();

  const timestampUpdates =
    status === "not_started"
      ? {
          started_at: null,
          completed_at: null,
        }
      : status === "in_progress"
        ? {
            started_at: now,
            completed_at: null,
          }
        : {
            started_at: now,
            completed_at: now,
          };

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

  if (error) {
    throw error;
  }

  return data as AssessmentAction;
}

export async function updateActionNotes(
  actionId: string,
  notes: string,
): Promise<AssessmentAction> {
  const { data, error } = await supabase
    .from("assessment_actions")
    .update({
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", actionId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as AssessmentAction;
}

export async function deleteActionNotes(
  actionId: string,
): Promise<AssessmentAction> {
  const { data, error } = await supabase
    .from("assessment_actions")
    .update({
      notes: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", actionId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as AssessmentAction;
}