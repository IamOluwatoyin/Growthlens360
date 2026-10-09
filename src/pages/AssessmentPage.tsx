import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  LoaderCircle,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessProfile } from "../hooks/useBusinessProfile";
import { startOrResumeAssessment } from "../services/assessments";
import {
  getDashboardOverview,
  type DashboardOverview,
} from "../services/dashboard";

export function AssessmentsPage() {
  const navigate = useNavigate();
  const { profile, isLoading: isProfileLoading } = useBusinessProfile();

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      try {
        const dashboardOverview = await getDashboardOverview();

        if (isMounted) {
          setOverview(dashboardOverview);
        }
      } catch (overviewError) {
        if (isMounted) {
          setError(
            overviewError instanceof Error
              ? overviewError.message
              : "Unable to load your assessment status.",
          );
        }
      } finally {
        if (isMounted) {
          setIsOverviewLoading(false);
        }
      }
    };

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const assessmentId = await startOrResumeAssessment();
      navigate(`/assessments/${assessmentId}/owner`);
    } catch (assessmentError) {
      setError(
        assessmentError instanceof Error
          ? assessmentError.message
          : "Unable to start your assessment.",
      );
      setIsStarting(false);
    }
  };

  const perspectives =
    profile?.perspective_type === "owner_employee_customer"
      ? "Owner, employee and customer"
      : "Owner and customer";

  const isLoading = isProfileLoading || isOverviewLoading;
  const hasAssessment = overview?.has_assessment === true;
  const assessmentId = overview?.assessment?.id;
  const assessmentStatus = overview?.assessment?.status;
  const analysisReady = overview?.analysis?.status === "completed";
  const reportReady = assessmentStatus === "completed" && analysisReady;
  const analysisPending = assessmentStatus === "ready_for_analysis";

  const ownerProgress = overview?.perspective_progress.find(
    (item) => item.perspective === "owner",
  );

  const ownerCompleted =
    (ownerProgress?.completed_participants ?? 0) > 0 ||
    (ownerProgress?.progress ?? 0) >= 100;

  const buttonLabel = reportReady
    ? "View insight report"
    : ownerCompleted
      ? analysisPending
        ? "View response progress"
        : "Manage participants"
      : hasAssessment
        ? "Continue owner assessment"
        : "Start owner assessment";

  const handlePrimaryAction = () => {
    if (reportReady) {
      navigate("/reports");
      return;
    }

    if (ownerCompleted && assessmentId) {
      navigate(`/assessments/${assessmentId}/participants`);
      return;
    }

    void handleStart();
  };

  const statusCopy = reportReady
    ? "All required perspectives have been completed and analysed. Your insight report and recommended next actions are ready."
    : analysisPending
      ? "Your owner assessment and the required participant responses are complete. GrowthLens is preparing your insight report."
      : ownerCompleted
        ? profile?.perspective_type === "owner_employee_customer"
          ? "Your owner assessment is complete. Invite customers and employees, then track their response progress here."
          : "Your owner assessment is complete. Invite customers, then track their response progress here."
        : "Answer eight short questions covering people, operations, customer experience and digital readiness.";

  return (
    <div className="mx-auto max-w-6xl">
     <div>
       <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#1379f4] transition hover:text-[#0a4fb8]"
      >
        <ArrowLeft size={18} />
        Back to dashboard
      </button>
     </div>

      <span className="eyebrow">Assessments</span>

      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        Collect the perspectives that matter
      </h1>

      <p className="mt-2 max-w-2xl leading-7 text-[#66729b]">
        Complete the owner assessment, then invite customers
        {profile?.perspective_type === "owner_employee_customer"
          ? " and employees"
          : ""}{" "}
        to share their experience.
      </p>

      <section className="card mt-8 overflow-hidden">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                ownerCompleted
                  ? "bg-[#e8f8ef] text-[#10a968]"
                  : "bg-[#eaf5ff] text-[#1379f4]"
              }`}
            >
              {ownerCompleted ? (
                <CheckCircle2 size={28} />
              ) : (
                <ClipboardList size={28} />
              )}
            </span>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold text-[#07143f]">
                Business diagnosis
              </h2>

              {ownerCompleted && (
                <span className="rounded-full bg-[#e8f8ef] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#087a4d]">
                  Owner complete
                </span>
              )}

              {reportReady && (
                <span className="rounded-full bg-[#eaf5ff] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#1379f4]">
                  Report ready
                </span>
              )}
            </div>

            <p className="mt-3 max-w-2xl leading-7 text-[#66729b]">
              {statusCopy}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-[#52617e]">
              <span className="flex items-center gap-3">
                <Users size={19} className="text-[#1379f4]" />
                {isLoading ? "Loading perspectives..." : perspectives}
              </span>

              {hasAssessment && !isLoading && (
                <span>{overview?.overall_progress ?? 0}% complete</span>
              )}

              {ownerCompleted && !isLoading && (
                <span>
                  {overview?.response_count ?? 0} customer/team response
                  {(overview?.response_count ?? 0) === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {reportReady && overview?.analysis && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#eef5ff] p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#52617e]">
                    Strongest area
                  </p>
                  <p className="mt-2 font-extrabold capitalize text-[#07143f]">
                    {overview.analysis.strongest_area ?? "Not available"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fff0ed] p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#52617e]">
                    Priority area
                  </p>
                  <p className="mt-2 font-extrabold capitalize text-[#07143f]">
                    {overview.analysis.priority_area ?? "Not available"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn-primary min-w-[210px] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handlePrimaryAction}
            disabled={isStarting || isLoading}
          >
            {isStarting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                {buttonLabel}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </section>

      {error && (
        <p
          className="mt-5 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#b42318]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
