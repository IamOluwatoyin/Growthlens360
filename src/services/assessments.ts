import { supabase } from "../lib/supabase";

export type AssessmentPerspectiveType =
  | "owner_customer"
  | "owner_employee_customer";

type StartAssessmentOptions = {
  assessmentName?: string;
  perspectiveType?: AssessmentPerspectiveType;
  startOwner?: boolean;
};

export async function startOrResumeAssessment(
  options: StartAssessmentOptions = {},
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user?.email) {
    throw new Error("You must be logged in to start an assessment.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("business_profiles")
    .select("perspective_type")
    .eq("id", user.id)
    .single();

  if (profileError) throw profileError;

  const perspectiveType =
    options.perspectiveType ??
    (profile.perspective_type as AssessmentPerspectiveType);

  const assessmentName =
    options.assessmentName?.trim() || "Business Diagnosis";

  const { data: existingAssessment, error: existingError } = await supabase
    .from("assessments")
    .select("id, status")
    .eq("business_id", user.id)
    .in("status", ["draft", "collecting", "ready_for_analysis"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;

  let assessmentId = existingAssessment?.id;

  if (!assessmentId) {
    const { data: newAssessment, error: assessmentError } = await supabase
      .from("assessments")
      .insert({
        business_id: user.id,
        title: assessmentName,
        perspective_type: perspectiveType,
        status: "collecting",
      })
      .select("id")
      .single();

    if (assessmentError) throw assessmentError;
    assessmentId = newAssessment.id;
  } else if (options.assessmentName || options.perspectiveType) {
    const { error: updateError } = await supabase
      .from("assessments")
      .update({
        title: assessmentName,
        perspective_type: perspectiveType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assessmentId)
      .eq("business_id", user.id);

    if (updateError) throw updateError;
  }

  const { data: existingOwner, error: ownerLookupError } = await supabase
    .from("assessment_participants")
    .select("status, started_at")
    .eq("assessment_id", assessmentId)
    .eq("business_id", user.id)
    .eq("participant_type", "owner")
    .maybeSingle();

  if (ownerLookupError) throw ownerLookupError;

  const shouldStartOwner = options.startOwner !== false;
  const ownerIsCompleted = existingOwner?.status === "completed";

  const ownerStatus = ownerIsCompleted
    ? "completed"
    : shouldStartOwner
      ? "in_progress"
      : existingOwner?.status ?? "invited";

  const ownerStartedAt =
    existingOwner?.started_at ??
    (shouldStartOwner ? new Date().toISOString() : null);

  const { error: participantError } = await supabase
    .from("assessment_participants")
    .upsert(
      {
        assessment_id: assessmentId,
        business_id: user.id,
        participant_type: "owner",
        email: user.email.toLowerCase(),
        full_name: user.user_metadata?.full_name ?? null,
        status: ownerStatus,
        started_at: ownerStartedAt,
      },
      {
        onConflict: "assessment_id,email,participant_type",
      },
    );

  if (participantError) throw participantError;

  return assessmentId;
}
