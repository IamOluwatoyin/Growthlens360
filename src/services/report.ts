import { supabase } from "../lib/supabase";

export type ReportAreaScore = {
  business_area: string;
  owner_score: number | null;
  customer_score: number | null;
  employee_score: number | null;
  combined_score: number;
  gap_score: number;
  priority_level: "high" | "medium" | "low";
};

export type ReportMetricScore = {
  metric_key: string;
  business_area: string;
  owner_score: number | null;
  customer_score: number | null;
  employee_score: number | null;
  combined_score: number;
  gap_score: number;
  priority_level: "high" | "medium" | "low";
};

export type ReportStrength = {
  area: string;
  title: string;
  evidence: string;
};

export type ReportPriorityGap = {
  area: string;
  title: string;
  evidence: string;
  why_it_matters: string;
};

export type ReportAnalysis = {
  status: string;
  overall_summary: string | null;
  strongest_area: string | null;
  priority_area: string | null;
  strengths: ReportStrength[];
  priority_gaps: ReportPriorityGap[];
   recommendations: ReportRecommendation[];
  generated_at: string | null;
};

export type AssessmentReport = {
  business: {
    name: string;
    industry: string | null;
    team_size: string | null;
  };
  assessment: {
    id: string;
    title: string;
    status: string;
    perspective_type:
      | "owner_customer"
      | "owner_employee_customer";
    completed_at: string | null;
  };
  response_counts: {
  owner: number;
  employee: number;
  customer: number;
};
  area_scores: ReportAreaScore[];
  metric_scores: ReportMetricScore[];
  analysis: ReportAnalysis | null;
};

export type ReportRecommendation = {
  area: string;
  title: string;
  action: string;
  timeframe: "7 days" | "14 days" | "30 days";
  effort: "low" | "medium" | "high";
  reason: string;
};

export async function getAssessmentReport(): Promise<AssessmentReport | null> {
  const { data, error } = await supabase.rpc(
    "get_assessment_report",
  );

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return data as AssessmentReport;
}