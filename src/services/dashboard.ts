import { supabase } from "../lib/supabase";

export type BusinessArea =
  | "people"
  | "operations"
  | "customer"
  | "digital";

export type PerspectiveType =
  | "owner_customer"
  | "owner_employee_customer";

export type PerspectiveProgress = {
  perspective: "owner" | "customer" | "employee";
  invited_participants: number;
  completed_participants: number;
  submitted_answers: number;
  question_count: number;
  progress: number;
};

export type LargestGap = {
  metric_key: string;
  business_area: BusinessArea;
  gap_score: number;
  combined_score: number;
  owner_score: number | null;
  customer_score: number | null;
  employee_score: number | null;
  priority_level: "high" | "medium" | "low";
};

export type DashboardAreaScore = {
  business_area: BusinessArea;

  owner_score: number | null;
  customer_score: number | null;
  employee_score: number | null;
  combined_score: number;
  gap_score: number;
  priority_level: "high" | "medium" | "low";

  owner_score_100: number | null;
  customer_score_100: number | null;
  employee_score_100: number | null;
  combined_score_100: number;
  gap_score_100: number;
};

export type DashboardActionItem = {
  id: string;
  title: string;
  business_area: BusinessArea;
  status: "not_started" | "in_progress" | "completed";
  timeframe: "7 days" | "14 days" | "30 days";
  effort: "low" | "medium" | "high";
  target_date: string | null;
};

export type DashboardActionSummary = {
  total: number;
  not_started: number;
  in_progress: number;
  completed: number;
  progress: number;
  items: DashboardActionItem[];
};

type DashboardSnapshotExtras = {
  health_score: number;
  area_scores: DashboardAreaScore[];
  action_summary: DashboardActionSummary;
};

export type AnalysisStrength = {
  area: BusinessArea;
  title: string;
  evidence: string;
};

export type AnalysisGap = {
  area: BusinessArea;
  title: string;
  evidence: string;
  why_it_matters: string;
};

export type AnalysisRecommendation = {
  area: BusinessArea;
  title: string;
  action: string;
  timeframe: "7 days" | "14 days" | "30 days";
  effort: "low" | "medium" | "high";
  reason: string;
};

export type DashboardAnalysis = {
  status: string;
  overall_summary: string | null;
  strongest_area: BusinessArea | null;
  priority_area: BusinessArea | null;
  strengths: AnalysisStrength[];
  priority_gaps: AnalysisGap[];
  recommendations: AnalysisRecommendation[];
  generated_at: string | null;
};

export type DashboardOverview = {
  has_assessment: boolean;
  business_name: string | null;

  assessment?: {
    id: string;
    status: string;
    perspective_type: PerspectiveType;
    completed_at: string | null;
  };

  overall_progress: number;
  response_count: number;

  response_breakdown: {
    customer: number;
    employee: number;
  };

  perspective_progress: PerspectiveProgress[];
  largest_gap: LargestGap | null;
  analysis: DashboardAnalysis | null;

    health_score: number;
  area_scores: DashboardAreaScore[];
  action_summary: DashboardActionSummary;
};

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { data, error } = await supabase.rpc(
    "get_dashboard_overview",
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No dashboard data was returned.");
  }

  const overview = data as Omit<
    DashboardOverview,
    "health_score" | "area_scores" | "action_summary"
  >;

  const emptyExtras: DashboardSnapshotExtras = {
    health_score: 0,
    area_scores: [],
    action_summary: {
      total: 0,
      not_started: 0,
      in_progress: 0,
      completed: 0,
      progress: 0,
      items: [],
    },
  };

  if (!overview.has_assessment || !overview.assessment?.id) {
    return {
      ...overview,
      ...emptyExtras,
    };
  }

  const {
    data: extrasData,
    error: extrasError,
  } = await supabase.rpc(
    "get_dashboard_snapshot_extras",
    {
      p_assessment_id: overview.assessment.id,
    },
  );

  if (extrasError) {
    throw extrasError;
  }

  const extras =
    (extrasData as DashboardSnapshotExtras | null) ??
    emptyExtras;

  return {
    ...overview,
    ...extras,
  };
}