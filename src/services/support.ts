import { supabase } from "../lib/supabase";

export type SupportCategory =
  | "assessment"
  | "report"
  | "recommendations"
  | "account"
  | "technical"
  | "other";

export type SupportRequestValues = {
  category: SupportCategory;
  subject: string;
  message: string;
};

export type SupportRequest = {
  id: string;
  business_id: string;
  category: SupportCategory;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
};

export async function createSupportRequest(
  values: SupportRequestValues,
): Promise<SupportRequest> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be logged in to contact support.");
  }

  const { data, error } = await supabase
    .from("support_requests")
    .insert({
      business_id: user.id,
      category: values.category,
      subject: values.subject.trim(),
      message: values.message.trim(),
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as SupportRequest;
}