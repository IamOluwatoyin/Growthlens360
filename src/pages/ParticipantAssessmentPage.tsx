import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import type {
  AssessmentAnswers,
  AssessmentQuestion,
} from "../services/assessmentResponses";
import {
  loadParticipantAssessment,
  submitParticipantAssessment,
  type ParticipantAssessmentData,
} from "../services/participantAssessment";

const scaleOptions = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Not sure" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
];

const areaLabels = {
  people: "People",
  operations: "Operations",
  customer: "Customer experience",
  digital: "Digital experience",
};

export function ParticipantAssessmentPage() {
  const { accessToken } = useParams();

  const [assessment, setAssessment] =
    useState<ParticipantAssessmentData | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeSurvey = () => {
    window.close();

    window.setTimeout(() => {
      if (!window.closed) {
        window.location.assign("/");
      }
    }, 150);
  };

  useEffect(() => {
    if (!accessToken) return;

    const loadAssessment = async () => {
      try {
        const data = await loadParticipantAssessment(accessToken);

        setAssessment(data);
        setQuestions(data.questions);
        setAnswers(data.answers ?? {});
        setIsCompleted(data.status === "completed");

        const firstUnanswered = data.questions.findIndex(
          (question) => !data.answers?.[question.id],
        );

        setCurrentIndex(
          firstUnanswered === -1
            ? Math.max(0, data.questions.length - 1)
            : firstUnanswered,
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to open this assessment.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadAssessment();
  }, [accessToken]);

  if (!accessToken) {
    return (
      <main className="min-h-screen bg-[#f5f8fd] px-4 py-10">
        <div className="card mx-auto max-w-2xl p-6 sm:p-8">
          <h1 className="text-xl font-extrabold text-[#07143f]">
            Invalid assessment link
          </h1>
          <p className="mt-2 text-[#66729b]">
            This assessment link is missing or invalid. Please ask the
            business owner to share the correct link with you.
          </p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f8fd]">
        <LoaderCircle
          size={38}
          className="animate-spin text-[#1379f4]"
          aria-label="Loading assessment"
        />
      </main>
    );
  }

  if (error && !assessment) {
    return (
      <main className="min-h-screen bg-[#f5f8fd] px-5 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          <div className="card p-7 text-center">
            <h1 className="text-2xl font-black text-[#07143f]">
              Assessment unavailable
            </h1>
            <p className="mt-3 text-[#66729b]">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (isCompleted) {
    const perspectiveLabel =
      assessment?.participant_type === "employee"
        ? "employee responses"
        : "customer responses";

    return (
      <main className="min-h-screen bg-[#f5f8fd]">
        <header className="border-b border-[#dfe6f1] bg-white">
          <div className="page-wrap flex min-h-20 items-center justify-between gap-4 py-4">
            <Logo />
            <p className="hidden text-sm font-bold text-[#52617e] sm:block">
              {assessment?.participant_type === "employee"
                ? "Employee perspective"
                : "Customer feedback"}{" "}
              for {assessment?.business_name}
            </p>
          </div>
        </header>

        <div className="page-wrap px-4 py-10 sm:py-16">
          <section className="mx-auto max-w-4xl rounded-[24px] border border-[#cfdbee] bg-white p-6 text-center shadow-[0_18px_55px_rgba(21,40,87,.06)] sm:p-12">
            <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#07143f] bg-[#f7fff2] text-[#61c414]">
              <CheckCircle2 size={58} strokeWidth={2.5} />
            </span>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#526fba] sm:text-sm">
              Response submitted
            </p>
            <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-tight tracking-[-0.03em] text-[#07143f] sm:text-5xl">
              Thank you for sharing your perspective
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#667fb9] sm:text-xl sm:leading-8">
              Your feedback has been received and will help{" "}
              {assessment?.business_name} understand what is working and
              where it can improve.
            </p>

            <div className="mx-auto mt-7 flex max-w-2xl items-center justify-center gap-3 rounded-2xl border border-[#65c927] bg-[#f5fff0] px-4 py-4 text-left font-bold text-[#07143f]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#62c815] text-white">
                <Check size={20} strokeWidth={3} />
              </span>
              Your response was submitted successfully.
            </div>

            <div className="mx-auto mt-7 flex max-w-2xl items-start gap-4 text-left">
              <BarChart3 className="mt-1 shrink-0 text-[#07143f]" size={30} />
              <div>
                <h2 className="font-extrabold text-[#07143f]">
                  Combined insights
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#667fb9] sm:text-base">
                  Your ratings will be reviewed together with the other{" "}
                  {perspectiveLabel} and assessment perspectives.
                </p>
              </div>
            </div>

            <div className="mx-auto mt-7 max-w-2xl border-t border-[#dfe6f1] pt-6">
              <p className="flex items-center justify-center gap-2 text-sm leading-6 text-[#667fb9] sm:text-base">
                <ShieldCheck className="shrink-0 text-[#07143f]" size={22} />
                Your individual ratings are not displayed in the business
                report, and no account is required.
              </p>
              <button
                type="button"
                className="btn-primary mt-6 w-full sm:w-auto sm:min-w-[320px]"
                onClick={closeSurvey}
              >
                Close survey
              </button>
              <p className="mt-3 text-xs text-[#7a86a8]">
                If your browser cannot close this tab, you will return to the
                GrowthLens home page.
              </p>
            </div>
          </section>

          <p className="mt-6 text-center text-sm text-[#667fb9]">
            Powered by <strong className="text-[#07143f]">GrowthLens 360</strong>
          </p>
        </div>
      </main>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion || !assessment) {
    return (
      <main className="min-h-screen bg-[#f5f8fd] px-5 py-10">
        <div className="card mx-auto max-w-2xl p-7">
          No assessment questions are available.
        </div>
      </main>
    );
  }

  const selectedAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);
  const isEmployee = assessment.participant_type === "employee";

  const handleNext = async () => {
    if (!selectedAnswer || !accessToken) return;

    setError(null);

    if (!isLastQuestion) {
      setCurrentIndex((index) => index + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSaving(true);

    try {
      await submitParticipantAssessment(accessToken, answers);
      setIsCompleted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError: unknown) {
      const message =
        submitError &&
        typeof submitError === "object" &&
        "message" in submitError
          ? String(submitError.message)
          : "Unable to submit responses.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f8fd]">
      <header className="border-b border-[#dfe6f1] bg-white">
        <div className="page-wrap flex min-h-20 items-center justify-between gap-4 py-4">
          <Logo />
          <p className="hidden text-sm font-bold text-[#52617e] sm:block">
            {isEmployee ? "Employee perspective" : "Customer feedback"} for{" "}
            {assessment.business_name}
          </p>
        </div>
      </header>

      <div className="page-wrap py-8 sm:py-10">
        <div className="mx-auto max-w-[1180px]">
          <header className="mx-auto max-w-5xl text-center">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#526fba] sm:text-sm">
              {isEmployee ? "Employee survey" : "Customer feedback"}
            </span>
            <h1 className="mx-auto mt-3 max-w-[22rem] text-[1.75rem] font-black leading-[1.12] tracking-[-0.035em] text-[#07143f] sm:max-w-4xl sm:text-4xl lg:text-5xl">
              {isEmployee
                ? "Share how work feels from your perspective"
                : `Help ${assessment.business_name} see what customers see`}
            </h1>
            <p className="mx-auto mt-3 max-w-[23rem] text-sm leading-6 text-[#667fb9] sm:max-w-3xl sm:text-lg sm:leading-7">
              {isEmployee
                ? "Your honest feedback helps identify what supports people at work and what needs to improve."
                : "Your honest feedback helps this business understand what is working and what needs attention."}
            </p>

            <div className="mx-auto mt-6 grid max-w-3xl grid-cols-3 text-[10px] font-semibold leading-4 text-[#526fba] sm:text-sm sm:leading-5">
              <span className="flex min-w-0 flex-col items-center justify-start gap-2 border-r border-[#cfd8e7] px-2 sm:flex-row sm:justify-center sm:px-4">
                <Clock3 size={22} className="shrink-0 text-[#07143f]" />
                <span>About 3 minutes</span>
              </span>
              <span className="flex min-w-0 flex-col items-center justify-start gap-2 border-r border-[#cfd8e7] px-2 sm:flex-row sm:justify-center sm:px-4">
                <ShieldCheck size={22} className="shrink-0 text-[#07143f]" />
                <span>No account required</span>
              </span>
              <span className="flex min-w-0 flex-col items-center justify-start gap-2 px-2 sm:flex-row sm:justify-center sm:px-4">
                <BarChart3 size={22} className="shrink-0 text-[#07143f]" />
                <span>Combined into insights</span>
              </span>
            </div>
          </header>

          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-[#6bcf2a] bg-[#f7fff3] p-4 sm:px-6">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#4eaf12]" size={25} />
            <div>
              <p className="font-extrabold text-[#07143f]">
                Your individual answers stay private
              </p>
              <p className="mt-1 text-sm leading-6 text-[#667fb9]">
                The business sees completion progress and combined findings,
                not your individual ratings in its report.
              </p>
            </div>
          </div>

          <section className="mt-5 rounded-[22px] border border-[#cfdbee] bg-white p-5 shadow-[0_18px_55px_rgba(21,40,87,.05)] sm:p-8">
            <div className="flex flex-col gap-3 border-b border-[#dfe6f1] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-extrabold text-[#07143f]">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <div className="flex items-center gap-3 sm:min-w-[360px]">
                <span className="shrink-0 text-sm font-bold text-[#526fba]">
                  {progress}% complete
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e5eaf2]">
                  <div
                    className="h-full rounded-full bg-[#62c815] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-5">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[#526fba] sm:text-sm">
                {areaLabels[currentQuestion.business_area]}
              </span>
              <h2 className="mt-3 text-2xl font-black leading-tight text-[#07143f] sm:text-3xl lg:text-4xl">
                {currentQuestion.question_text}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#667fb9] sm:text-base">
                Choose the response that best reflects your own experience.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-5">
                {scaleOptions.map((option) => {
                  const isSelected = selectedAnswer === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        setAnswers((currentAnswers) => ({
                          ...currentAnswers,
                          [currentQuestion.id]: option.value,
                        }))
                      }
                      className={`relative flex min-h-[92px] items-center gap-4 rounded-xl border-2 px-4 py-4 text-left transition sm:flex-col sm:justify-center sm:text-center ${
                        isSelected
                          ? "border-[#60c515] bg-[#f4ffed]"
                          : "border-[#d7e0ee] bg-white hover:border-[#91a8cc]"
                      }`}
                    >
                      <span className="text-2xl font-black text-[#07143f]">
                        {option.value}
                      </span>
                      <span className="font-bold text-[#07143f]">
                        {option.label}
                      </span>
                      {isSelected && (
                        <span className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#62c815] text-white sm:absolute sm:bottom-2 sm:ml-0">
                          <Check size={16} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {error && (
                <p
                  className="mt-5 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#b42318]"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#dfe6f1] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[180px]"
                  disabled={currentIndex === 0 || isSaving}
                  onClick={() => {
                    setCurrentIndex((index) => Math.max(0, index - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <ArrowLeft size={18} />
                  Previous
                </button>

                <button
                  type="button"
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[280px]"
                  disabled={!selectedAnswer || isSaving}
                  onClick={handleNext}
                >
                  {isSaving ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : isLastQuestion ? (
                    <>
                      Submit responses
                      <CheckCircle2 size={18} />
                    </>
                  ) : (
                    <>
                      Next question
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>

              <p className="mt-4 text-center text-xs leading-5 text-[#7a86a8] sm:text-right">
                Please do not include sensitive personal information in your
                response.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
