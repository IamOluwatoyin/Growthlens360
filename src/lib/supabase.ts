import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase environment variables. Check your .env.local file.",
  );
}

const rememberPreferenceKey = "growthlens-remember-me";

const authStorage = {
  getItem(key: string) {
    return (
      window.localStorage.getItem(key) ??
      window.sessionStorage.getItem(key)
    );
  },

  setItem(key: string, value: string) {
    const remember =
      window.localStorage.getItem(rememberPreferenceKey) === "true";

    const selectedStorage = remember
      ? window.localStorage
      : window.sessionStorage;

    const otherStorage = remember
      ? window.sessionStorage
      : window.localStorage;

    selectedStorage.setItem(key, value);
    otherStorage.removeItem(key);
  },

  removeItem(key: string) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export function setRememberPreference(remember: boolean) {
  window.localStorage.setItem(
    rememberPreferenceKey,
    String(remember),
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: true,
      storage: authStorage,
    },
  },
);