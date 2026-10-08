import { useEffect, useState } from "react";

import { useForm, useWatch } from "react-hook-form";

import { useNavigate } from "react-router-dom";

import { Logo } from "../components/Logo";

import {

  saveOnboarding,

  type OnboardingValues,

} from "../services/onboarding";

const customerChannelOptions = [

  { value: "walk_in", label: "Walk-in customers" },

  { value: "phone", label: "Phone calls" },

  { value: "whatsapp", label: "WhatsApp" },

  { value: "instagram", label: "Instagram" },

  { value: "facebook", label: "Facebook" },

  { value: "website", label: "Website" },

  { value: "marketplace", label: "Online marketplace" },

  { value: "referral", label: "Referrals" },

  { value: "other", label: "Other" },

];

const paymentMethodOptions = [

  { value: "cash", label: "Cash" },

  { value: "bank_transfer", label: "Bank transfer" },

  { value: "pos", label: "POS/card" },

  { value: "online_payment", label: "Online payment link" },

  { value: "mobile_money", label: "Mobile money" },

];

const ONBOARDING_DRAFT_KEY = "growthlens-onboarding-draft";

const defaultOnboardingValues: OnboardingValues = {
  businessName: "",
  industry: "professional_services",
  teamSize: "solo",
  businessType: "services",
  businessStage: "starting",
  customerChannels: [],
  digitalConfidence: "beginner",
  paymentMethods: [],
  servesCustomersOffline: true,
  locationContext: "Nigeria",
  assessmentName: "",
  perspectiveType: "owner_customer",
};

function loadOnboardingDraft(): {
  step: number;
  values: OnboardingValues;
} {
  try {
    const savedDraft = window.localStorage.getItem(
      ONBOARDING_DRAFT_KEY,
    );

    if (!savedDraft) {
      return {
        step: 1,
        values: defaultOnboardingValues,
      };
    }

    const parsedDraft = JSON.parse(savedDraft) as {
      step?: number;
      values?: Partial<OnboardingValues>;
    };

    return {
      step:
        parsedDraft.step &&
        parsedDraft.step >= 1 &&
        parsedDraft.step <= 3
          ? parsedDraft.step
          : 1,
      values: {
        ...defaultOnboardingValues,
        ...parsedDraft.values,
      },
    };
  } catch {
    return {
      step: 1,
      values: defaultOnboardingValues,
    };
  }
}

 function OnboardingProgress({

  currentStep,

  orientation = "horizontal",

}: {

  currentStep: number;

  orientation?: "horizontal" | "vertical";

}) {

  const steps = [

    {

      number: 1,

      label: "Business details",

    },

    {

      number: 2,

      label: "Assessment setup",

    },

    {

      number: 3,

     label: "Start assessment",

    },

  ];

  if (orientation === "vertical") {

    return (

      <div className="grid gap-1">

        {steps.map((item, index) => {

          const isActive = item.number === currentStep;

          const isCompleted = item.number < currentStep;

          return (

            <div key={item.number}>

              <div className="flex items-center gap-4">

                <span

                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black ${

                    isActive

  ? "border-[#ff5d49] bg-[#ff5d49] text-white"

  : isCompleted

    ? "border-[#8fd128] bg-[#8fd128] text-[#07143f]"

    : "border-white/35 text-white/65"

                  }`}

                >

                  {item.number}

                </span>

                <div>

                  <p

                    className={`text-xs font-bold uppercase tracking-[0.12em] ${

                      isActive

                        ? "text-[#8fd128]"

                        : "text-white/50"

                    }`}

                  >

                    Step {item.number}

                  </p>

                  <p

                    className={`mt-1 font-extrabold ${

                      isActive || isCompleted

                        ? "text-white"

                        : "text-white/60"

                    }`}

                  >

                    {item.label}

                  </p>

                </div>

              </div>

              {index < steps.length - 1 && (

                <div

                  className={`ml-[19px] h-12 w-0.5 ${

                    isCompleted

                      ? "bg-[#8fd128]"

                      : "bg-white/20"

                  }`}

                />

              )}

            </div>

          );

        })}

      </div>

    );

  }

return (

  <div>

    <div className="grid grid-cols-3">

      {steps.map((item, index) => {

        const isActive = item.number === currentStep;

        const isCompleted = item.number < currentStep;

        return (

          <div

            key={item.number}

            className="relative flex min-w-0 flex-col items-center text-center"

          >

            {index > 0 && (

              <div

                className={`absolute right-1/2 top-5 h-0.5 w-full ${

                  item.number <= currentStep

                    ? "bg-[#8fd128]"

                    : "bg-white/25"

                }`}

              />

            )}

            <span

              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black ${

                isActive

                  ? "border-[#ff5d49] bg-[#ff5d49] text-white"

                  : isCompleted

                    ? "border-[#8fd128] bg-[#8fd128] text-[#07143f]"

                    : "border-white/35 bg-[#07143f] text-white/70"

              }`}

            >

              {item.number}

            </span>

            <span

              className={`mt-2 px-1 text-[11px] font-bold leading-4 ${

                isActive || isCompleted

                  ? "text-white"

                  : "text-white/55"

              }`}

            >

              {item.label}

            </span>

          </div>

        );

      })}

    </div>

  </div>

);

}

export function OnboardingPage() {

  const [initialDraft] = useState(loadOnboardingDraft);

  const [step, setStep] = useState(initialDraft.step);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const navigate = useNavigate();

  const {

  register,

  handleSubmit,

  setValue,

  trigger,

  control,

  formState: { errors, isSubmitting },

} = useForm<OnboardingValues>({

    mode: "onBlur",

    defaultValues: initialDraft.values,

  });

  const onboardingValues = useWatch({
    control,
  });

  const perspectiveType = useWatch({

  control,

  name: "perspectiveType",

});

const teamSize = useWatch({

  control,

  name: "teamSize",

});

const servesCustomersOffline = useWatch({

  control,

  name: "servesCustomersOffline",

});

  useEffect(() => {
    window.localStorage.setItem(
      ONBOARDING_DRAFT_KEY,
      JSON.stringify({
        step,
        values: onboardingValues,
      }),
    );
  }, [onboardingValues, step]);

  useEffect(() => {

    if (teamSize === "solo") {

      setValue("perspectiveType", "owner_customer", {

        shouldValidate: true,

      });

    }

  }, [teamSize, setValue]);

  const moveToNextStep = async () => {

  if (step === 1) {

    const isValid = await trigger([

      "businessName",

      "industry",

      "teamSize",

      "businessType",

      "businessStage",

      "customerChannels",

      "digitalConfidence",

      "paymentMethods",

      "servesCustomersOffline",

      "locationContext",

    ]);

    if (!isValid) return;

  }

  if (step === 2) {

    const isValid = await trigger([

      "assessmentName",

      "perspectiveType",

    ]);

    if (!isValid) return;

  }

  setStep((currentStep) =>

    Math.min(3, currentStep + 1),

  );

};

  const submitOnboarding = async (values: OnboardingValues) => {

    setSubmitError(null);

try {

  const assessmentId = await saveOnboarding(values);

  window.localStorage.removeItem(
    ONBOARDING_DRAFT_KEY,
  );

 navigate(

  `/assessments/${assessmentId}/owner`,

);

}catch (error) {

      setSubmitError(

        error instanceof Error

          ? error.message

          : "Unable to save your business profile.",

      );

    }

  };

  const stepContent = {

  1: {

    tag: "Business details",

    title: "Tell us about your business",

    description:

      "Help GrowthLens understand how your business operates so your questions and recommendations fit your reality.",

    heroTitle: (

      <>

        Let's understand{" "}

        <span className="text-[#8fd128]">

          your business.

        </span>

      </>

    ),

    heroDescription:

      "A little context helps GrowthLens ask better questions and deliver more relevant insights.",

  },

  2: {

    tag: "Assessment setup",

    title: "Set up your first assessment",

    description:

      "Choose the perspectives you want to compare. You will complete your owner assessment first and invite other participants afterward.",

    heroTitle: (

      <>

        Choose the{" "}

        <span className="text-[#8fd128]">

          perspectives

        </span>{" "}

        that matter.

      </>

    ),

    heroDescription:

      "GrowthLens works best when you compare how your business is seen from inside and outside.",

  },

  3: {

  tag: "Ready to begin",

  title: "Complete your owner assessment first",

  description:

    "Share your view of the business before inviting customers or employees. This will help you understand what they will be asked and why their perspectives matter.",

  heroTitle: (

    <>

      Start with{" "}

      <span className="text-[#8fd128]">

        your perspective.

      </span>

    </>

  ),

  heroDescription:

    "Complete your own assessment first. Afterward, you can invite others and compare how their experiences differ from yours.",

},

} as const;

const currentStepContent =

  stepContent[step as keyof typeof stepContent];

  return (

  <main className="min-h-screen bg-[#f5f8fd]">

    {/* Mobile header */}

    <header className="border-b border-[#dfe6f1] bg-white lg:hidden">

     <div className="flex h-20 items-center px-5">

  <Logo />

</div>

    </header>

    <div className="lg:grid lg:min-h-screen lg:grid-cols-[44%_56%]">

      {/* Desktop introduction panel */}

      <aside className="relative hidden overflow-hidden bg-[#07143f] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:px-12 lg:py-10 xl:px-16">

        <div className="relative z-10">

          <Logo inverse />

        </div>

        <div className="relative z-10 my-auto max-w-lg">

          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8fd128]">

            GrowthLens setup

          </p>

          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8fd128]">

  Step {step} of 3

</p>

          <h2 className="mt-5 text-4xl font-black leading-[1.12] tracking-[-0.04em] xl:text-5xl">

            {currentStepContent.heroTitle}

          </h2>

          <p className="mt-5 max-w-md text-base leading-7 text-blue-100 xl:text-lg">

            {currentStepContent.heroDescription}

          </p>

          <div className="mt-12">

            <OnboardingProgress

              currentStep={step}

              orientation="vertical"

            />

          </div>

        </div>

        <p className="relative z-10 text-sm leading-6 text-white/55">

          Your answers help GrowthLens provide practical guidance suited to

          your business.

        </p>

        <div className="pointer-events-none absolute -bottom-32 -right-28 h-80 w-80 rounded-full border-[55px] border-white/5" />

      </aside>

      {/* Form area */}

      <section className="min-w-0 bg-[#f5f8fd] lg:min-h-screen">

        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-10 lg:px-10 lg:py-12">

          {/* Mobile introduction */}

          <div className="mb-6 rounded-[22px] bg-[#07143f] p-5 text-white sm:p-6 lg:hidden">

            <h2 className="mt-3 text-2xl font-black leading-tight tracking-[-0.03em]">

              {currentStepContent.heroTitle}

            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-100">

              {currentStepContent.heroDescription}

            </p>

            <div className="mt-6">

              <OnboardingProgress currentStep={step} />

            </div>

          </div>

          <div className="card p-6 sm:p-10">

           <span className="eyebrow">

  Step {step} of 3 · {currentStepContent.tag}

</span>

<h1 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#07143f] sm:text-4xl">

  {currentStepContent.title}

</h1>

<p className="mt-3 max-w-2xl leading-7 text-[#66729b]">

  {currentStepContent.description}

</p>

            <div className="mt-8 grid gap-5">

              {step === 1 && (

                <>

                  <label className="grid gap-2 text-sm font-bold">

                    Business name

                    <input

                      className={`field ${

                        errors.businessName ? "!border-[#d92d20]" : ""

                      }`}

                      placeholder="BrightPath Studio"

                      aria-invalid={Boolean(errors.businessName)}

                      {...register("businessName", {

                        required: "Please enter your business name.",

                        minLength: {

                          value: 2,

                          message:

                            "Business name must contain at least 2 characters.",

                        },

                      })}

                    />

                  </label>

                  {errors.businessName && (

                    <p

                      className="text-sm font-semibold text-[#d92d20]"

                      role="alert"

                    >

                      {errors.businessName.message}

                    </p>

                  )}

                  <div className="grid gap-5 sm:grid-cols-2">

                    <label className="grid gap-2 text-sm font-bold">

                      Industry

                      <select

                        className="field"

                        {...register("industry", {

                          required: "Please select your industry.",

                        })}

                      >

                        <option value="professional_services">

                          Professional services

                        </option>

                        <option value="beauty_wellness">

                          Beauty and wellness

                        </option>

                        <option value="fashion">Fashion and tailoring</option>

                        <option value="food_catering">

                          Food and catering

                        </option>

                        <option value="retail">Retail</option>

                        <option value="creative_media">

                          Creative and media services

                        </option>

                        <option value="education_training">

                          Education and training

                        </option>

                        <option value="hospitality">Hospitality</option>

                        <option value="manufacturing">Manufacturing</option>

                        <option value="technology">Technology</option>

                        <option value="logistics">Logistics</option>

                        <option value="agriculture">Agriculture</option>

                        <option value="other">Other</option>

                      </select>

                    </label>

                    <label className="grid gap-2 text-sm font-bold">

                      Team size

                      <select

                        className="field"

                        {...register("teamSize", {

                          required: "Please select your team size.",

                        })}

                      >

                        <option value="solo">Just me</option>

                        <option value="2_10">2-10 people</option>

                        <option value="11_50">11-50 people</option>

                        <option value="51_plus">51+ people</option>

                      </select>

                    </label>

                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">

                    <label className="grid gap-2 text-sm font-bold">

                      What does your business offer?

                      <select

                        className="field"

                        {...register("businessType", {

                          required: "Please choose what your business offers.",

                        })}

                      >

                        <option value="products">Products</option>

                        <option value="services">Services</option>

                        <option value="both">Products and services</option>

                      </select>

                    </label>

                    <label className="grid gap-2 text-sm font-bold">

                      Current business stage

                      <select

                        className="field"

                        {...register("businessStage", {

                          required: "Please select your business stage.",

                        })}

                      >

                        <option value="starting">Starting</option>

                        <option value="stabilising">Stabilising</option>

                        <option value="growing">Growing</option>

                        <option value="established">Established</option>

                      </select>

                    </label>

                  </div>

                </>

              )}

             {step === 1 && (

                <>

                  <fieldset className="grid gap-3">

                    <legend className="text-sm font-bold">

                      How do customers find or contact you?

                    </legend>

                    <p className="text-sm text-[#66729b]">

                      Select all that apply.

                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">

                      {customerChannelOptions.map((option) => (

                        <label

                          key={option.value}

                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dfe6f1] bg-white px-4 py-3 text-sm font-semibold"

                        >

                          <input

                            type="checkbox"

                            value={option.value}

                            className="h-4 w-4 accent-[#ff5d49]"

                            {...register("customerChannels", {

                              validate: (value) =>

                                value.length > 0 ||

                                "Please select at least one customer channel.",

                            })}

                          />

                          {option.label}

                        </label>

                      ))}

                    </div>

                  </fieldset>

                  {errors.customerChannels && (

                    <p

                      className="text-sm font-semibold text-[#d92d20]"

                      role="alert"

                    >

                      {errors.customerChannels.message}

                    </p>

                  )}

                  <fieldset className="grid gap-3">

                    <legend className="text-sm font-bold">

                      How do customers usually pay you?

                    </legend>

                    <p className="text-sm text-[#66729b]">

                      Select all that apply.

                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">

                      {paymentMethodOptions.map((option) => (

                        <label

                          key={option.value}

                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dfe6f1] bg-white px-4 py-3 text-sm font-semibold"

                        >

                          <input

                            type="checkbox"

                            value={option.value}

                            className="h-4 w-4 accent-[#ff5d49]"

                            {...register("paymentMethods", {

                              validate: (value) =>

                                value.length > 0 ||

                                "Please select at least one payment method.",

                            })}

                          />

                          {option.label}

                        </label>

                      ))}

                    </div>

                  </fieldset>

                  {errors.paymentMethods && (

                    <p

                      className="text-sm font-semibold text-[#d92d20]"

                      role="alert"

                    >

                      {errors.paymentMethods.message}

                    </p>

                  )}

                  <label className="grid gap-2 text-sm font-bold">

                    How confident are you using digital tools?

                    <select

                      className="field"

                      {...register("digitalConfidence", {

                        required: "Please select your digital confidence.",

                      })}

                    >

                      <option value="beginner">

                        Beginner - I prefer simple guidance

                      </option>

                      <option value="comfortable">

                        Comfortable - I use common digital tools

                      </option>

                      <option value="advanced">

                        Advanced - I confidently use several tools

                      </option>

                    </select>

                  </label>

                  <fieldset className="grid gap-3">

                    <legend className="text-sm font-bold">

                      Do you serve customers in person or from a physical

                      location?

                    </legend>

                    <input

                      type="hidden"

                      {...register("servesCustomersOffline")}

                    />

                    <div className="grid grid-cols-2 gap-3">

                      {[

                        { label: "Yes", value: true },

                        { label: "No", value: false },

                      ].map((option) => {

                        const isSelected =

                          servesCustomersOffline === option.value;

                        return (

                          <button

                            key={option.label}

                            type="button"

                            onClick={() =>

                              setValue(

                                "servesCustomersOffline",

                                option.value,

                                { shouldValidate: true },

                              )

                            }

                            className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${

                              isSelected

                                ? "border-[#ff8778] bg-[#fff8f6] text-[#07143f]"

                                : "border-slate-200 bg-white text-[#66729b] hover:border-[#b9c5d8]"

                            }`}

                          >

                            {option.label}

                          </button>

                        );

                      })}

                    </div>

                  </fieldset>

                  <label className="grid gap-2 text-sm font-bold">

                    Where does your business mainly operate?

                    <input

                      className={`field ${

                        errors.locationContext ? "!border-[#d92d20]" : ""

                      }`}

                      placeholder="Nigeria"

                      aria-invalid={Boolean(errors.locationContext)}

                      {...register("locationContext", {

                        required: "Please enter your main location.",

                      })}

                    />

                  </label>

                  {errors.locationContext && (

                    <p

                      className="text-sm font-semibold text-[#d92d20]"

                      role="alert"

                    >

                      {errors.locationContext.message}

                    </p>

                  )}

                </>

              )}

             {step === 2 && (

                <>

                <label className="grid gap-2 text-sm font-bold">

  Assessment name

  <input

    className={`field ${

      errors.assessmentName ? "!border-[#d92d20]" : ""

    }`}

    placeholder="e.g. October Business Check-in"

    aria-invalid={Boolean(errors.assessmentName)}

    {...register("assessmentName", {

      required: "Please enter an assessment name.",

      minLength: {

        value: 2,

        message:

          "Assessment name must contain at least 2 characters.",

      },

    })}

  />

</label>

{errors.assessmentName && (

  <p

    className="text-sm font-semibold text-[#d92d20]"

    role="alert"

  >

    {errors.assessmentName.message}

  </p>

)}

                  <input

                    type="hidden"

                    {...register("perspectiveType", {

                      required: "Please choose a perspective.",

                    })}

                  />

                  <button

                    type="button"

                    onClick={() =>

                      setValue("perspectiveType", "owner_customer", {

                        shouldValidate: true,

                      })

                    }

                    className={`rounded-2xl border-2 p-5 text-left transition ${

                      perspectiveType === "owner_customer"

                        ? "border-[#ff8778] bg-[#fff8f6]"

                        : "border-slate-200 bg-white hover:border-[#b9c5d8]"

                    }`}

                  >

                    <b>Owner + Customer</b>

                    <p className="mt-2 text-sm text-[#66729b]">

                      Best for solo and owner-led businesses.

                    </p>

                  </button>

                  {teamSize !== "solo" ? (

                    <button

                      type="button"

                      onClick={() =>

                        setValue(

                          "perspectiveType",

                          "owner_employee_customer",

                          { shouldValidate: true },

                        )

                      }

                      className={`rounded-2xl border-2 p-5 text-left transition ${

                        perspectiveType === "owner_employee_customer"

                          ? "border-[#ff8778] bg-[#fff8f6]"

                          : "border-slate-200 bg-white hover:border-[#b9c5d8]"

                      }`}

                    >

                      <b>Owner + Employee + Customer</b>

                      <p className="mt-2 text-sm text-[#66729b]">

                        Best when a team shapes delivery and customer

                        experience.

                      </p>

                    </button>

                  ) : (

                    <p className="rounded-xl bg-[#eef5ff] px-4 py-3 text-sm font-semibold text-[#31548e]">

                      Because you selected “Just me”, your diagnosis will

                      compare the owner and customer perspectives.

                    </p>

                  )}

                  {errors.perspectiveType && (

                    <p

                      className="text-sm font-semibold text-[#d92d20]"

                      role="alert"

                    >

                      {errors.perspectiveType.message}

                    </p>

                  )}

                  <div className="rounded-2xl border border-[#cfe0f5] bg-[#f5f9ff] p-4 sm:p-5">
                    <p className="font-extrabold text-[#07143f]">
                      Aim for five completed perspectives
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#526f9f]">
                      Your report will be more reliable when at least five
                      people have completed the assessment, including you.
                      You can choose to generate it earlier once every
                      selected perspective has at least one completed
                      response.
                    </p>

                    <p className="mt-3 text-sm font-semibold leading-6 text-[#31548e]">
                      {perspectiveType === "owner_employee_customer"
                        ? "Recommended mix: your owner response, at least one customer, at least one employee, and two more responses from either group."
                        : "Recommended mix: your owner response and four customer responses."}
                    </p>
                  </div>

                </>

              )}

{step === 3 && (

  <div className="grid gap-4">

    <div className="rounded-2xl border border-[#dfe6f1] bg-[#f8faff] p-5">

      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1379f4]">

        What happens next

      </p>

      <div className="mt-5 grid gap-4">

        <div className="flex gap-4">

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff5d49] text-sm font-black text-white">

            1

          </span>

          <div>

            <h3 className="font-extrabold text-[#07143f]">

              Complete your owner assessment

            </h3>

            <p className="mt-1 text-sm leading-6 text-[#66729b]">

              Answer eight short questions about how your business works

              today.

            </p>

          </div>

        </div>

        <div className="flex gap-4">

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-sm font-black text-[#1379f4]">

            2

          </span>

          <div>

            <h3 className="font-extrabold text-[#07143f]">

              Invite other perspectives

            </h3>

            <p className="mt-1 text-sm leading-6 text-[#66729b]">

              After submitting your answers, you can invite customers

              {perspectiveType ===

              "owner_employee_customer"

                ? " and employees"

                : ""}{" "}

              using their private assessment links.

            </p>

          </div>

        </div>

        <div className="flex gap-4">

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-sm font-black text-[#1379f4]">

            3

          </span>

          <div>

            <h3 className="font-extrabold text-[#07143f]">

              Collect enough responses

            </h3>

            <p className="mt-1 text-sm leading-6 text-[#66729b]">

              Aim for five completed perspectives, including yours. You
              can generate earlier once every selected perspective is
              represented, but outstanding participant links will then
              stop accepting responses.

            </p>

          </div>

        </div>

        <div className="flex gap-4">

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-sm font-black text-[#1379f4]">

            4

          </span>

          <div>

            <h3 className="font-extrabold text-[#07143f]">

              Compare the results

            </h3>

            <p className="mt-1 text-sm leading-6 text-[#66729b]">

              GrowthLens will identify areas of agreement, perspective

              gaps and practical next actions.

            </p>

          </div>

        </div>

      </div>

    </div>

    <p className="rounded-xl bg-[#eef8ff] px-4 py-3 text-sm leading-6 text-[#315aa8]">

      Your customer or employee invitations will not be sent until you

      complete your own assessment.

    </p>

  </div>

)}

              {submitError && (

                <p

                  className="rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#b42318]"

                  role="alert"

                >

                  {submitError}

                </p>

              )}

          <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:items-center sm:justify-between">

  <button

    type="button"

    className="btn-primary order-1 w-full justify-center px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:w-auto sm:px-5"

    disabled={isSubmitting}

    onClick={

      step < 3

        ? moveToNextStep

        : handleSubmit(submitOnboarding)

    }

  >

    {isSubmitting

      ? "Saving..."

      : step === 1

        ? "Continue to assessment setup"

        : step === 2

          ? "Review and continue"

         : "Start my assessment"}

  </button>

  {step > 1 && (

    <button

      type="button"

      className="btn-secondary order-2 w-full justify-center px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:order-1 sm:w-auto sm:px-5"

      disabled={isSubmitting}

      onClick={() =>

        setStep((currentStep) =>

          Math.max(1, currentStep - 1),

        )

      }

    >

      Back

    </button>

  )}

</div>

            </div>

          </div>

        </div>

        </section>

      </div>

    </main>

  );

}
