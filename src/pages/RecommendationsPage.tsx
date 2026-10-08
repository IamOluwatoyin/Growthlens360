import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Clock3,
  Info,
  Lightbulb,
  LoaderCircle,
  Sparkles,
  Target,
  MessageSquareText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDashboardOverview,
  type DashboardOverview,
} from "../services/dashboard";

function formatArea(area: string | null) {
  if (!area) {
    return "Business";
  }

  return area
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function getRecommendationStyle(index: number) {
  if (index === 0) {
    return {
      label: "Start here",
      className: "bg-[#fff0ed] text-[#ef382b]",
    };
  }

  return {
    label: `Priority ${index + 1}`,
    className: "bg-[#eaf5ff] text-[#1379f4]",
  };
}
function summariseAction(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return "";
  }

  const sentenceEnd = cleanValue.search(/[.!?](\s|$)/);

  const firstSentence =
    sentenceEnd >= 0
      ? cleanValue.slice(0, sentenceEnd + 1)
      : cleanValue;

  if (firstSentence.length <= 180) {
    return firstSentence;
  }

  return `${firstSentence.slice(0, 177).trim()}...`;
}

export function RecommendationsPage() {
  const [overview, setOverview] =
    useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] =
    useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRecommendations = async () => {
      try {
        const dashboardOverview =
          await getDashboardOverview();

        if (isMounted) {
          setOverview(dashboardOverview);
        }
      } catch (error) {
        if (isMounted) {
          setPageError(
            error instanceof Error
              ? error.message
              : "Unable to load your recommendations.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle
          size={36}
          className="animate-spin text-[#1379f4]"
          aria-label="Loading recommendations"
        />
      </div>
    );
  }

  if (pageError || !overview) {
    return (
      <div className="mx-auto max-w-5xl">
        <Link
          to="/reports"
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#1379f4]"
        >
          <ArrowLeft size={18} />
          Back to report
        </Link>

        <div className="card p-6">
          <h1 className="text-xl font-extrabold">
            We could not load your recommendations
          </h1>

          <p className="mt-2 text-[#66729b]">
            {pageError ??
              "No recommendation data was returned."}
          </p>

          <button
            type="button"
            className="btn-primary mt-5"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!overview.has_assessment || !overview.analysis) {
    return (
      <div className="mx-auto max-w-5xl">
        <Link
          to="/reports"
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#1379f4]"
        >
          <ArrowLeft size={18} />
          Back to report
        </Link>

        <div className="card p-8 text-center">
          <Lightbulb
            size={38}
            className="mx-auto text-[#ff5d49]"
          />

          <h1 className="mt-5 text-2xl font-extrabold">
            Your recommendations are not ready yet
          </h1>

          <p className="mx-auto mt-3 max-w-xl leading-7 text-[#66729b]">
            Complete the required assessment perspectives first.
            GrowthLens will analyse the responses and prepare
            practical recommendations.
          </p>

          <Link
            to="/assessments"
            className="btn-primary mt-6"
          >
            Go to assessment
          </Link>
        </div>
      </div>
    );
  }

  const analysis = overview.analysis;
  const recommendations = analysis.recommendations ?? [];

  const priorityCount = recommendations.filter(
    (recommendation) => recommendation.effort !== "low",
  ).length;

  const startingPoint = recommendations[0] ?? null;

  const startingPointSummary = startingPoint
  ? summariseAction(startingPoint.action)
  : "";

  return (
    <div className="mx-auto max-w-[1180px] text-[#07143f]">
      <div className="flex items-center gap-2 text-sm text-[#315aa8]">
        <Link
          to="/reports"
          className="font-bold transition hover:text-[#1379f4]"
        >
          Reports
        </Link>

        <span>/</span>

        <span className="hidden sm:inline">
          {overview.business_name ?? "Business diagnosis"}
        </span>

        <span className="hidden sm:inline">/</span>

        <span>Recommendations</span>
      </div>

      <header className="mt-5 flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
        <div>
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl xl:text-[2.7rem]">
            Turn your insights into action
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-[#526fba] sm:text-lg">
            Review the suggested actions, understand why they
            matter and decide what your business should do next.
          </p>
        </div>

        <Link
          to="/actions"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ff5d49] px-5 py-3 font-extrabold text-white transition hover:bg-[#e84632]"
        >
          Open action plan
          <ArrowRight size={18} />
        </Link>
      </header>

      <section className="mt-7 rounded-[18px] border border-[#cbd9ef] bg-white p-5 shadow-[0_10px_35px_rgba(37,66,127,.04)] sm:p-7">
       <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_430px] 2xl:items-center">
          <div>
            <div className="flex items-center gap-3">
              <Sparkles
                size={24}
                className="shrink-0 text-[#ff5d49]"
              />

              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#315aa8] sm:text-sm">
                AI-suggested starting point
              </p>
            </div>

            {startingPoint ? (
              <>
                <h2 className="mt-4 text-xl font-black sm:text-2xl">
                  {startingPoint.title}
                </h2>
<p className="mt-3 max-w-2xl leading-7 text-[#526fba]">
  {startingPointSummary}
</p>

                <div className="mt-4 flex items-start gap-2 text-sm text-[#526fba]">
                  <Info
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <p>
                    These are suggestions based on your report.
                    Nothing is started automatically.
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-4 text-[#66729b]">
                No suggested starting point is available yet.
              </p>
            )}
          </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl bg-[#f6f8fc] p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf0fa] text-lg font-black">
                {recommendations.length}
              </span>

              <span className="text-sm font-bold text-[#25427f]">
                Suggested actions
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[#fff8f6] p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff0ed] text-lg font-black text-[#ef382b]">
                {priorityCount}
              </span>

              <span className="text-sm font-bold text-[#25427f]">
                Priority actions
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[#f2fbf6] p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f8df] text-[#087a4d]">
                <CalendarDays size={21} />
              </span>

              <span className="text-sm font-bold text-[#25427f]">
                Flexible dates
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[18px] border border-[#cbd9ef] bg-white p-4 shadow-[0_10px_35px_rgba(37,66,127,.04)] sm:p-6">
        <div className="flex items-center gap-3">
          <Target className="text-[#1379f4]" />

          <div>
            <h2 className="text-2xl font-black">
              Suggested actions
            </h2>

            <p className="mt-1 text-sm text-[#66729b]">
              Practical next steps based on your latest report.
            </p>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#cbd9ef] p-8 text-center">
            <CircleAlert
              size={30}
              className="mx-auto text-[#ff5d49]"
            />

            <h3 className="mt-4 text-lg font-extrabold">
              No recommendations available
            </h3>

            <p className="mt-2 text-sm text-[#66729b]">
              Your analysis is complete, but no recommended
              actions were returned.
            </p>
          </div>
        ) : (
         <div className="mt-6 grid gap-5">
  {recommendations.map((recommendation, index) => {
    const style = getRecommendationStyle(index);

    const relatedGap =
      analysis.priority_gaps?.find(
        (gap) => gap.area === recommendation.area,
      ) ??
      analysis.priority_gaps?.[index] ??
      null;

    const draftingQuestion = encodeURIComponent(
      `Help me prepare what I need to carry out this recommendation: "${recommendation.title}". The recommended action is: ${recommendation.action}. Please create a practical draft suitable for my business.`,
    );

    return (
      <article
        key={`${recommendation.area}-${recommendation.title}-${index}`}
        className="overflow-hidden rounded-[20px] border border-[#d8e1ef] bg-white"
      >
        <div className="border-b border-[#e4e9f2] bg-[#f9fbff] px-5 py-5 sm:px-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf2fa] text-lg font-black text-[#07143f]">
                {index + 1}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${style.className}`}
                  >
                    {style.label}
                  </span>

                  <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-extrabold text-[#315aa8]">
                    {formatArea(recommendation.area)}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-black leading-snug text-[#07143f] sm:text-2xl">
                  {recommendation.title}
                </h3>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[#52617e] shadow-sm">
                <Clock3 size={14} />
                {recommendation.timeframe}
              </span>

              <span className="rounded-full bg-white px-3 py-2 capitalize text-[#52617e] shadow-sm">
                {recommendation.effort} effort
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-7 xl:grid-cols-2">
          <section className="rounded-2xl border border-[#d8e1ef] bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#315aa8]">
              What the assessment found
            </p>

            {relatedGap ? (
              <>
                <h4 className="mt-3 text-lg font-extrabold text-[#07143f]">
                  {relatedGap.title}
                </h4>

                <p className="mt-3 text-sm leading-7 text-[#52617e]">
                  {relatedGap.evidence}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-7 text-[#52617e]">
                This recommendation was generated from the results and
                perspective differences identified in your latest
                assessment.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-[#f2d2cd] bg-[#fff8f6] p-5">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#b42318]">
              Why this matters
            </p>

            <p className="mt-3 text-sm leading-7 text-[#52617e]">
              {relatedGap?.why_it_matters ||
                recommendation.reason ||
                "Addressing this area can improve consistency and strengthen the experience your business provides."}
            </p>
          </section>
        </div>

        <div className="mx-5 mb-5 rounded-2xl bg-[#f3f7fd] p-5 sm:mx-7 sm:mb-7 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1379f4] text-white">
              <Lightbulb size={20} />
            </span>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#315aa8]">
                What to do next
              </p>

              <p className="mt-2 leading-7 text-[#25427f]">
                {recommendation.action}
              </p>
            </div>
          </div>
        </div>

        {recommendation.reason &&
          recommendation.reason !== relatedGap?.why_it_matters && (
            <div className="mx-5 mb-5 border-t border-[#e4e9f2] pt-5 sm:mx-7 sm:mb-7">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66729b]">
                Expected benefit
              </p>

              <p className="mt-2 text-sm leading-7 text-[#52617e]">
                {recommendation.reason}
              </p>
            </div>
          )}

        <div className="flex flex-col gap-3 border-t border-[#e4e9f2] bg-[#fcfdff] px-5 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-7">
          <Link
            to={`/advisor?question=${draftingQuestion}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1379f4] bg-white px-4 py-3 text-sm font-extrabold text-[#1379f4] transition hover:bg-[#eef5ff]"
          >
            <MessageSquareText size={17} />
            Help me draft this
          </Link>

          <Link
            to={`/actions?recommendation=${index}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff5d49] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#e84632]"
          >
            Track this action
            <ArrowRight size={17} />
          </Link>
        </div>
      </article>
    );
  })}
</div>
        )}
      </section>

      <section className="mt-5 flex flex-col justify-between gap-5 rounded-[18px] bg-[#07143f] p-6 text-white sm:flex-row sm:items-center sm:p-7">
        <div>
          <h2 className="text-2xl font-black">
            Ready to track your progress?
          </h2>

          <p className="mt-2 max-w-2xl leading-7 text-blue-100">
            Open your action plan to set dates, update statuses and
            keep notes about what you learn.
          </p>
        </div>

        <Link
          to="/actions"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-extrabold text-[#07143f]"
        >
          Open action plan
          <ArrowRight size={18} />
        </Link>
      </section>

      <div className="mt-5 flex justify-start">
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1379f4]"
        >
          <ArrowLeft size={18} />
          Back to report
        </Link>
      </div>
    </div>
  );
}