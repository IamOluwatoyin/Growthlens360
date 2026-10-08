import {
  Bell,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  getUserSettings,
  updateUserSettings,
  type UserSettings,
} from "../services/settings";

export function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<UserSettings>({
    defaultValues: {
      assessment_response_updates: true,
      weekly_progress_summary: true,
      recommendation_reminders: false,
    },
  });

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const savedSettings = await getUserSettings();

        if (isMounted) {
          reset(savedSettings);
        }
      } catch (error) {
        if (isMounted) {
          setPageError(
            error instanceof Error
              ? error.message
              : "Unable to load your settings.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [reset]);

  const submitSettings = async (values: UserSettings) => {
    setPageError(null);
    setSuccessMessage(null);

    try {
      const updatedSettings = await updateUserSettings(values);

      reset(updatedSettings);
      setSuccessMessage("Your notification settings have been saved.");
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to save your settings.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle
          size={36}
          className="animate-spin text-[#1379f4]"
          aria-label="Loading settings"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <span className="eyebrow">Settings</span>

      <h1 className="mt-2 text-3xl font-black tracking-tight text-[#07143f] sm:text-4xl">
        Account and notifications
      </h1>

      <p className="mt-2 max-w-2xl leading-7 text-[#66729b]">
        Choose which GrowthLens updates you want to receive. You can
        change these preferences at any time.
      </p>

      {pageError && (
        <p
          className="mt-6 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#b42318]"
          role="alert"
        >
          {pageError}
        </p>
      )}

      {successMessage && (
        <div
          className="mt-6 flex items-center gap-3 rounded-xl bg-[#e8f8ef] px-4 py-3 text-sm font-semibold text-[#087a4d]"
          role="status"
        >
          <CheckCircle2 size={19} />
          {successMessage}
        </div>
      )}

      <form
        className="mt-8 grid gap-6"
        onSubmit={handleSubmit(submitSettings)}
      >
        <section className="card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf5ff] text-[#1379f4]">
              <Bell size={22} />
            </span>

            <div>
              <h2 className="text-xl font-extrabold text-[#07143f]">
                Notifications
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#66729b]">
                Decide which updates GrowthLens should send to your
                email.
              </p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-[#e4e9f2]">
            <label className="flex cursor-pointer items-start justify-between gap-5 py-5 first:pt-0">
              <span>
                <span className="block font-extrabold text-[#07143f]">
                  Assessment response updates
                </span>

                <span className="mt-1 block max-w-xl text-sm leading-6 text-[#66729b]">
                  Receive an email when a customer or employee
                  completes their assessment.
                </span>
              </span>

              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 accent-[#1379f4]"
                {...register("assessment_response_updates")}
              />
            </label>

            <label className="flex cursor-pointer items-start justify-between gap-5 py-5">
              <span>
                <span className="block font-extrabold text-[#07143f]">
                  Weekly progress summary
                </span>

                <span className="mt-1 block max-w-xl text-sm leading-6 text-[#66729b]">
                  Receive a short summary of assessment and action-plan
                  progress.
                </span>
              </span>

              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 accent-[#1379f4]"
                {...register("weekly_progress_summary")}
              />
            </label>

            <label className="flex cursor-pointer items-start justify-between gap-5 py-5 last:pb-0">
              <span>
                <span className="block font-extrabold text-[#07143f]">
                  Recommendation reminders
                </span>

                <span className="mt-1 block max-w-xl text-sm leading-6 text-[#66729b]">
                  Receive reminders about actions that are still not
                  started or in progress.
                </span>
              </span>

              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 accent-[#1379f4]"
                {...register("recommendation_reminders")}
              />
            </label>
          </div>
        </section>

        <section className="card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f8ef] text-[#10a968]">
              <LockKeyhole size={22} />
            </span>

            <div>
              <h2 className="text-xl font-extrabold text-[#07143f]">
                Privacy and data
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66729b]">
                Assessment links are private. Participants only access
                the assessment assigned to their unique link, while
                business reports remain available only to the logged-in
                owner.
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary min-w-[180px] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}