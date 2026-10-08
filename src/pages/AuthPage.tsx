import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { setRememberPreference, supabase } from "../lib/supabase";

type Mode = "login" | "signup" | "forgot" | "reset" | "success";

type AuthFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
};

const details: Record<Mode, { title: string; copy: string }> = {
  login: {
    title: "Log in to GrowthLens",
    copy: "Continue where you left off.",
  },
  signup: {
    title: "Create your account",
    copy: "Start with your details. Your business setup comes next.",
  },
  forgot: {
    title: "Reset your password",
    copy: "Enter the email address associated with your GrowthLens account.",
  },
  reset: {
    title: "Set a new password",
    copy: "Choose a secure password you haven’t used before.",
  },
  success: {
    title: "Password reset successful",
    copy: "Your password has been updated. You can now log in with your new password.",
  },
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function AuthPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { title, copy } = details[mode];
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

const {
  register,
  handleSubmit,
  getValues,
  control,
  setError,
  clearErrors,
  formState: { errors, isSubmitting },
} = useForm<AuthFormValues>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
    },
  });

  const password = useWatch({ control, name: "password", defaultValue: "" });
  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /\d/.test(password) },
  ];
const submit = async (values: AuthFormValues) => {
  clearErrors("root");
  setFormMessage(null);

  if (mode === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      setError("root", {
        type: "server",
        message: error.message,
      });
      return;
    }

    if (data.session) {
      navigate("/onboarding");
      return;
    }

    setFormMessage(
      "Account created. Check your email and confirm your address to continue.",
    );
    return;
  }

  if (mode === "login") {
    setRememberPreference(values.rememberMe);
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) {
    setError("root", {
      type: "server",
      message: error.message,
    });
    return;
  }

 const { data: businessProfile, error: profileError } =
  await supabase
    .from("business_profiles")
    .select("onboarding_completed")
    .maybeSingle();

if (profileError) {
  setError("root", {
    type: "server",
    message: "Unable to load your business profile.",
  });
  return;
}

navigate(
  businessProfile?.onboarding_completed
    ? "/dashboard"
    : "/onboarding",
);

return;
}

  if (mode === "forgot") {
  const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    setError("root", {
      type: "server",
      message: error.message,
    });
    return;
  }

  setFormMessage(
    "Password reset link sent. Please check your email.",
  );
  return;
}

  if (mode === "reset") {
  const { error } = await supabase.auth.updateUser({
    password: values.password,
  });

  if (error) {
    setError("root", {
      type: "server",
      message: error.message,
    });
    return;
  }

  navigate("/reset-success");
}

};

  const errorClass = (hasError: boolean) =>
    hasError ? "!border-[#d92d20] focus:!border-[#d92d20]" : "";

  return (
    <>
      {mode === "signup" && (
        <p className="mb-3 hidden text-sm font-extrabold uppercase tracking-[.24em] text-[#5f6e8c] lg:block">
          Get started
        </p>
      )}

      {mode === "login" && (
        <p className="mb-3 hidden text-sm font-extrabold uppercase tracking-[.24em] text-[#5f6e8c] lg:block">
          Welcome back
        </p>
      )}

      {mode === "forgot" && (
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[.24em] text-[#6374a0]">
          Forgot password
        </p>
      )}

      {mode === "reset" && (
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[.24em] text-[#6374a0]">
          Create new password
        </p>
      )}

      {mode !== "success" && (
        <>
          <h1 className="text-3xl font-black tracking-[-.03em] text-[#071a45] sm:text-[2.6rem] sm:leading-tight">
            {title}
          </h1>

          <p className="mt-3 text-base leading-7 text-[#66728d] sm:text-lg">
            {copy}
          </p>
        </>
      )}

      {mode === "success" ? (
        <div className="text-center">
          <SuccessMark />

          <p className="mt-7 text-sm font-extrabold uppercase tracking-[.24em] text-[#6374a0]">
            Password updated
          </p>

          <h1 className="mt-4 text-3xl font-black tracking-[-.03em] text-[#071a45] sm:text-[2.6rem] sm:leading-tight">
            {title}
          </h1>

          <p className="mx-auto mt-4 max-w-[540px] text-base leading-7 text-[#66728d] sm:text-lg">
            {copy}
          </p>

          <Link to="/login" className="btn-primary mt-7 h-[58px] w-full text-lg">
            <span className="lg:hidden">Log in</span>
            <span className="hidden lg:inline">Continue to log in</span>
          </Link>

          <div className="mt-7 flex items-center justify-center gap-3 border-t border-[#d8dde6] pt-6 text-sm text-[#6c7892]">
            <ShieldCheck size={23} className="text-[#6374a0]" />
            <span>Your business data stays private and secure.</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(submit)} className="mt-6 grid gap-4" noValidate>
          {mode === "signup" && (
            <div className="grid gap-2">
              <label htmlFor="fullName" className="text-sm font-extrabold text-[#07143f]">
                Full name
              </label>
              <input
                id="fullName"
                className={`field h-[54px] ${errorClass(Boolean(errors.fullName))}`}
                placeholder="Your full name"
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                {...register("fullName", {
                  required: "Please enter your full name.",
                  minLength: {
                    value: 2,
                    message: "Your name must contain at least 2 characters.",
                  },
                })}
              />
              {errors.fullName && (
                <p className="text-xs font-semibold text-[#d92d20]" role="alert">
                  {errors.fullName.message}
                </p>
              )}
            </div>
          )}

          {mode !== "reset" && (
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-extrabold text-[#07143f]">
                Email address
              </label>
              <input
                id="email"
                className={`field h-[54px] ${errorClass(Boolean(errors.email))}`}
                type="email"
                placeholder={
                  mode === "login" || mode === "signup" || mode === "forgot"
                    ? "you@company.com"
                    : "you@business.com"
                }
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                {...register("email", {
                  required: "Please enter your email address.",
                  pattern: {
                    value: emailPattern,
                    message: "Please enter a valid email address.",
                  },
                })}
              />
              {errors.email && (
                <p className="text-xs font-semibold text-[#d92d20]" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}

          {(mode === "login" || mode === "signup" || mode === "reset") && (
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-extrabold text-[#07143f]">
                {mode === "reset" ? "New password" : "Password"}
              </label>
              <div className="relative">
                <input
                  id="password"
                  className={`field h-[54px] pr-12 ${errorClass(Boolean(errors.password))}`}
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    mode === "login"
                      ? "Enter your password"
                      : mode === "signup"
                        ? "Choose a password"
                        : "Enter new password"
                  }
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  aria-invalid={Boolean(errors.password)}
                  {...register("password", {
                    required: "Please enter your password.",
                    ...(mode !== "login" && {
                      pattern: {
                        value: strongPasswordPattern,
                        message:
                          "Use at least 8 characters with uppercase, lowercase and a number.",
                      },
                    }),
                  })}
                />

             <button
  type="button"
  onClick={() => setShowPassword((visible) => !visible)}
  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52617e]"
  aria-label={showPassword ? "Hide password" : "Show password"}
>
  {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
</button>

              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-[#d92d20]" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {(mode === "signup" || mode === "reset") && (
            <div className="grid gap-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-extrabold text-[#07143f]"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  className={`field h-[54px] pr-12 ${errorClass(Boolean(errors.confirmPassword))}`}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={
                    mode === "signup"
                      ? "Confirm your password"
                      : "Re-enter new password"
                  }
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  {...register("confirmPassword", {
                    required: "Please confirm your password.",
                    validate: (value) =>
                      value === getValues("password") || "The passwords do not match.",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52617e]"
                  aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                >
                  {showConfirmPassword ? <EyeOff size={21} /> : <Eye size={21} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-semibold text-[#d92d20]" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

          {mode === "reset" && (
            <div className="rounded-xl bg-[#f1f5fa] px-5 py-4 text-sm text-[#6374a0]">
              <p className="font-extrabold">Your password must include:</p>
              <ul className="mt-3 grid gap-2">
                {passwordRequirements.map(({ label, met }) => (
                  <li key={label} className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        met
                          ? "border-[#86bf19] bg-[#86bf19] text-white"
                          : "border-[#6f82ad] bg-white text-transparent"
                      }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mode === "login" && (
            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2.5 font-semibold text-[#07143f]">
                <input
                  type="checkbox"
                  className="h-5 w-5 shrink-0 cursor-pointer appearance-auto rounded border-2 border-[#68789d] bg-white accent-[#1379f4]"
                  {...register("rememberMe")}
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="font-bold text-[#1379f4] underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>
          )}

         {errors.root?.message && (
  <p
    className="rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#b42318]"
    role="alert"
  >
    {errors.root.message}
  </p>
)}

{formMessage && (
  <p
    className="rounded-xl bg-[#e8f8ef] px-4 py-3 text-sm font-semibold text-[#087a4d]"
    role="status"
  >
    {formMessage}
  </p>
)}

<button
  className="btn-primary mt-2 h-[58px] w-full text-lg disabled:cursor-not-allowed disabled:opacity-60"
  type="submit"
  disabled={isSubmitting || Boolean(formMessage)}
>
  {isSubmitting && mode === "signup" ? (
    "Creating account..."
  ) : formMessage && mode === "signup" ? (
    "Confirmation email sent"
  ) : mode === "login" ? (
    "Log in"
  ) : mode === "signup" ? (
    "Create account"
  ) : mode === "forgot" ? (
    "Send reset link"
  ) : (
    <>
      <span className="lg:hidden">Update password</span>
      <span className="hidden lg:inline">Reset password</span>
    </>
  )}
</button>
        </form>
      )}

      {mode !== "success" && (
        <div
          className={`mt-6 text-center text-sm text-[#4f5f7e] ${
            mode === "signup" ||
            mode === "login" ||
            mode === "forgot" ||
            mode === "reset"
              ? "border-t border-[#d8dde6] pt-5"
              : ""
          }`}
        >
          {mode === "login" ? (
            <>
              New to GrowthLens?{" "}
              <Link
                className="font-bold text-[#1379f4] underline underline-offset-2"
                to="/signup"
              >
                Create an account
              </Link>
            </>
          ) : mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link
                className="font-bold text-[#1266e8] lg:text-[#ff5d49]"
                to="/login"
              >
                Log in
              </Link>
            </>
          ) : (
            <Link
              className="inline-flex items-center justify-center gap-2 font-bold text-[#1379f4]"
              to="/login"
            >
              <ArrowLeft size={19} strokeWidth={2.4} />
              Back to log in
            </Link>
          )}
        </div>
      )}

      {(mode === "signup" ||
        mode === "login" ||
        mode === "forgot" ||
        mode === "reset") && (
        <div className="mt-7 flex items-center justify-center gap-3 text-center text-sm text-[#6c7892]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e6f3ff] lg:h-auto lg:w-auto lg:bg-transparent">
            <ShieldCheck
              size={22}
              className={
                mode === "login" || mode === "forgot" || mode === "reset"
                  ? "text-[#1379f4] lg:text-[#7d8ba6]"
                  : "text-[#1379f4] lg:text-[#8fd128]"
              }
            />
          </span>
          <span>Your business data stays private and secure.</span>
        </div>
      )}
    </>
  );
}

function SuccessMark() {
  return (
    <>
      <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-[#effbd9] lg:hidden">
        <div className="relative h-24 w-24 rounded-full border-[4px] border-[#071a45]">
          <div className="absolute inset-[17px] rounded-full border-[3px] border-[#071a45]" />
          <span className="absolute -left-2 top-10 h-4 w-4 rounded-full bg-[#ff674f]" />
          <span className="absolute right-0 top-0 h-4 w-4 rounded-full bg-[#86bf19]" />
          <span className="absolute bottom-0 right-6 h-4 w-4 rounded-full bg-[#071a45]" />
          <span className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#86bf19]" />
        </div>

        <span className="absolute bottom-5 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#86bf19] text-white shadow-[0_10px_24px_rgba(97,143,11,.24)]">
          <Check size={32} strokeWidth={3.2} />
        </span>
      </div>

      <div className="mx-auto hidden h-40 w-40 items-center justify-center rounded-full bg-[#effbd9] lg:flex">
        <CheckCircle2 size={92} strokeWidth={2.8} className="text-[#86bf19]" />
      </div>
    </>
  );
}
