import { supabase } from "../lib/supabase";
import { startOrResumeAssessment } from "./assessments";

export type OnboardingValues = {
  businessName: string;
  industry: string;
  teamSize: string;

  businessType:
    | "products"
    | "services"
    | "both";

  businessStage:
    | "starting"
    | "stabilising"
    | "growing"
    | "established";

  customerChannels: string[];

  digitalConfidence:
    | "beginner"
    | "comfortable"
    | "advanced";

  paymentMethods: string[];
  servesCustomersOffline: boolean;
  locationContext: string;

  assessmentName: string;

  perspectiveType:
    | "owner_customer"
    | "owner_employee_customer";

  
  
};

export async function saveOnboarding(
  values: OnboardingValues,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be logged in to complete onboarding.");
  }

  const { error: profileError } = await supabase
    .from("business_profiles")
    .upsert(
      {
        id: user.id,
        business_name: values.businessName.trim(),
industry: values.industry,
team_size: values.teamSize,

business_type: values.businessType,
business_stage: values.businessStage,
customer_channels: values.customerChannels,
digital_confidence: values.digitalConfidence,
primary_payment_methods: values.paymentMethods,
serves_customers_offline: values.servesCustomersOffline,
location_context: values.locationContext.trim() || "Nigeria",

perspective_type: values.perspectiveType,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    );

  if (profileError) {
    throw profileError;
  }

  const assessmentId = await startOrResumeAssessment({
  assessmentName:
    values.assessmentName?.trim() || "Business Diagnosis",
  perspectiveType: values.perspectiveType,
  startOwner: true,
});

 
return assessmentId;

  //   if (invitationError) {
  //     throw invitationError;
  //   }
  // }

  //   return assessmentId;
}
