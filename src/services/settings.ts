import { supabase } from "../lib/supabase";

export type UserSettings = {
  assessment_response_updates: boolean;
  weekly_progress_summary: boolean;
  recommendation_reminders: boolean;
};

const defaultSettings: UserSettings = {
  assessment_response_updates: true,
  weekly_progress_summary: true,
  recommendation_reminders: false,
};

export async function getUserSettings(): Promise<UserSettings> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be logged in to view your settings.");
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select(`
      assessment_response_updates,
      weekly_progress_summary,
      recommendation_reminders
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return defaultSettings;
  }

  return data as UserSettings;
}

export async function updateUserSettings(
  settings: UserSettings,
): Promise<UserSettings> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be logged in to update your settings.");
  }

  const { data, error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: user.id,
        assessment_response_updates:
          settings.assessment_response_updates,
        weekly_progress_summary:
          settings.weekly_progress_summary,
        recommendation_reminders:
          settings.recommendation_reminders,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )
    .select(`
      assessment_response_updates,
      weekly_progress_summary,
      recommendation_reminders
    `)
    .single();

  if (error) {
    throw error;
  }

  return data as UserSettings;
}