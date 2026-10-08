import { supabase } from "../lib/supabase";

export type ParticipantType = "customer" | "employee";

export type InvitationEmailStatus =
  | "not_requested"
  | "pending"
  | "sent"
  | "failed";

export type AssessmentParticipant = {
  id: string;
  email: string | null;
  phone_number: string | null;
  full_name: string | null;
  participant_type: "owner" | "customer" | "employee";
  status: "invited" | "in_progress" | "completed";
  access_token: string;
  send_email_invitation: boolean;
  invitation_email_status: InvitationEmailStatus;
  invitation_email_sent_at: string | null;
  invitation_email_error: string | null;
};

export type AssessmentCollectionStatus =
  | "draft"
  | "collecting"
  | "ready_for_analysis"
  | "completed";

const participantFields = `
  id,
  email,
  phone_number,
  full_name,
  participant_type,
  status,
  access_token,
  send_email_invitation,
  invitation_email_status,
  invitation_email_sent_at,
  invitation_email_error
`;

async function requireCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  if (!user) {
    throw new Error("You must be logged in to manage participants.");
  }

  return user;
}

export async function loadAssessmentParticipants(assessmentId: string) {
  const user = await requireCurrentUser();

  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("id, perspective_type, status")
    .eq("id", assessmentId)
    .eq("business_id", user.id)
    .single();

  if (assessmentError) throw assessmentError;

  const { data: participants, error: participantsError } = await supabase
    .from("assessment_participants")
    .select(participantFields)
    .eq("assessment_id", assessmentId)
    .eq("business_id", user.id)
    .order("invited_at");

  if (participantsError) throw participantsError;

  return {
    perspectiveType: assessment.perspective_type as
      | "owner_customer"
      | "owner_employee_customer",
    assessmentStatus: assessment.status as AssessmentCollectionStatus,
    participants: participants as AssessmentParticipant[],
  };
}

export async function addAssessmentParticipant(
  assessmentId: string,
  participantType: ParticipantType,
  email: string,
  fullName?: string,
  phoneNumber?: string,
  sendEmailInvitation = true,
) {
  const user = await requireCurrentUser();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhoneNumber = phoneNumber?.trim() || null;
  const cleanFullName = fullName?.trim() || null;

  if (sendEmailInvitation && !cleanEmail) {
    throw new Error(
      "Please enter an email address or turn off email delivery.",
    );
  }

  if (!cleanEmail && !cleanPhoneNumber && !cleanFullName) {
    throw new Error(
      "Add a name or phone number so you can identify this participant.",
    );
  }

  const participantValues = {
    assessment_id: assessmentId,
    business_id: user.id,
    participant_type: participantType,
    email: cleanEmail || null,
    phone_number: cleanPhoneNumber,
    full_name: cleanFullName,
    status: "invited",
    send_email_invitation: sendEmailInvitation,
    invitation_email_status: sendEmailInvitation
      ? "pending"
      : "not_requested",
    invitation_email_sent_at: null,
    invitation_email_error: null,
  };

  const query = cleanEmail
    ? supabase.from("assessment_participants").upsert(
        participantValues,
        {
          onConflict: "assessment_id,email,participant_type",
        },
      )
    : supabase.from("assessment_participants").insert(
        participantValues,
      );

  const { data, error } = await query
    .select(participantFields)
    .single();

  if (error) throw error;
  return data as AssessmentParticipant;
}

export async function requestParticipantEmailInvitation(
  participantId: string,
) {
  const user = await requireCurrentUser();

  const { data, error } = await supabase
    .from("assessment_participants")
    .update({
      send_email_invitation: true,
      invitation_email_status: "pending",
      invitation_email_sent_at: null,
      invitation_email_error: null,
    })
    .eq("id", participantId)
    .eq("business_id", user.id)
    .select(participantFields)
    .single();

  if (error) throw error;
  return data as AssessmentParticipant;
}

export async function requestAssessmentAnalysis(assessmentId: string) {
  const { data, error } = await supabase.rpc(
    "request_assessment_analysis",
    {
      p_assessment_id: assessmentId,
    },
  );

  if (error) throw error;

  return data as {
    success: boolean;
    assessment_id: string;
    assessment_status: "ready_for_analysis";
  };
}
