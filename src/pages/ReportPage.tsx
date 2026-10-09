import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CircleAlert,
  Download,
  Info,
  Laptop,
  LoaderCircle,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  type ComponentType,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  getAssessmentReport,
  type AssessmentReport,
  type ReportAreaScore,
} from "../services/report";
type AreaDisplay = {
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  iconStyle: string;
};
const areaDisplay: Record<string, AreaDisplay> = {
  people: {
    label: "People",
    icon: Users,
    iconStyle: "bg-[#e8f8ef] text-[#10a968]",
  },
  operations: {
    label: "Operations",
    icon: Settings2,
    iconStyle: "bg-[#eaf5ff] text-[#1379f4]",
  },
  customer: {
    label: "Customer Experience",
    icon: BriefcaseBusiness,
    iconStyle: "bg-[#fff0ed] text-[#ff5d49]",
  },
  digital: {
    label: "Digital Readiness",
    icon: Laptop,
    iconStyle: "bg-[#f2eaff] text-[#7c3aed]",
  },
};
function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function toPercentage(score: number | null) {
  if (score === null) {
    return null;
  }
  return Math.round(Math.min(5, Math.max(0, score)) * 20);
}
function getSpread(area: ReportAreaScore) {
  const scores = [
    area.owner_score,
    area.employee_score,
    area.customer_score,
  ].filter((score): score is number => score !== null);
  if (scores.length < 2) {
    return null;
  }
  return Math.round((Math.max(...scores) - Math.min(...scores)) * 20);
}
function getClarityLabel(score: number) {
  if (score >= 80) {
    return "Strong";
  }
  if (score >= 65) {
    return "Developing";
  }
  if (score >= 50) {
    return "Emerging";
  }
  return "Needs attention";
}
function getGeneratedDate(report: AssessmentReport) {
  const date =
    report.analysis?.generated_at ??
    report.assessment.completed_at;
  if (!date) {
    return "Recently generated";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
function ScoreValue({
  value,
  variant,
}: {
  value: number | null;
  variant: "owner" | "employee" | "customer";
}) {
  const styles = {
    owner: "bg-[#e5efff] text-[#07143f]",
    employee: "bg-[#e8f8df] text-[#18811f]",
    customer: "bg-[#fff0ed] text-[#ef382b]",
  };
  if (value === null) {
    return (
      <span className="inline-flex min-h-9 min-w-[58px] items-center justify-center rounded-full bg-[#eef1f6] px-2 text-center text-[10px] font-semibold leading-3 text-[#66729b] sm:min-w-[76px] sm:text-xs">
        Not assessed
      </span>
    );
  }
  return (
    <span
      className={`inline-flex min-h-9 min-w-[52px] items-center justify-center rounded-full px-3 text-sm font-black sm:min-w-[68px] sm:text-base ${styles[variant]}`}
    >
      {toPercentage(value)}
    </span>
  );
}
function GapValue({
  area,
  isLargest,
}: {
  area: ReportAreaScore;
  isLargest: boolean;
}) {
  const spread = getSpread(area);
  if (spread === null) {
    return (
      <span className="text-sm font-bold text-[#66729b]">
        Not enough data
      </span>
    );
  }
  const meaning =
    spread <= 5
      ? {
          label: "Closely aligned",
          badgeClass: "bg-[#e8f8df] text-[#087a4d]",
          valueClass: "text-[#087a4d]",
        }
      : spread <= 20
        ? {
            label: "Small difference",
            badgeClass: "bg-[#eef5ff] text-[#1379f4]",
            valueClass: "text-[#1379f4]",
          }
        : spread <= 40
          ? {
              label: "Noticeable difference",
              badgeClass: "bg-[#fff4cf] text-[#8c6500]",
              valueClass: "text-[#8c6500]",
            }
          : {
              label: "Wide difference",
              badgeClass: "bg-[#fff0ed] text-[#ef382b]",
              valueClass: "text-[#ef382b]",
            };
  return (
    <div className="text-center">
      <span
        className={`whitespace-nowrap font-black ${meaning.valueClass}`}
      >
        {spread}
      </span>
      <span
        className={`mt-1 block rounded-full px-2 py-1 text-[9px] font-bold leading-3 sm:text-[10px] ${
          isLargest
            ? "bg-[#fff0ed] text-[#ef382b]"
            : meaning.badgeClass
        }`}
      >
        {isLargest ? "Most different" : meaning.label}
      </span>
    </div>
  );
}
export function ReportPage() {
  const [report, setReport] =
    useState<AssessmentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] =
    useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    const loadReport = async () => {
      try {
        const reportData = await getAssessmentReport();
        if (isMounted) {
          setReport(reportData);
        }
      } catch (error) {
        if (isMounted) {
          setPageError(
            error instanceof Error
              ? error.message
              : "Unable to load your assessment report.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    void loadReport();
    return () => {
      isMounted = false;
    };
  }, []);
  const largestGap = useMemo(() => {
    if (!report?.area_scores.length) {
      return null;
    }
    return [...report.area_scores].sort(
      (firstArea, secondArea) =>
        secondArea.gap_score - firstArea.gap_score,
    )[0];
  }, [report]);
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle
          size={36}
          className="animate-spin text-[#1379f4]"
          aria-label="Loading report"
        />
      </div>
    );
  }
  if (pageError) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="card p-6">
          <h1 className="text-xl font-extrabold text-[#07143f]">
            We could not load your report
          </h1>
          <p className="mt-2 text-[#66729b]">{pageError}</p>
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
  if (
    !report ||
    ("has_report" in report && report.has_report === false)
  ) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="card p-8 text-center">
          <CircleAlert
            size={38}
            className="mx-auto text-[#ff5d49]"
          />
          <h1 className="mt-4 text-2xl font-extrabold text-[#07143f]">
            No assessment report yet
          </h1>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-[#66729b]">
            Complete your business assessment and collect the
            required perspectives before viewing your report.
          </p>
          <Link to="/assessments" className="btn-primary mt-6">
            Go to assessments
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }
  const reportIsReady =
    report.assessment.status === "completed" &&
    report.analysis?.status === "completed" &&
    report.area_scores.length > 0 &&
    report.metric_scores.length > 0;
  if (!reportIsReady) {
    const requiredResponseCopy =
      report.assessment.perspective_type ===
      "owner_employee_customer"
        ? "The owner, customer and employee perspectives must each have at least one completed response."
        : "The owner and customer perspectives must each have at least one completed response.";
    return (
      <div className="mx-auto max-w-4xl text-[#07143f]">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1379f4]"
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </Link>
        <section className="mt-6 rounded-[22px] border border-[#dce5f1] bg-white p-7 text-center shadow-[0_12px_36px_rgba(7,20,63,.05)] sm:p-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4cf] text-[#8c6500]">
            <LoaderCircle size={30} className="animate-spin" />
          </span>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#315aa8]">
            Report not ready yet
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
            Your insight report is being prepared
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#66729b]">
            {report.assessment.status === "ready_for_analysis"
              ? "All required responses have been received. GrowthLens is calculating the scores and preparing your analysis."
              : requiredResponseCopy}
          </p>
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl bg-[#f5f8fd] p-5 text-left">
            <div className="flex gap-3">
              <ShieldCheck
                size={22}
                className="mt-0.5 shrink-0 text-[#1379f4]"
              />
              <div>
                <h2 className="font-extrabold">No placeholder scores</h2>
                <p className="mt-1 text-sm leading-6 text-[#66729b]">
                  Business scores, perspective gaps and AI-assisted insights
                  will appear only after the calculated results are available.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/assessments" className="btn-secondary">
              View assessment progress
            </Link>
            <button
              type="button"
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Refresh report status
            </button>
          </div>
        </section>
      </div>
    );
  }
  const includesEmployees =
    report.assessment.perspective_type ===
    "owner_employee_customer";
  const analysis = report.analysis;
  const recommendations = analysis?.recommendations ?? [];
  const clarityScore =
    report.area_scores.length > 0
      ? Math.round(
          report.area_scores.reduce(
            (total, area) =>
              total + toPercentage(area.combined_score)!,
            0,
          ) / report.area_scores.length,
        )
      : 0;
  const clarityLabel = getClarityLabel(clarityScore);
  const generatedDate = getGeneratedDate(report);
 const strongestArea = analysis?.strongest_area
  ? formatLabel(analysis.strongest_area)
  : null;
const priorityArea = analysis?.priority_area
  ? formatLabel(analysis.priority_area)
  : null;
const claritySummary = includesEmployees
  ? priorityArea
    ? `Your strongest opportunity is closing the perspective gap in ${priorityArea.toLowerCase()}.`
    : "Your strongest opportunity is bringing the different perspectives closer together."
  : priorityArea
    ? `Your business has a solid foundation, with the biggest opportunity in ${priorityArea.toLowerCase()}.`
    : strongestArea
      ? `Your business has a solid foundation, especially in ${strongestArea.toLowerCase()}.`
      : "Your report shows where your business is strongest and what deserves attention next.";
  const insight =
    analysis?.priority_gaps?.[0] ?? null;
  const title = includesEmployees
    ? "Your business through three perspectives"
    : "Your business through two perspectives";
  const subtitle = includesEmployees
    ? "See where owners, employees and customers agree—and where their experiences differ."
    : "See where your view aligns with your customers—and where it differs.";
  const printReport = () => {
    window.print();
  };
  return (
    <div className="mx-auto max-w-[1180px] text-[#07143f]">
      <div className="flex items-center gap-2 text-sm font-bold text-[#315aa8]">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 hover:text-[#1379f4]"
        >
          <ArrowLeft size={18} />
          <span className="sm:hidden">Reports</span>
          <span className="hidden sm:inline">
            Back to dashboard
          </span>
        </Link>
        {includesEmployees && (
          <>
            <span className="hidden sm:inline">/</span>
            <span className="hidden font-medium text-[#52617e] sm:inline">
              {report.assessment.title}
            </span>
          </>
        )}
      </div>
<header className="mt-5 flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
        <div>
         <h1 className="max-w-[780px] text-[2rem] font-black leading-[1.06] tracking-[-0.04em] sm:text-4xl xl:text-[2.7rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-[790px] text-base leading-7 text-[#526fba] sm:text-lg">
            {subtitle}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={printReport}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0f57f1] bg-white px-5 py-3 font-extrabold text-[#0f57f1] transition hover:bg-[#eef5ff]"
          >
            <Download size={20} />
            Download report
          </button>
          <Link
            to="/recommendations"
            className="hidden items-center justify-center gap-2 rounded-xl bg-[#ff5d49] px-5 py-3 font-extrabold text-white transition hover:bg-[#e84632] sm:inline-flex"
          >
            Create action plan
            <ArrowRight size={18} />
          </Link>
        </div>
      </header>
   <div className="mt-5 flex flex-wrap gap-x-1 gap-y-1 text-sm text-[#526fba] xl:justify-end">
  <span>Generated {generatedDate}</span>
  <span className="hidden sm:inline">·</span>
  <span className="hidden sm:inline">
    Based on {report.response_counts.owner} owner
    {includesEmployees
      ? `, ${report.response_counts.employee} employee${
          report.response_counts.employee === 1 ? "" : "s"
        }`
      : ""}
    {` and ${report.response_counts.customer} customer${
      report.response_counts.customer === 1 ? "" : "s"
    } response${
      report.response_counts.customer === 1 ? "" : "s"
    }`}
  </span>
</div>
     <section className="mt-6 rounded-[18px] border border-[#cbd9ef] bg-white px-5 py-5 shadow-[0_10px_35px_rgba(37,66,127,.04)] sm:px-6">
  <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)] xl:items-center">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#073383] sm:text-sm">
        Business clarity score
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div className="flex items-end">
          <span className="text-[4rem] font-black leading-none tracking-[-0.06em] sm:text-[4.75rem]">
            {clarityScore}
          </span>
          <span className="mb-1.5 ml-2 text-xl font-medium text-[#526fba] sm:text-2xl">
            /100
          </span>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#fff4c8] px-4 py-2.5 font-black text-[#936100]">
          <BarChart3 size={20} />
          {clarityLabel}
        </span>
      </div>
    </div>
    <div className="border-t border-[#cbd9ef] pt-4 xl:border-l xl:border-t-0 xl:py-3 xl:pl-9">
      <p className="max-w-2xl text-base font-medium leading-7 text-[#07143f] sm:text-lg">
        {claritySummary}
      </p>
    </div>
  </div>
</section>
        <div className="mt-5 grid min-w-0 items-start gap-4 2xl:grid-cols-[1.25fr_1fr]">
          <section className="order-1 rounded-[18px] border border-[#cbd9ef] bg-white p-3 shadow-[0_10px_35px_rgba(37,66,127,.04)] sm:p-6 2xl:col-start-1 2xl:row-start-1">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="text-2xl font-black tracking-[-0.03em]">
                Perspective comparison
              </h2>

              {includesEmployees && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold sm:justify-end">
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="h-3 w-3 rounded-full bg-[#07143f]" />
                    Owner
                  </span>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="h-3 w-3 rounded-full bg-[#75bd12]" />
                    Employees
                  </span>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="h-3 w-3 rounded-full bg-[#ff5d49]" />
                    Customers
                  </span>
                </div>
              )}
            </div>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-[#66729b] sm:text-sm">
              Higher scores mean a more positive experience. Difference shows
              how far apart the group scores are.
            </p>

            <div className="mt-4 overflow-hidden rounded-[14px] border border-[#d8e1ef]">
              <div
                className={`grid items-end gap-1 px-2 pb-2 pt-3 text-center text-[10px] font-bold text-[#526fba] sm:gap-3 sm:px-4 sm:text-sm ${
                  includesEmployees
                    ? "grid-cols-[minmax(82px,1.4fr)_52px_58px_58px_54px] sm:grid-cols-[minmax(170px,1.5fr)_100px_110px_110px_90px]"
                    : "grid-cols-[minmax(90px,1.5fr)_58px_68px_72px] sm:grid-cols-[minmax(190px,1.5fr)_120px_130px_150px]"
                }`}
              >
                <span />
                <span>Owner</span>
                {includesEmployees && <span>Employees</span>}
                <span>Customers</span>
                <span>Difference</span>
              </div>

              <div className="grid gap-2 p-2 pt-0 sm:p-3 sm:pt-0">
            {report.area_scores.map((area) => {
              const display =
                areaDisplay[area.business_area] ?? {
                  label: formatLabel(area.business_area),
                  icon: BarChart3,
                  iconStyle:
                    "bg-[#eef5ff] text-[#1379f4]",
                };
              const Icon = display.icon;
              return (
                <article
                  key={area.business_area}
                  className={`grid items-center gap-1 rounded-xl border border-[#d8e1ef] px-2 py-3 sm:gap-3 sm:px-4 ${
                    includesEmployees
                      ? "grid-cols-[minmax(82px,1.4fr)_52px_58px_58px_54px] sm:grid-cols-[minmax(170px,1.5fr)_100px_110px_110px_90px]"
                      : "grid-cols-[minmax(90px,1.5fr)_58px_68px_72px] sm:grid-cols-[minmax(190px,1.5fr)_120px_130px_150px]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${display.iconStyle}`}
                    >
                      <Icon size={21} />
                    </span>
                    <h3 className="text-xs font-black leading-4 sm:text-base">
                      {display.label}
                    </h3>
                  </div>
                  <div className="text-center">
                    <ScoreValue
                      value={area.owner_score}
                      variant="owner"
                    />
                  </div>
                  {includesEmployees && (
                    <div className="text-center">
                      <ScoreValue
                        value={area.employee_score}
                        variant="employee"
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <ScoreValue
                      value={area.customer_score}
                      variant="customer"
                    />
                  </div>
                  <div className="flex justify-center">
                    <GapValue
                      area={area}
                      isLargest={
                        largestGap?.business_area ===
                        area.business_area
                      }
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      {insight && (
      <section className="order-2 rounded-[18px] border border-[#cbd9ef] bg-white p-5 shadow-[0_10px_35px_rgba(37,66,127,.04)] sm:p-7 2xl:col-start-2 2xl:row-start-1">
          <div className="flex items-center gap-3">
            <Sparkles
              size={25}
              className="shrink-0 text-[#ff5d49]"
            />
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#315aa8] sm:text-sm">
              AI-assisted insight
            </p>
          </div>
          <h2 className="mt-4 text-2xl font-black leading-tight tracking-[-0.03em]">
            {insight.title}
          </h2>
       <p className="mt-3 max-w-2xl leading-7 text-[#526fba]">
  {insight.evidence}
</p>
          <div className="mt-4 flex items-start gap-3 border-t border-[#d8e1ef] pt-4 text-sm leading-6 text-[#526fba]">
            <Info size={20} className="mt-0.5 shrink-0" />
            <p>
              AI explains the scored results; it does not create
              the scores.
            </p>
          </div>
        </section>
      )}
      {recommendations.length > 0 && (
       <section className="order-3 rounded-[18px] border border-[#cbd9ef] bg-white p-5 shadow-[0_10px_35px_rgba(37,66,127,.04)] sm:p-7 2xl:col-start-1 2xl:row-start-2">
          <h2 className="text-2xl font-black tracking-[-0.03em]">
            Recommended next actions
          </h2>
          <div className="mt-4 divide-y divide-[#d8e1ef]">
            {recommendations
              .slice(0, 3)
              .map((recommendation, index) => {
                const isQuickWin =
                  recommendation.effort === "low";
                return (
                  <div
                    key={`${recommendation.title}-${index}`}
                    className="grid grid-cols-[34px_1fr] items-start gap-3 py-3 sm:grid-cols-[38px_1fr_auto] sm:items-center"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf2fa] font-black">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium leading-6 text-[#25427f] sm:text-base">
                      {recommendation.title}
                    </p>
                    <span
                      className={`col-start-2 w-fit rounded-full px-4 py-1.5 text-xs font-bold sm:col-start-auto ${
                        isQuickWin
                          ? "bg-[#e8f8df] text-[#087a4d]"
                          : "bg-[#fff0ed] text-[#ef382b]"
                      }`}
                    >
                      {isQuickWin
                        ? "Quick win"
                        : recommendation.effort === "high"
                          ? "High priority"
                          : "Priority"}
                    </span>
                  </div>
                );
              })}
          </div>
          <Link
            to="/recommendations"
            className="mt-4 inline-flex items-center gap-2 font-bold text-[#0f57f1] underline underline-offset-4"
          >
            View all recommendations
            <ArrowRight size={18} />
          </Link>
        </section>
      )}
     <div className="order-4 grid gap-4 2xl:col-start-2 2xl:row-start-2">
  {includesEmployees && (
    <section className="flex items-start gap-4 rounded-[16px] border border-[#cbd9ef] bg-white p-5 text-sm leading-6 text-[#526fba]">
      <ShieldCheck
        size={27}
        className="shrink-0 text-[#0f57f1]"
      />
      <p>
        Employee results are combined from{" "}
        {report.response_counts.employee} response
        {report.response_counts.employee === 1 ? "" : "s"}.
        Individual answers are never shown.
      </p>
    </section>
  )}
  <details className="group rounded-[16px] border border-[#cbd9ef] bg-white">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-[#0f57f1]">
      <span className="flex items-center gap-4">
        <BookOpen size={25} />
        How GrowthLens calculated this report
      </span>
      <ArrowRight
        size={20}
        className="shrink-0 transition group-open:rotate-90"
      />
    </summary>
    <div className="border-t border-[#d8e1ef] px-5 py-4 text-sm leading-7 text-[#526fba]">
      <p>
        GrowthLens converts each assessment response to a
        consistent score, groups the results by business area and
        compares only the perspectives included in this
        assessment.
      </p>
      <p className="mt-2">
        The AI then explains those calculated scores in plain
        language. It does not change or invent the scores.
      </p>
    </div>
  </details>
</div>
      </div>
    </div>
  );
}
