import { supabase } from "../lib/supabase";

export type AdvisorMessage = {
  id: string;
  conversation_id: string;
  business_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type AdvisorConversation = {
  id: string;
  business_id: string;
  assessment_id: string | null;
};

export async function getOrCreateAdvisorConversation() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error("You must be logged in to use the Growth Advisor.");
  }

  const { data: existingConversation, error: conversationError } =
    await supabase
      .from("advisor_conversations")
      .select("id, business_id, assessment_id")
      .eq("business_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (conversationError) throw conversationError;

  if (existingConversation) {
    return existingConversation as AdvisorConversation;
  }

  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("id")
    .eq("business_id", user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (assessmentError) throw assessmentError;

  const { data: newConversation, error: createError } = await supabase
    .from("advisor_conversations")
    .insert({
      business_id: user.id,
      assessment_id: assessment?.id ?? null,
    })
    .select("id, business_id, assessment_id")
    .single();

  if (createError) throw createError;

  return newConversation as AdvisorConversation;
}

export async function loadAdvisorMessages(
  conversationId: string,
) {
  const { data, error } = await supabase
    .from("advisor_messages")
    .select(
      "id, conversation_id, business_id, role, content, created_at",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []) as AdvisorMessage[];
}

export async function saveAdvisorMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error("You must be logged in to save a message.");
  }

  const { data, error } = await supabase
    .from("advisor_messages")
    .insert({
      conversation_id: conversationId,
      business_id: user.id,
      role,
      content: content.trim(),
    })
    .select(
      "id, conversation_id, business_id, role, content, created_at",
    )
    .single();

  if (error) throw error;

  await supabase
    .from("advisor_conversations")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  return data as AdvisorMessage;
}