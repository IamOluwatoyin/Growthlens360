import { supabase } from "../lib/supabase";
import type {
  AssessmentAnswers,
  AssessmentQuestion,
} from "./assessmentResponses";

export type ParticipantAssessmentData = {
  assessment_id: string;
  participant_id: string;
  participant_type: "customer" | "employee";
  participant_name: string | null;
  business_name: string;
  status: "invited" | "in_progress" | "completed";
  questions: AssessmentQuestion[];
  answers: AssessmentAnswers;
};

export async function loadParticipantAssessment(
  accessToken: string,
) {
  const { data, error } = await supabase.rpc(
    "get_participant_assessment",
    {
      p_access_token: accessToken,
    },
  );

  if (error) {
    throw error;
  }

  return data as ParticipantAssessmentData;
}

export async function submitParticipantAssessment(
  accessToken: string,
  answers: AssessmentAnswers,
) {
  const { data, error } = await supabase.rpc(
    "submit_participant_assessment",
    {
      p_access_token: accessToken,
      p_answers: answers,
    },
  );

  if (error) {
    throw error;
  }

  return data as {
    success: boolean;
    assessment_status: "collecting" | "ready_for_analysis";
  };
}