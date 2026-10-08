import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  loadOwnerAssessment,
  saveOwnerAssessment,
  type AssessmentAnswers,
  type AssessmentQuestion,
} from "../services/assessmentResponses";

const scaleOptions = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Not sure" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
];

const areaOrder = [
  "people",
  "operations",
  "customer",
  "digital",
] as const;

const areaLabels = {
  people: "People",
  operations: "Operations",
  customer: "Customer experience",
  digital: "Digital readiness",
};

export function OwnerAssessmentPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assessmentId) {
      return;
    }

    const loadAssessment = async () => {
      try {
        const data = await loadOwnerAssessment(assessmentId);

        setQuestions(data.questions);
        setAnswers(data.answers);

        const firstUnanswered = data.questions.findIndex(
          (question) => !data.answers[question.id],
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
            : "Unable to load the assessment.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadAssessment();
  }, [assessmentId]);

  if (!assessmentId) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="card p-6">
          <h1 className="text-xl font-extrabold text-[#07143f]">
            Assessment not found
          </h1>
          <p className="mt-2 text-[#66729b]">
            This assessment link is missing or invalid.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle
          size={34}
          className="animate-spin text-[#1379f4]"
          aria-label="Loading assessment"
        />
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="rounded-xl bg-[#fff0ed] px-4 py-3 font-semibold text-[#b42318]">
          {error}
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="card p-6">No owner questions are available.</p>
      </div>
    );
  }

  const selectedAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = questions.filter(
    (question) => Boolean(answers[question.id]),
  ).length;
  const progress = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const handleNext = async () => {
    if (!selectedAnswer || !assessmentId) return;

    setError(null);

    if (!isLastQuestion) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    setIsSaving(true);

    try {
      await saveOwnerAssessment(assessmentId, answers);
      navigate(`/assessments/${assessmentId}/participants`);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save your answers.",
      );
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1220px] text-[#07143f]">
      <header>
        <span className="eyebrow">Owner assessment</span>
        <h1 className="mt-2 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">
          Tell us how your business works today
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#66729b] sm:text-lg">
          There are no right or wrong answers. Choose what best reflects
          your current reality.
        </p>
      </header>

      <div className="mt-7 grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-[22px] border border-[#dfe6f1] bg-white p-5 shadow-[0_12px_35px_rgba(21,40,87,.05)] lg:sticky lg:top-24">
          <div className="flex items-end justify-between gap-3 lg:block">
            <div>
              <h2 className="font-extrabold">Assessment progress</h2>
              <p className="mt-1 text-sm font-bold text-[#66729b]">
                {progress}% complete
              </p>
            </div>

            <p className="text-sm text-[#66729b] lg:mt-5">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e8edf5]">
            <div
              className="h-full rounded-full bg-[#74bf00] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-2">
            {areaOrder.map((area, index) => {
              const areaQuestions = questions.filter(
                (question) => question.business_area === area,
              );
              const areaIsComplete =
                areaQuestions.length > 0 &&
                areaQuestions.every((question) => answers[question.id]);
              const areaIsCurrent =
                currentQuestion.business_area === area;

              return (
                <div
                  key={area}
                  className={`flex items-center gap-3 rounded-xl px-2 py-2 transition ${
                    areaIsCurrent ? "bg-[#f2f9e9]" : ""
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                      areaIsCurrent
                        ? "bg-[#74bf00] text-white"
                        : areaIsComplete
                          ? "bg-[#e8f8df] text-[#087a4d]"
                          : "bg-[#edf1f7] text-[#66729b]"
                    }`}
                  >
                    {areaIsComplete && !areaIsCurrent ? (
                      <Check size={17} strokeWidth={3} />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <span
                    className={`min-w-0 text-sm font-bold leading-5 ${
                      areaIsCurrent
                        ? "text-[#07143f]"
                        : "text-[#66729b]"
                    }`}
                  >
                    {areaLabels[area]}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="rounded-[22px] border border-[#dfe6f1] bg-white p-5 shadow-[0_12px_35px_rgba(21,40,87,.05)] sm:p-7 lg:p-9">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#315aa8] sm:text-sm">
            {areaLabels[currentQuestion.business_area]}
          </span>

          <h2 className="mt-3 text-2xl font-black leading-tight tracking-[-0.025em] sm:text-3xl">
            {currentQuestion.question_text}
          </h2>

          <p className="mt-3 leading-7 text-[#66729b]">
            Choose the answer that best reflects your business today.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-5">
            {scaleOptions.map((option) => {
              const isSelected = selectedAnswer === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setAnswers((currentAnswers) => ({
                      ...currentAnswers,
                      [currentQuestion.id]: option.value,
                    }))
                  }
                  className={`relative flex min-h-[88px] items-center gap-4 rounded-2xl border-2 px-4 py-4 text-left transition sm:min-h-[145px] sm:flex-col sm:justify-center sm:gap-2 sm:text-center ${
                    isSelected
                      ? "border-[#74bf00] bg-[#f2f9e9]"
                      : "border-[#dfe6f1] bg-white hover:border-[#9eb1d2]"
                  }`}
                >
                  <span className="text-2xl font-black">
                    {option.value}
                  </span>

                  <span className="text-sm font-bold leading-5">
                    {option.label}
                  </span>

                  {isSelected && (
                    <span className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#74bf00] text-white sm:absolute sm:bottom-3 sm:left-1/2 sm:ml-0 sm:-translate-x-1/2">
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

          <div className="mt-7 flex flex-col gap-3 border-t border-[#e7ebf2] pt-5 sm:flex-row sm:items-center sm:justify-between">
            {currentIndex > 0 && (
              <button
                type="button"
                className="btn-secondary order-2 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50 sm:order-1 sm:w-auto"
                disabled={isSaving}
                onClick={() =>
                  setCurrentIndex((index) => Math.max(0, index - 1))
                }
              >
                <ArrowLeft size={18} />
                Previous
              </button>
            )}

            <button
              type="button"
              className="btn-primary order-1 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:ml-auto sm:w-auto sm:min-w-[210px]"
              disabled={!selectedAnswer || isSaving}
              onClick={handleNext}
            >
              {isSaving ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Saving...
                </>
              ) : isLastQuestion ? (
                "Submit assessment"
              ) : (
                <>
                  Next question
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
