import { supabase } from "../lib/supabase";

export type GrowthAdvisorHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

type GrowthAdvisorResponse = {
  answer?: string;
  message?: string;
};

export async function askGrowthAdvisor(
  question: string,
  history: GrowthAdvisorHistoryMessage[] = [],
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
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.access_token) {
    throw new Error(
      "Your session has expired. Please log in again.",
    );
  }

  const recentHistory = history
    .filter((message) => message.content.trim())
    .slice(-10);

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      question: cleanQuestion,
      history: recentHistory,
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