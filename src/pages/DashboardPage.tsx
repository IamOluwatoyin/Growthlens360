import { useEffect, useState } from "react";

import {

  ArrowRight,

  CheckCircle2,

  CircleAlert,

  ClipboardCheck,

  Cog,

  Laptop,

  MessageCircle,

  Sparkles,

  Star,

  UsersRound,

} from "lucide-react";

import { Link } from "react-router-dom";

import {

  getDashboardOverview,

  type BusinessArea,

  type DashboardAreaScore,

  type DashboardOverview,

  type LargestGap,

} from "../services/dashboard";



const areaStyles: Record<

  BusinessArea,

  {

    label: string;

    icon: typeof UsersRound;

    iconBackground: string;

    iconColor: string;

    barColor: string;

    valueColor: string;

    badgeBackground: string;

    badgeColor: string;

  }

> = {

  people: {

    label: "People",

    icon: UsersRound,

    iconBackground: "bg-[#ffe8e5]",

    iconColor: "text-[#ff5d49]",

    barColor: "bg-[#ff6154]",

    valueColor: "text-[#ff4f45]",

    badgeBackground: "bg-[#e9f8ec]",

    badgeColor: "text-[#168236]",

  },

  operations: {

    label: "Operations",

    icon: Cog,

    iconBackground: "bg-[#e4f3ff]",

    iconColor: "text-[#268ff0]",

    barColor: "bg-[#379bf4]",

    valueColor: "text-[#268ff0]",

    badgeBackground: "bg-[#eaf5ff]",

    badgeColor: "text-[#1267c4]",

  },

  customer: {

    label: "Customer Experience",

    icon: Star,

    iconBackground: "bg-[#e4f8e8]",

    iconColor: "text-[#168236]",

    barColor: "bg-[#ff6154]",

    valueColor: "text-[#ff4f45]",

    badgeBackground: "bg-[#fff0ed]",

    badgeColor: "text-[#e84632]",

  },

  digital: {

    label: "Digital Readiness",

    icon: Laptop,

    iconBackground: "bg-[#ffe9e7]",

    iconColor: "text-[#ff5d49]",

    barColor: "bg-[#865be0]",

    valueColor: "text-[#ff4f45]",

    badgeBackground: "bg-[#f1eaff]",

    badgeColor: "text-[#7144d1]",

  },

};



function formatLabel(value: string) {

  return value

    .split("_")

    .map(

      (word) =>

        word.charAt(0).toUpperCase() +

        word.slice(1),

    )

    .join(" ");

}



function formatDate(value?: string | null) {

  if (!value) {

    return "Assessment in progress";

  }



  return new Intl.DateTimeFormat("en-GB", {

    day: "numeric",

    month: "long",

    year: "numeric",

  }).format(new Date(value));

}



function getHealthLabel(score: number) {

  if (score >= 80) {

    return {

      label: "Strong",

      description: "Strong performance with room to grow",

      background: "bg-[#e8f8ef]",

      color: "text-[#168236]",

    };

  }



  if (score >= 60) {

    return {

      label: "Developing",

      description: "On track with real potential",

      background: "bg-[#fff4cf]",

      color: "text-[#8c6500]",

    };

  }



  if (score >= 40) {

    return {

      label: "Building momentum",

      description: "Important opportunities identified",

      background: "bg-[#fff0ed]",

      color: "text-[#d94735]",

    };

  }



  return {

    label: "Priority attention",

    description: "Clear opportunities to improve",

    background: "bg-[#fff0ed]",

    color: "text-[#d94735]",

  };

}



function getLargestGapCopy(

  gap: LargestGap | null,

) {

  if (!gap) {

    return "Complete the assessment to identify where perspectives differ.";

  }



  if (

    gap.owner_score !== null &&

    gap.customer_score !== null &&

    gap.owner_score > gap.customer_score

  ) {

    return "Your view is more positive than your customers’ experience. Review the evidence to understand what may be causing the difference.";

  }



  if (

    gap.owner_score !== null &&

    gap.customer_score !== null &&

    gap.customer_score > gap.owner_score

  ) {

    return "Customers experience this more positively than you expected. Review what is working so you can repeat it consistently.";

  }



  if (

    gap.employee_score !== null &&

    gap.owner_score !== null &&

    gap.owner_score !== gap.employee_score

  ) {

    return "You and your employees see this differently. Review the evidence to understand their experience.";

  }



  return "The perspectives are closely aligned in this area.";

}



function getStrongestArea(

  areaScores: DashboardAreaScore[],

) {

  if (areaScores.length === 0) {

    return null;

  }



  return [...areaScores].sort(

    (first, second) =>

      second.combined_score_100 -

      first.combined_score_100,

  )[0];

}



function getAreaBadge(

  areaScore: DashboardAreaScore,

  strongestArea: DashboardAreaScore | null,

  largestGap: LargestGap | null,

) {

  if (

    strongestArea?.business_area ===

    areaScore.business_area

  ) {

    return "Strongest area";

  }



  if (

    largestGap?.business_area ===

    areaScore.business_area

  ) {

    return "Largest gap";

  }



  if (areaScore.combined_score_100 >= 70) {

    return "Performing well";

  }



  return "Opportunity";

}



function toScore100(value: number | null) {

  if (value === null) {

    return null;

  }



  return Math.round(value * 20);

}



function PerspectiveBar({

  label,

  value,

  color,

}: {

  label: string;

  value: number | null;

  color: string;

}) {

  if (value === null) {

    return null;

  }



  return (

    <div className="grid grid-cols-[82px_36px_1fr] items-center gap-3">

      <span className="text-sm font-semibold text-[#26375e]">

        {label}

      </span>



      <strong className="text-sm text-[#07143f]">

        {value}

      </strong>



      <div className="h-3 overflow-hidden rounded-full bg-[#e9eef6]">

        <div

          className={`h-full rounded-full ${color}`}

          style={{

            width: `${Math.min(value, 100)}%`,

          }}

        />

      </div>

    </div>

  );

}



function DesktopAreaChart({

  areaScores,

  includesEmployees,

  largestGap,

}: {

  areaScores: DashboardAreaScore[];

  includesEmployees: boolean;

  largestGap: LargestGap | null;

}) {

  return (

    <section className="rounded-[18px] border border-[#dce5f1] bg-white p-5 shadow-[0_8px_24px_rgba(7,20,63,.05)]">

      <h2 className="text-xl font-black text-[#07143f]">

        Where perspectives differ

      </h2>



      <p className="mt-1 text-sm text-[#687ca9]">

        The same business. Different perspectives.

        Understand where views align—and where they

        don’t.

      </p>



      <div className="mt-6 grid grid-cols-4 gap-4 border-b border-[#dfe6f1] px-2">

        {areaScores.map((areaScore) => {

          const ownerScore =

            areaScore.owner_score_100 ?? 0;



          const employeeScore =

            areaScore.employee_score_100 ?? 0;



          const customerScore =

            areaScore.customer_score_100 ?? 0;



          const isLargestGap =

            largestGap?.business_area ===

            areaScore.business_area;



          return (

            <div

              key={areaScore.business_area}

              className={`relative flex min-w-0 flex-col ${

                isLargestGap

                  ? "rounded-t-xl bg-[#fff4f1]"

                  : ""

              }`}

            >

              {isLargestGap && (

                <span className="absolute inset-x-0 top-0 text-center text-xs font-extrabold text-[#ff4f45]">

                  {areaScore.gap_score_100}-point gap

                </span>

              )}



              <div className="flex h-[205px] items-end justify-center gap-2 px-2 pb-2 pt-7">

                <div className="flex h-full flex-1 items-end justify-center">

                  <div

                    className="relative w-full max-w-[38px] rounded-t bg-[#17365f]"

                    style={{

                      height: `${ownerScore}%`,

                    }}

                  >

                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-extrabold text-[#07143f]">

                      {ownerScore}

                    </span>

                  </div>

                </div>



                {includesEmployees && (

                  <div className="flex h-full flex-1 items-end justify-center">

                    <div

                      className="relative w-full max-w-[38px] rounded-t bg-[#5dc873]"

                      style={{

                        height: `${employeeScore}%`,

                      }}

                    >

                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-extrabold text-[#07143f]">

                        {employeeScore}

                      </span>

                    </div>

                  </div>

                )}



                <div className="flex h-full flex-1 items-end justify-center">

                  <div

                    className="relative w-full max-w-[38px] rounded-t bg-[#ff6154]"

                    style={{

                      height: `${customerScore}%`,

                    }}

                  >

                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-extrabold text-[#07143f]">

                      {customerScore}

                    </span>

                  </div>

                </div>

              </div>



              <p className="min-h-[42px] px-1 py-3 text-center text-xs font-semibold leading-4 text-[#31528c]">

                {

                  areaStyles[areaScore.business_area]

                    .label

                }

              </p>

            </div>

          );

        })}

      </div>



      <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-[#31528c]">

        <span className="inline-flex items-center gap-2">

          <span className="h-3 w-3 rounded-full bg-[#17365f]" />

          Owner

        </span>



        {includesEmployees && (

          <span className="inline-flex items-center gap-2">

            <span className="h-3 w-3 rounded-full bg-[#5dc873]" />

            Employees

          </span>

        )}



        <span className="inline-flex items-center gap-2">

          <span className="h-3 w-3 rounded-full bg-[#ff6154]" />

          Customers

        </span>

      </div>

    </section>

  );

}



export function DashboardPage() {

  const [dashboard, setDashboard] =

    useState<DashboardOverview | null>(null);



  const [isLoading, setIsLoading] =

    useState(true);



  const [dashboardError, setDashboardError] =

    useState<string | null>(null);



  useEffect(() => {

    let isMounted = true;



    const loadDashboard = async () => {

      try {

        const overview =

          await getDashboardOverview();



        if (isMounted) {

          setDashboard(overview);

        }

      } catch (error) {

        if (isMounted) {

          setDashboardError(

            error instanceof Error

              ? error.message

              : "Unable to load your dashboard.",

          );

        }

      } finally {

        if (isMounted) {

          setIsLoading(false);

        }

      }

    };



    void loadDashboard();



    return () => {

      isMounted = false;

    };

  }, []);



  if (isLoading) {

    return (

      <div className="flex min-h-[500px] items-center justify-center">

        <div

          className="h-11 w-11 animate-spin rounded-full border-4 border-[#dfe6f1] border-t-[#ff5d49]"

          aria-label="Loading dashboard"

          role="status"

        />

      </div>

    );

  }



  if (dashboardError || !dashboard) {

    return (

      <div className="mx-auto max-w-[1450px]">

        <div className="card p-6">

          <h1 className="text-xl font-extrabold">

            We could not load your dashboard

          </h1>



          <p className="mt-2 text-[#66729b]">

            {dashboardError ??

              "No dashboard data was returned."}

          </p>



          <button

            type="button"

            className="btn-primary mt-5"

            onClick={() =>

              window.location.reload()

            }

          >

            Try again

          </button>

        </div>

      </div>

    );

  }



  if (!dashboard.has_assessment) {

    return (

      <div className="mx-auto max-w-[1450px]">

        <h1 className="text-4xl font-black tracking-[-0.04em] text-[#07143f] sm:text-5xl">

          Dashboard

        </h1>



        <p className="mt-2 text-lg text-[#48639e]">

          See what your business is telling you—and

          where to focus next.

        </p>



        <div className="card mt-8 p-8 text-center sm:p-12">

          <h2 className="text-2xl font-extrabold">

            Start your first business diagnosis

          </h2>



          <p className="mx-auto mt-3 max-w-xl leading-7 text-[#66729b]">

            Compare the perspectives that matter and

            discover what to focus on first.

          </p>



          <Link

            to="/assessments"

            className="btn-primary mt-6"

          >

            Start assessment

            <ArrowRight size={18} />

          </Link>

        </div>

      </div>

    );

  }



  const isCompleted =

    dashboard.assessment?.status === "completed";



  const includesEmployees =

    dashboard.assessment?.perspective_type ===

    "owner_employee_customer";

  const perspectivesLabel = includesEmployees
    ? "Owner + Employee + Customer"
    : "Owner + Customer";

  const requiredPerspectives = includesEmployees
    ? (["owner", "employee", "customer"] as const)
    : (["owner", "customer"] as const);

  const perspectiveStatus = requiredPerspectives.map((perspective) => {
    const progressItem = dashboard.perspective_progress.find(
      (item) => item.perspective === perspective,
    );

    const completed =
      (progressItem?.completed_participants ?? 0) > 0 ||
      (progressItem?.progress ?? 0) >= 100;

    return {
      perspective,
      completed,
      progress: progressItem?.progress ?? 0,
    };
  });

  const completedPerspectiveCount = perspectiveStatus.filter(
    (item) => item.completed,
  ).length;

  const requiredPerspectiveCount = perspectiveStatus.length;
  const perspectiveCompletion = Math.round(
    (completedPerspectiveCount / requiredPerspectiveCount) * 100,
  );
  const ownerCompleted =
    perspectiveStatus.find((item) => item.perspective === "owner")
      ?.completed ?? false;
  const allRequiredPerspectivesComplete =
    completedPerspectiveCount === requiredPerspectiveCount;

  const analysisRequested =
    dashboard.assessment?.status === "ready_for_analysis";

  const completedResponseTotal =
    (ownerCompleted ? 1 : 0) + dashboard.response_count;

  const recommendedResponseTarget = 5;

  if (!isCompleted) {
    return (
      <div className="mx-auto max-w-[1450px]">
        <header>
          <h1 className="text-4xl font-black tracking-[-0.045em] text-[#07143f] sm:text-5xl xl:text-[2.8rem]">
            Business Diagnosis
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <strong className="text-xl text-[#07143f]">
              {dashboard.business_name ?? "Your business"}
            </strong>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fff4cf] px-4 py-2 text-sm font-bold text-[#8c6500]">
              <CircleAlert size={17} />
              {analysisRequested
                ? "Preparing your report"
                : allRequiredPerspectivesComplete
                  ? "Ready to generate"
                  : "Collecting perspectives"}
            </span>
            <span className="hidden h-7 w-px bg-[#d9e1ed] sm:block" />
            <span className="text-sm font-semibold text-[#31528c]">
              Perspectives: {perspectivesLabel}
            </span>
          </div>
        </header>

        <section className="mt-7 grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
          <article className="rounded-[22px] border border-[#dce5f1] bg-white p-6 shadow-[0_12px_36px_rgba(7,20,63,.05)] sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#31528c]">
              Perspective progress
            </p>

            <div className="mt-6 flex items-center justify-between gap-5">
              <div>
                <div className="flex items-end">
                  <strong className="text-[4.5rem] font-black leading-none tracking-[-0.065em] text-[#07143f]">
                    {completedPerspectiveCount}
                  </strong>
                  <span className="mb-1 ml-2 text-2xl font-bold text-[#8293ba]">
                    of {requiredPerspectiveCount}
                  </span>
                </div>
                <p className="mt-3 font-bold text-[#52617e]">
                  required perspectives completed
                </p>
              </div>

              <div
                className="relative flex h-[118px] w-[118px] shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#62c815 0deg, #62c815 ${perspectiveCompletion * 3.6}deg, #e8edf5 ${perspectiveCompletion * 3.6}deg, #e8edf5 360deg)`,
                }}
              >
                <div className="flex h-[86px] w-[86px] items-center justify-center rounded-full bg-white text-xl font-black text-[#07143f]">
                  {perspectiveCompletion}%
                </div>
              </div>
            </div>

            <p className="mt-6 leading-7 text-[#48639e]">
              {analysisRequested
                ? "All required perspectives have been submitted. GrowthLens is calculating the scores and preparing your report."
                : allRequiredPerspectivesComplete
                  ? `Every required perspective is represented. You have ${completedResponseTotal} of the recommended ${recommendedResponseTarget} completed responses and can choose when to generate the report.`
                  : "Your business health score will appear after the required perspectives are submitted and you choose to generate the report."}
            </p>
          </article>

          <article className="rounded-[22px] border border-[#dce5f1] bg-white p-6 shadow-[0_12px_36px_rgba(7,20,63,.05)] sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-2xl font-black text-[#07143f]">
                  Required responses
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#687ca9]">
                  Every included perspective must be represented. Five total
                  responses, including the owner, are recommended.
                </p>
              </div>
              <span className="w-fit rounded-full bg-[#eef5ff] px-4 py-2 text-sm font-extrabold text-[#1267c4]">
                {dashboard.response_count} participant response
                {dashboard.response_count === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              {perspectiveStatus.map((item) => {
                const label =
                  item.perspective === "owner"
                    ? "Business owner"
                    : item.perspective === "employee"
                      ? "Employee"
                      : "Customer";

                return (
                  <div
                    key={item.perspective}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-[#dfe6f1] p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          item.completed
                            ? "bg-[#e8f8ef] text-[#10a968]"
                            : "bg-[#fff4cf] text-[#8c6500]"
                        }`}
                      >
                        {item.completed ? (
                          <CheckCircle2 size={21} />
                        ) : (
                          <CircleAlert size={21} />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="font-extrabold text-[#07143f]">
                          {label}
                        </p>
                        <p className="text-sm text-[#687ca9]">
                          {item.completed
                            ? "Response completed"
                            : item.progress > 0
                              ? `${item.progress}% answered`
                              : "Waiting for a response"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ${
                        item.completed
                          ? "bg-[#e8f8ef] text-[#087a4d]"
                          : "bg-[#fff4cf] text-[#8c6500]"
                      }`}
                    >
                      {item.completed ? "Complete" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {analysisRequested ? (
                <button
                  type="button"
                  className="btn-primary w-full sm:w-auto"
                  onClick={() => window.location.reload()}
                >
                  Refresh report status
                </button>
              ) : (
                <Link
                  to={
                    ownerCompleted && dashboard.assessment?.id
                      ? `/assessments/${dashboard.assessment.id}/participants`
                      : "/assessments"
                  }
                  className="btn-primary w-full sm:w-auto"
                >
                  {allRequiredPerspectivesComplete
                    ? "Review responses and generate"
                    : ownerCompleted
                      ? "Manage participants"
                    : "Continue owner assessment"}
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </article>
        </section>

        <section className="mt-5 rounded-[22px] border border-dashed border-[#cbd8e9] bg-[#f8faff] p-6 text-center sm:p-8">
          <Sparkles className="mx-auto text-[#1379f4]" size={28} />
          <h2 className="mt-3 text-xl font-black text-[#07143f]">
            Your diagnosis will appear here
          </h2>
          <p className="mx-auto mt-2 max-w-2xl leading-7 text-[#687ca9]">
            Business health scores, perspective gaps, recommendations and
            Growth Advisor guidance will unlock after the required responses
            are analysed.
          </p>
        </section>
      </div>
    );
  }



  const healthScore = dashboard.health_score;



  const health = getHealthLabel(healthScore);



  const strongestArea = getStrongestArea(

    dashboard.area_scores,

  );



  const largestGapTitle =

    dashboard.largest_gap

      ? formatLabel(

          dashboard.largest_gap.metric_key,

        )

      : "No measured gap yet";



  const largestGapPoints =

    dashboard.largest_gap

      ? Math.round(

          dashboard.largest_gap.gap_score * 20,

        )

      : 0;



  const displayedActions =

    dashboard.action_summary.items.length > 0

      ? dashboard.action_summary.items.map(

          (action) => ({

            id: action.id,

            title: action.title,

            status: action.status,

          }),

        )

      : (

          dashboard.analysis?.recommendations ?? []

        )

          .slice(0, 3)

          .map((recommendation, index) => ({

            id: `recommendation-${index}`,

            title: recommendation.title,

            status: "not_started" as const,

          }));



  return (

    <div className="mx-auto max-w-[1450px]">

      {/* Mobile and tablet heading */}

      <header className="xl:hidden">

        <h1 className="text-4xl font-black tracking-[-0.045em] text-[#07143f] sm:text-5xl">

          Dashboard

        </h1>



        <p className="mt-2 text-base text-[#48639e] sm:text-lg">

          See what your business is telling you—and

          where to focus next.

        </p>

      </header>



      {/* Desktop heading */}

      <header className="hidden xl:block">

        <h1 className="text-[2.8rem] font-black leading-none tracking-[-0.045em] text-[#07143f]">

          Business Diagnosis

        </h1>



        <div className="mt-3 flex flex-wrap items-center gap-4">

          <strong className="text-xl text-[#07143f]">

            {dashboard.business_name ??

              "Your business"}

          </strong>



          <span

            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${

              isCompleted

                ? "bg-[#e6f8e7] text-[#168236]"

                : "bg-[#fff4cf] text-[#8c6500]"

            }`}

          >

            {isCompleted ? (

              <CheckCircle2 size={17} />

            ) : (

              <CircleAlert size={17} />

            )}



            {isCompleted

              ? "Assessment complete"

              : "Assessment in progress"}

          </span>



          <span className="h-7 w-px bg-[#d9e1ed]" />



          <span className="text-sm font-semibold text-[#31528c]">

            Perspectives: {perspectivesLabel}

          </span>

        </div>

      </header>



      {/* Mobile and tablet snapshot */}

      <section className="mt-6 rounded-[22px] border border-[#dce5f1] bg-white p-5 shadow-[0_12px_36px_rgba(7,20,63,.05)] sm:p-7 xl:hidden">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

          <div>

            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#244a92]">

              Latest business check-in

            </p>



            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#07143f] sm:text-3xl">

              Your latest business snapshot

            </h2>



            <p className="mt-1 text-sm text-[#7382aa]">

              Updated{" "}

              {formatDate(

                dashboard.assessment?.completed_at,

              )}

            </p>

          </div>



          <span

            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold ${

              isCompleted

                ? "bg-[#e8f8e9] text-[#168236]"

                : "bg-[#fff4cf] text-[#8c6500]"

            }`}

          >

            {isCompleted ? (

              <CheckCircle2 size={18} />

            ) : (

              <CircleAlert size={18} />

            )}



            {isCompleted

              ? "Report ready"

              : "Assessment in progress"}

          </span>

        </div>



        <div className="mt-6 grid gap-5 sm:grid-cols-[auto_1px_1fr] sm:items-center">

          <div className="flex items-end">

            <strong className="text-[4.7rem] font-black leading-none tracking-[-0.06em] text-[#07143f]">

              {healthScore}

            </strong>



            <span className="mb-1 ml-2 text-3xl font-semibold text-[#6780b7]">

              /100

            </span>

          </div>



          <div className="hidden h-24 bg-[#d8e1ef] sm:block" />



          <div>

            <p className="text-sm font-semibold text-[#26375e]">

              {isCompleted

                ? "Business clarity score"

                : "Assessment completion"}

            </p>



            <span

              className={`mt-3 inline-flex rounded-full px-7 py-2 text-lg font-extrabold ${health.background} ${health.color}`}

            >

              {isCompleted

                ? health.label

                : `${dashboard.overall_progress}% complete`}

            </span>

          </div>

        </div>



        <p className="mt-5 max-w-4xl text-base leading-7 text-[#48639e] sm:text-lg">

          {dashboard.analysis?.overall_summary ??

            (isCompleted

              ? "Your report is ready. Review your strongest areas, perspective gaps and practical next steps."

              : "Complete the remaining perspectives to generate your full business diagnosis.")}

        </p>



        <Link

          to={

            isCompleted

              ? "/reports"

              : "/assessments"

          }

          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1768ef] px-5 py-3 font-extrabold text-[#125ed8] transition hover:bg-[#eef5ff]"

        >

          {isCompleted

            ? "View full report"

            : "Continue assessment"}



          <ArrowRight size={19} />

        </Link>

      </section>



      {/* Approved desktop score row */}

      <section className="mt-5 hidden gap-3 xl:grid xl:grid-cols-[1.55fr_repeat(4,minmax(0,1fr))]">

        <article className="rounded-[18px] border border-[#dce5f1] bg-white p-5 shadow-[0_8px_24px_rgba(7,20,63,.05)]">

          <h2 className="text-lg font-black text-[#07143f]">

            Business Health

          </h2>



          <div className="mt-5 flex items-center justify-between gap-4">

            <div className="flex items-end">

              <strong className="text-[4.2rem] font-black leading-none tracking-[-0.065em] text-[#07143f]">

                {healthScore}

              </strong>



              <span className="mb-1 ml-1 text-2xl font-semibold text-[#8293ba]">

                /100

              </span>

            </div>



            <div

              className="relative flex h-[112px] w-[112px] shrink-0 items-center justify-center rounded-full"

              style={{

                background: `conic-gradient(

                  #ff5d49 0deg,

                  #ff5d49 ${healthScore * 3.6}deg,

                  #e8edf5 ${healthScore * 3.6}deg,

                  #e8edf5 360deg

                )`,

              }}

            >

              <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full bg-white px-3 text-center text-[11px] font-extrabold leading-4 text-[#16366f]">

                {health.description}

              </div>

            </div>

          </div>

        </article>



        {dashboard.area_scores.map(

          (areaScore) => {

            const style =

              areaStyles[

                areaScore.business_area

              ];



            const Icon = style.icon;



            return (

              <article

                key={areaScore.business_area}

                className="rounded-[18px] border border-[#dce5f1] bg-white p-4 shadow-[0_8px_24px_rgba(7,20,63,.05)]"

              >

                <div className="flex items-center gap-3">

                  <span

                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${style.iconBackground} ${style.iconColor}`}

                  >

                    <Icon size={22} />

                  </span>



                  <h3 className="text-sm font-black leading-5 text-[#07143f]">

                    {style.label}

                  </h3>

                </div>



                <div className="mt-6 flex items-end">

                  <strong

                    className={`text-[3.4rem] font-black leading-none tracking-[-0.055em] ${style.valueColor}`}

                  >

                    {

                      areaScore.combined_score_100

                    }

                  </strong>



                  <span className="mb-1 ml-1 text-xl font-semibold text-[#8293ba]">

                    /100

                  </span>

                </div>



                <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#edf1f7]">

                  <div

                    className={`h-full rounded-full ${style.barColor}`}

                    style={{

                      width: `${Math.min(

                        areaScore.combined_score_100,

                        100,

                      )}%`,

                    }}

                  />

                </div>

              </article>

            );

          },

        )}

      </section>



      {/* Mobile business-area cards */}

      {dashboard.area_scores.length > 0 && (

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:hidden">

          {dashboard.area_scores.map(

            (areaScore) => {

              const style =

                areaStyles[

                  areaScore.business_area

                ];



              const Icon = style.icon;



              const badge = getAreaBadge(

                areaScore,

                strongestArea,

                dashboard.largest_gap,

              );



              return (

                <article

                  key={areaScore.business_area}

                  className="rounded-[20px] border border-[#dce5f1] bg-white p-5 shadow-[0_10px_30px_rgba(7,20,63,.04)]"

                >

                  <div className="flex items-start gap-4">

                    <span

                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${style.iconBackground} ${style.iconColor}`}

                    >

                      <Icon size={24} />

                    </span>



                    <div className="min-w-0 flex-1">

                      <h3 className="font-extrabold text-[#07143f]">

                        {style.label}

                      </h3>



                      <div className="mt-2 flex items-end">

                        <strong

                          className={`text-4xl font-black leading-none ${style.valueColor}`}

                        >

                          {

                            areaScore.combined_score_100

                          }

                        </strong>



                        <span className="ml-1 text-lg text-[#6f84b5]">

                          /100

                        </span>

                      </div>



                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e9eef6]">

                        <div

                          className={`h-full rounded-full ${style.barColor}`}

                          style={{

                            width: `${Math.min(

                              areaScore.combined_score_100,

                              100,

                            )}%`,

                          }}

                        />

                      </div>



                      <span

                        className={`mt-3 inline-flex rounded-full px-4 py-1 text-xs font-bold ${style.badgeBackground} ${style.badgeColor}`}

                      >

                        {badge}

                      </span>

                    </div>

                  </div>

                </article>

              );

            },

          )}

        </section>

      )}



      {/* Desktop chart and largest gap */}

      <div className="mt-4 hidden gap-4 xl:grid xl:grid-cols-[1.35fr_.95fr]">

        <DesktopAreaChart

          areaScores={dashboard.area_scores}

          includesEmployees={includesEmployees}

          largestGap={dashboard.largest_gap}

        />



        <aside className="rounded-[18px] border border-[#dce5f1] bg-white p-6 shadow-[0_8px_24px_rgba(7,20,63,.05)]">

          <div className="flex items-center gap-3">

            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffe9e7] text-[#ff5d49]">

              <CircleAlert size={21} />

            </span>



            <h2 className="text-xl font-black text-[#07143f]">

              Largest gap

            </h2>

          </div>



          <h3 className="mt-8 text-2xl font-black leading-8 text-[#07143f]">

            {largestGapTitle} has a{" "}

            <span className="text-[#ff4f45]">

              {largestGapPoints}-point difference

            </span>{" "}

            between perspectives.

          </h3>



          <p className="mt-5 text-sm leading-6 text-[#40547f]">

            {getLargestGapCopy(

              dashboard.largest_gap,

            )}

          </p>



          <Link

            to="/reports"

            className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#ff5d49] px-6 py-3 font-extrabold text-white transition hover:bg-[#e84632]"

          >

            See evidence

            <ArrowRight size={18} />

          </Link>

        </aside>

      </div>



      {/* Mobile largest gap */}

      <section className="mt-5 rounded-[22px] border border-[#dce5f1] bg-white p-5 shadow-[0_10px_30px_rgba(7,20,63,.04)] sm:p-7 xl:hidden">

        <h2 className="text-2xl font-black tracking-[-0.025em] text-[#07143f]">

          Where perspectives differ most

        </h2>



        <p className="mt-1 text-sm leading-6 text-[#6a7ca8]">

          The included perspectives reveal where

          attention is needed.

        </p>



        <div className="mt-5 rounded-2xl border border-[#dce5f1] p-4">

          <h3 className="text-lg font-extrabold text-[#07143f]">

            {largestGapTitle}

          </h3>



          <div className="mt-5 grid gap-4">

            <PerspectiveBar

              label="Owner"

              value={toScore100(

                dashboard.largest_gap

                  ?.owner_score ?? null,

              )}

              color="bg-[#153665]"

            />



            {includesEmployees && (

              <PerspectiveBar

                label="Employees"

                value={toScore100(

                  dashboard.largest_gap

                    ?.employee_score ?? null,

                )}

                color="bg-[#61c875]"

              />

            )}



            <PerspectiveBar

              label="Customers"

              value={toScore100(

                dashboard.largest_gap

                  ?.customer_score ?? null,

              )}

              color="bg-[#ff6154]"

            />

          </div>



          <div className="mt-5 rounded-xl bg-[#fff2ef] p-4">

            <p className="text-xl font-black text-[#ef4037]">

              {largestGapPoints}-point gap

            </p>



            <p className="mt-2 text-sm leading-6 text-[#40547f]">

              {getLargestGapCopy(

                dashboard.largest_gap,

              )}

            </p>

          </div>

        </div>



        <Link

          to="/reports"

          className="mt-5 inline-flex items-center gap-2 font-extrabold text-[#1266e8]"

        >

          Explore the evidence

          <ArrowRight size={18} />

        </Link>

      </section>



      {/* Actions and Growth Advisor */}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.95fr]">

        <section className="rounded-[18px] border border-[#dce5f1] bg-white p-5 shadow-[0_8px_24px_rgba(7,20,63,.05)]">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div className="flex items-center gap-3">

              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f8e9] text-[#168236]">

                <ClipboardCheck size={22} />

              </span>



              <div>

                <h2 className="text-xl font-black text-[#07143f]">

                  Recommended Actions

                </h2>



                <p className="text-sm text-[#6a7ca8]">

                  Focused actions to close the biggest

                  gaps and build momentum.

                </p>

              </div>

            </div>



            <div className="flex min-w-[175px] items-center gap-3">

              <strong className="text-[#1266e8]">

                {dashboard.action_summary.progress}%

              </strong>



              <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#e7edf6]">

                <div

                  className="h-full rounded-full bg-[#347ff0]"

                  style={{

                    width: `${dashboard.action_summary.progress}%`,

                  }}

                />

              </div>

            </div>

          </div>



          <div className="mt-5 overflow-hidden rounded-xl border border-[#dce5f1]">

            {displayedActions.length === 0 ? (

              <p className="p-5 text-sm text-[#66729b]">

                Your priority actions will appear after

                your report is generated.

              </p>

            ) : (

              displayedActions.map(

                (action, index) => (

                  <div

                    key={action.id}

                    className="flex items-center gap-3 border-b border-[#e8edf4] px-4 py-3 last:border-b-0"

                  >

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f8e9] text-sm font-black text-[#153665]">

                      {index + 1}

                    </span>



                    <p className="min-w-0 flex-1 text-sm font-semibold text-[#26375e]">

                      {action.title}

                    </p>



                    <span className="hidden rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold capitalize text-[#315ca7] sm:inline-flex">

                      {action.status.replace(

                        "_",

                        " ",

                      )}

                    </span>



                    <Link

 to={

  action.id.startsWith("recommendation-")

    ? "/actions"

    : `/actions?action=${encodeURIComponent(

        action.id,

      )}`

}

  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#1266e8] transition hover:bg-[#eef5ff]"

  aria-label={`Open action: ${action.title}`}

  title="Open this action"

>

  <ArrowRight size={17} />

</Link>

                  </div>

                ),

              )

            )}

          </div>



          <Link

            to="/actions"

            className="mt-4 inline-flex items-center gap-2 font-extrabold text-[#1266e8] xl:hidden"

          >

            View action plan

            <ArrowRight size={18} />

          </Link>

        </section>



        <aside className="rounded-[18px] border border-[#dce5f1] bg-[linear-gradient(135deg,#f7fbff_0%,#eef7ff_100%)] p-5 shadow-[0_8px_24px_rgba(7,20,63,.05)]">

          <div className="flex items-center gap-3">

            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f4ff] text-[#16366f]">

              <Sparkles size={22} />

            </span>



            <div>

              <h2 className="text-xl font-black text-[#07143f]">

                Growth Advisor

              </h2>



              <p className="text-sm text-[#6a7ca8]">

                Ask about your diagnosis.

              </p>

            </div>

          </div>



          <div className="mt-5 rounded-2xl bg-[#e5f0ff] p-4 text-sm leading-6 text-[#213e78]">

            <div className="flex gap-3">

              <MessageCircle

                size={20}

                className="mt-1 shrink-0 text-[#1379f4]"

              />



              <p>

                I’ve reviewed your diagnosis. Ask me

                what to focus on first.

              </p>

            </div>

          </div>



          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">

            <Link

              to="/advisor"

              className="rounded-xl border border-[#8bbcff] bg-white px-4 py-3 text-center text-sm font-bold text-[#1266e8]"

            >

              Explain this gap

            </Link>



            <Link

              to="/advisor"

              className="rounded-xl border border-[#8bbcff] bg-white px-4 py-3 text-center text-sm font-bold text-[#1266e8]"

            >

              What should we fix first?

            </Link>

          </div>





          <Link

            to="/advisor"

            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#102d59] px-4 py-3 font-extrabold text-white"

          >

            Open Growth Advisor

            <ArrowRight size={18} />

          </Link>

        </aside>

      </div>

    </div>

  );

}
