import {
  ArrowUp,
  Bot,
  LoaderCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  askGrowthAdvisor,
  type GrowthAdvisorHistoryMessage,
} from "../services/growthAdvisor";
import {
  getOrCreateAdvisorConversation,
  loadAdvisorMessages,
  saveAdvisorMessage,
} from "../services/advisorHistory";
import { useSearchParams } from "react-router-dom";

type ChatMessage = {
  id: string;
  role: "advisor" | "user";
  content: string;
};

const suggestedQuestions = [
  "What should I improve first with a small budget?",
  "Explain my largest perspective gap.",
  "What can I realistically complete this week?",
];

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "advisor",
  content:
    "What would you like to understand about your results? I’ll use your GrowthLens report to give you practical guidance.",
};

export function GrowthAdvisorPage() {
  const [searchParams, setSearchParams] = useSearchParams();

const draftingQuestion =
  searchParams.get("question")?.trim() ?? "";

  const [messages, setMessages] = useState<ChatMessage[]>([
    initialMessage,
  ]);
  const [conversationId, setConversationId] = useState<
    string | null
  >(null);
 const [question, setQuestion] = useState(draftingQuestion);
  const [isLoadingHistory, setIsLoadingHistory] =
    useState(true);
  const [isSending, setIsSending] = useState(false);
  const [pageError, setPageError] = useState<string | null>(
    null,
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadConversation = async () => {
      try {
        const conversation =
          await getOrCreateAdvisorConversation();

        const savedMessages = await loadAdvisorMessages(
          conversation.id,
        );

        if (!isMounted) return;

        setConversationId(conversation.id);

        const formattedMessages: ChatMessage[] =
          savedMessages.map((message) => ({
            id: message.id,
            role:
              message.role === "assistant"
                ? "advisor"
                : "user",
            content: message.content,
          }));

        setMessages([
          initialMessage,
          ...formattedMessages,
        ]);
      } catch (error) {
        if (!isMounted) return;

        setPageError(
          error instanceof Error
            ? error.message
            : "Unable to load your previous conversation.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    };

    void loadConversation();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isSending]);

  const sendQuestion = async (questionToSend: string) => {
    const cleanQuestion = questionToSend.trim();

    if (
      !cleanQuestion ||
      isSending ||
      isLoadingHistory
    ) {
      return;
    }

    if (!conversationId) {
      setPageError(
        "Your conversation is not ready. Please refresh the page and try again.",
      );
      return;
    }

    const temporaryUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanQuestion,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      temporaryUserMessage,
    ]);

    setQuestion("");
    if (searchParams.has("question")) {
  setSearchParams({}, { replace: true });
}
    setPageError(null);
    setIsSending(true);

    try {
      await saveAdvisorMessage(
        conversationId,
        "user",
        cleanQuestion,
      );

     const conversationHistory: GrowthAdvisorHistoryMessage[] =
  messages
    .filter((message) => message.id !== "welcome")
    .slice(-10)
    .map((message) => ({
      role:
        message.role === "advisor"
          ? "assistant"
          : "user",
      content: message.content,
    }));

const answer = await askGrowthAdvisor(
  cleanQuestion,
  conversationHistory,
);

      const savedAdvisorMessage =
        await saveAdvisorMessage(
          conversationId,
          "assistant",
          answer,
        );

      const advisorMessage: ChatMessage = {
        id: savedAdvisorMessage.id,
        role: "advisor",
        content: savedAdvisorMessage.content,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        advisorMessage,
      ]);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "The Growth Advisor could not answer your question.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    void sendQuestion(question);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <span className="eyebrow">Growth advisor</span>

      <h1 className="mt-2 text-3xl font-black tracking-tight text-[#07143f] sm:text-4xl">
        Ask about your business in plain language
      </h1>

      <p className="mt-2 max-w-2xl leading-7 text-[#66729b]">
        Get practical guidance based on your actual report—not generic
        business advice.
      </p>

      <section className="mt-8 overflow-hidden rounded-[24px] border border-[#dfe6f1] bg-white shadow-[0_18px_55px_rgba(21,40,87,.08)]">
        <header className="flex items-center justify-between gap-4 bg-[#07143f] px-5 py-4 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff5d49]">
              <Sparkles size={22} />
            </span>

            <div>
              <h2 className="font-extrabold">
                GrowthLens Advisor
              </h2>

              <p className="text-xs text-blue-100">
                Uses your latest assessment report
              </p>
            </div>
          </div>

          <span className="flex items-center gap-2 text-xs font-bold text-[#8fd128]">
            <span className="h-2 w-2 rounded-full bg-[#8fd128]" />
            {isLoadingHistory ? "Loading" : "Ready"}
          </span>
        </header>

        <div className="min-h-[420px] max-h-[58vh] space-y-5 overflow-y-auto bg-[#f8faff] p-4 sm:p-6">
          {isLoadingHistory ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-[#66729b]">
                <LoaderCircle
                  size={24}
                  className="animate-spin text-[#1379f4]"
                />
                Loading your conversation...
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isAdvisor =
                message.role === "advisor";

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    isAdvisor
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  {isAdvisor && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf5ff] text-[#1379f4]">
                      <Bot size={19} />
                    </span>
                  )}

                  <div
                    className={`max-w-[86%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[75%] sm:text-base ${
                      isAdvisor
                        ? "rounded-tl-sm border border-[#dfe6f1] bg-white text-[#26375e]"
                        : "rounded-tr-sm bg-[#ff5d49] text-white"
                    }`}
                  >
                    {message.content}
                  </div>

                  {!isAdvisor && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#07143f] text-white">
                      <UserRound size={19} />
                    </span>
                  )}
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf5ff] text-[#1379f4]">
                <Bot size={19} />
              </span>

              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-[#dfe6f1] bg-white px-4 py-3 text-sm font-semibold text-[#66729b]">
                <LoaderCircle
                  size={18}
                  className="animate-spin text-[#1379f4]"
                />
                Reviewing your report...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {!isLoadingHistory && messages.length === 1 && (
          <div className="border-t border-[#edf0f5] bg-white px-4 py-4 sm:px-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#66729b]">
              Suggested questions
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedQuestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="rounded-full border border-[#cfd8e7] bg-white px-4 py-2 text-left text-sm font-semibold text-[#25427f] transition hover:border-[#1379f4] hover:bg-[#eef5ff]"
                  onClick={() =>
                    void sendQuestion(suggestion)
                  }
                  disabled={
                    isSending || isLoadingHistory
                  }
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {pageError && (
          <div
            className="mx-4 mt-4 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#b42318] sm:mx-6"
            role="alert"
          >
            {pageError}
          </div>
        )}
<form
  className="flex items-end gap-3 border-t border-[#dfe6f1] bg-white p-4 sm:p-5"
          onSubmit={handleSubmit}
        >
          <label
            className="sr-only"
            htmlFor="advisor-question"
          >
            Ask the Growth Advisor
          </label>

         <textarea
  id="advisor-question"
  className="field min-h-[110px] max-h-[220px] flex-1 resize-y py-3"
  placeholder="Ask about your results..."
  value={question}
  rows={4}
  maxLength={600}
  disabled={isSending}
  onChange={(event) => setQuestion(event.target.value)}
  onKeyDown={(event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      void sendQuestion(question);
    }
  }}
/>

          <button
            type="submit"
           className="flex h-[52px] w-[52px] shrink-0 items-center justify-center self-end rounded-xl bg-[#ff5d49] text-white transition hover:bg-[#e84632] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={
              isSending ||
              isLoadingHistory ||
              !question.trim()
            }
            aria-label="Send question"
          >
            {isSending ? (
              <LoaderCircle
                size={21}
                className="animate-spin"
              />
            ) : (
              <ArrowUp size={21} />
            )}
          </button>
        </form>
      </section>

      <p className="mt-4 text-center text-xs leading-5 text-[#7a86a8]">
        GrowthLens guidance is based on your assessment and should be
        considered alongside your knowledge of your business.
      </p>
    </div>
  );
}