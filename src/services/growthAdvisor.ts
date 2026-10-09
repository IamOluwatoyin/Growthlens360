import { supabase } from "../lib/supabase";

type GrowthAdvisorResponse = {
  answer?: string;
  message?: string;
};

export type GrowthAdvisorHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function askGrowthAdvisor(
  question: string,
  conversationHistory: GrowthAdvisorHistoryMessage[] = [],
): Promise<string> {
  const cleanQuestion = question.trim();

  if (!cleanQuestion) {
    throw new Error("Please enter a question.");
  }

  const webhookUrl =
    import.meta.env.VITE_GROWTH_ADVISOR_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error(
      "The Growth Advisor webhook URL has not been configured.",
    );
  }

  const {
    data: { session: currentSession },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!currentSession) {
    throw new Error(
      "Your session has expired. Please log in again.",
    );
  }

  let session = currentSession;

  const expiresSoon =
    !session.expires_at ||
    session.expires_at * 1000 <= Date.now() + 60_000;

  if (expiresSoon) {
    const {
      data: { session: refreshedSession },
      error: refreshError,
    } = await supabase.auth.refreshSession();

    if (refreshError) {
      throw new Error(
        "Your session could not be refreshed. Please log in again.",
      );
    }

    if (!refreshedSession) {
      throw new Error(
        "Your session has expired. Please log in again.",
      );
    }

    session = refreshedSession;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      question: cleanQuestion,
      conversation_history: conversationHistory,
    }),
  });

  let responseData: GrowthAdvisorResponse | null = null;

  try {
    responseData =
      (await response.json()) as GrowthAdvisorResponse;
  } catch {
    responseData = null;
  }

  if (!response.ok) {
    throw new Error(
      responseData?.message ||
        "The Growth Advisor could not answer your question.",
    );
  }

  if (!responseData?.answer) {
    throw new Error(
      "The Growth Advisor returned an empty response.",
    );
  }

  return responseData.answer;
}
