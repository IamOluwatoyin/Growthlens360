import { supabase } from "../lib/supabase";

export type BusinessProfile = {
  id: string;
  business_name: string;
  industry: string;
  team_size: string;
  business_type: "products" | "services" | "both";
  business_stage: "starting" | "stabilising" | "growing" | "established";
  customer_channels: string[];
  digital_confidence: "beginner" | "comfortable" | "advanced";
  primary_payment_methods: string[];
  serves_customers_offline: boolean;
  location_context: string;
  perspective_type: "owner_customer" | "owner_employee_customer";
  onboarding_completed: boolean;
};

export async function getBusinessProfile(): Promise<BusinessProfile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be logged in to view your business profile.");
  }

  const { data, error } = await supabase
    .from("business_profiles")
    .select(`
      id,
      business_name,
      industry,
      team_size,
      business_type,
      business_stage,
      customer_channels,
      digital_confidence,
      primary_payment_methods,
      serves_customers_offline,
      location_context,
      perspective_type,
      onboarding_completed
    `)
    .eq("id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data as BusinessProfile;
}

export type UpdateBusinessProfileValues = {
  business_name: string;
  industry: string;
  team_size: string;
  business_type: "products" | "services" | "both";
  business_stage:
    | "starting"
    | "stabilising"
    | "growing"
    | "established";
  customer_channels: string[];
  digital_confidence:
    | "beginner"
    | "comfortable"
    | "advanced";
  primary_payment_methods: string[];
  serves_customers_offline: boolean;
  location_context: string;
  perspective_type:
    | "owner_customer"
    | "owner_employee_customer";
};

export async function updateBusinessProfile(
  values: UpdateBusinessProfileValues,
): Promise<BusinessProfile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      "You must be logged in to update your business profile.",
    );
  }

  const { data, error } = await supabase
    .from("business_profiles")
    .update({
      business_name: values.business_name.trim(),
      industry: values.industry,
      team_size: values.team_size,
      business_type: values.business_type,
      business_stage: values.business_stage,
      customer_channels: values.customer_channels,
      digital_confidence: values.digital_confidence,
      primary_payment_methods: values.primary_payment_methods,
      serves_customers_offline: values.serves_customers_offline,
      location_context: values.location_context.trim(),
      perspective_type: values.perspective_type,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select(`
      id,
      business_name,
      industry,
      team_size,
      business_type,
      business_stage,
      customer_channels,
      digital_confidence,
      primary_payment_methods,
      serves_customers_offline,
      location_context,
      perspective_type,
      onboarding_completed
    `)
    .single();

  if (error) {
    throw error;
  }

  return data as BusinessProfile;
}