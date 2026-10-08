import { supabase } from "../lib/supabase";

export type AssessmentQuestion = {
  id: string;
  code: string;
  metric_key: string;
  business_area: "people" | "operations" | "customer" | "digital";
  question_text: string;
  sort_order: number;
};

export type AssessmentAnswers = Record<string, number>;

export async function loadOwnerAssessment(
  assessmentId: string,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be logged in to access this assessment.");
  }

  const { error: assessmentError } = await supabase
    .from("assessments")
    .select("id")
    .eq("id", assessmentId)
    .eq("business_id", user.id)
    .single();

  if (assessmentError) {
    throw assessmentError;
  }

  const { data: questions, error: questionsError } =
    await supabase
      .from("assessment_questions")
      .select(
        "id, code, metric_key, business_area, question_text, sort_order",
      )
      .eq("perspective", "owner")
      .eq("is_active", true)
      .order("sort_order");

  if (questionsError) {
    throw questionsError;
  }

  const { data: participant, error: participantError } =
    await supabase
      .from("assessment_participants")
      .select("id")
      .eq("assessment_id", assessmentId)
      .eq("business_id", user.id)
      .eq("participant_type", "owner")
      .single();

  if (participantError) {
    throw participantError;
  }

  const { data: existingResponses, error: responsesError } =
    await supabase
      .from("assessment_responses")
      .select("question_id, numeric_answer")
      .eq("participant_id", participant.id);

  if (responsesError) {
    throw responsesError;
  }

  const answers = Object.fromEntries(
    (existingResponses ?? [])
      .filter((response) => response.numeric_answer !== null)
      .map((response) => [
        response.question_id,
        response.numeric_answer,
      ]),
  ) as AssessmentAnswers;

  return {
    questions: questions as AssessmentQuestion[],
    answers,
  };
}

export async function saveOwnerAssessment(
  assessmentId: string,
  answers: AssessmentAnswers,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be logged in to save this assessment.");
  }

  const { data: participant, error: participantError } =
    await supabase
      .from("assessment_participants")
      .select("id")
      .eq("assessment_id", assessmentId)
      .eq("business_id", user.id)
      .eq("participant_type", "owner")
      .single();

  if (participantError) {
    throw participantError;
  }

  const responseRows = Object.entries(answers).map(
    ([questionId, numericAnswer]) => ({
      assessment_id: assessmentId,
      participant_id: participant.id,
      question_id: questionId,
      business_id: user.id,
      numeric_answer: numericAnswer,
      boolean_answer: null,
      text_answer: null,
      updated_at: new Date().toISOString(),
    }),
  );

  const { error: responsesError } = await supabase
    .from("assessment_responses")
    .upsert(responseRows, {
      onConflict: "participant_id,question_id",
    });

  if (responsesError) {
    throw responsesError;
  }

  const { error: statusError } = await supabase
    .from("assessment_participants")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", participant.id)
    .eq("business_id", user.id);

  if (statusError) {
    throw statusError;
  }
}