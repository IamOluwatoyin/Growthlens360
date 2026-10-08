import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type BusinessProfile = {
  id: string;
  business_name: string;
  industry: string;
  team_size: string;
  perspective_type:
    | "owner_customer"
    | "owner_employee_customer";
  onboarding_completed: boolean;
};

export function useBusinessProfile() {
  const [profile, setProfile] = useState<BusinessProfile | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const { data, error: profileError } = await supabase
        .from("business_profiles")
        .select(
          "id, business_name, industry, team_size, perspective_type, onboarding_completed",
        )
        .maybeSingle();

      if (!isMounted) return;

      if (profileError) {
        setError(profileError.message);
      } else {
        setProfile(data);
      }

      setIsLoading(false);
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    profile,
    isLoading,
    error,
  };
}