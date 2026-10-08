import {
  Building2,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  getBusinessProfile,
  updateBusinessProfile,
  type UpdateBusinessProfileValues,
} from "../services/businessProfile";

const customerChannelOptions = [
  { value: "walk_in", label: "Walk-in customers" },
  { value: "phone", label: "Phone calls" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "website", label: "Website" },
  { value: "marketplace", label: "Online marketplace" },
  { value: "referral", label: "Referrals" },
];

const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "pos", label: "POS/card" },
  { value: "mobile_money", label: "Mobile money" },
  { value: "online_payment", label: "Online payment link" },
];

export function BusinessProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateBusinessProfileValues>({
    mode: "onBlur",
    defaultValues: {
      business_name: "",
      industry: "retail",
      team_size: "solo",
      business_type: "both",
      business_stage: "stabilising",
      customer_channels: [],
      digital_confidence: "beginner",
      primary_payment_methods: [],
      serves_customers_offline: true,
      location_context: "Nigeria",
      perspective_type: "owner_customer",
    },
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const profile = await getBusinessProfile();

        if (!isMounted) return;

        reset({
          business_name: profile.business_name,
          industry: profile.industry,
          team_size: profile.team_size,
          business_type: profile.business_type,
          business_stage: profile.business_stage,
          customer_channels: profile.customer_channels ?? [],
          digital_confidence: profile.digital_confidence,
          primary_payment_methods:
            profile.primary_payment_methods ?? [],
          serves_customers_offline:
            profile.serves_customers_offline,
          location_context: profile.location_context,
          perspective_type: profile.perspective_type,
        });
      } catch (error) {
        if (isMounted) {
          setPageError(
            error instanceof Error
              ? error.message
              : "Unable to load your business profile.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [reset]);

  const submitProfile = async (
    values: UpdateBusinessProfileValues,
  ) => {
    setPageError(null);
    setSuccessMessage(null);

    try {
      const updatedProfile = await updateBusinessProfile(values);

      reset({
        business_name: updatedProfile.business_name,
        industry: updatedProfile.industry,
        team_size: updatedProfile.team_size,
        business_type: updatedProfile.business_type,
        business_stage: updatedProfile.business_stage,
        customer_channels: updatedProfile.customer_channels ?? [],
        digital_confidence: updatedProfile.digital_confidence,
        primary_payment_methods:
          updatedProfile.primary_payment_methods ?? [],
        serves_customers_offline:
          updatedProfile.serves_customers_offline,
        location_context: updatedProfile.location_context,
        perspective_type: updatedProfile.perspective_type,
      });

      setSuccessMessage("Your business profile has been updated.");
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to update your business profile.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle
          size={36}
          className="animate-spin text-[#1379f4]"
          aria-label="Loading business profile"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <span className="eyebrow">Business profile</span>

      <h1 className="mt-2 text-3xl font-black tracking-tight text-[#07143f] sm:text-4xl">
        Keep your business context accurate
      </h1>

      <p className="mt-2 max-w-3xl leading-7 text-[#66729b]">
        Your profile helps GrowthLens tailor its questions,
        recommendations and guidance to the way your business actually
        operates.
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
        onSubmit={handleSubmit(submitProfile)}
        noValidate
      >
        <section className="card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf5ff] text-[#1379f4]">
              <Building2 size={22} />
            </span>

            <div>
              <h2 className="text-xl font-extrabold text-[#07143f]">
                Business details
              </h2>
              <p className="mt-1 text-sm text-[#66729b]">
                Tell us what your business does and its current stage.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold sm:col-span-2">
              Business name

              <input
                className={`field ${
                  errors.business_name
                    ? "!border-[#d92d20]"
                    : ""
                }`}
                placeholder="Enter your business name"
                {...register("business_name", {
                  required: "Please enter your business name.",
                  minLength: {
                    value: 2,
                    message:
                      "Business name must contain at least 2 characters.",
                  },
                })}
              />

              {errors.business_name && (
                <span className="text-sm font-semibold text-[#d92d20]">
                  {errors.business_name.message}
                </span>
              )}
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Industry

              <select
                className="field"
                {...register("industry", {
                  required: "Please select your industry.",
                })}
              >
                <option value="retail">Retail</option>
                <option value="professional_services">
                  Professional services
                </option>
                <option value="beauty">Beauty and personal care</option>
                <option value="fashion">Fashion and tailoring</option>
                <option value="food">Food and catering</option>
                <option value="artisan_services">
                  Artisan and trade services
                </option>
                <option value="hospitality">Hospitality</option>
                <option value="agriculture">Agriculture</option>
                <option value="logistics">
                  Logistics and transportation
                </option>
                <option value="manufacturing">Manufacturing</option>
                <option value="technology">Technology</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Team size

              <select className="field" {...register("team_size")}>
                <option value="solo">Just me</option>
                <option value="2_10">2–10 people</option>
                <option value="11_50">11–50 people</option>
                <option value="51_plus">51+ people</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold">
              What does your business offer?

              <select
                className="field"
                {...register("business_type")}
              >
                <option value="products">Products</option>
                <option value="services">Services</option>
                <option value="both">Products and services</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Business stage

              <select
                className="field"
                {...register("business_stage")}
              >
                <option value="starting">Starting</option>
                <option value="stabilising">Stabilising</option>
                <option value="growing">Growing</option>
                <option value="established">Established</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold sm:col-span-2">
              Business location

              <div className="relative">
                <MapPin
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7a86a8]"
                />

                <input
                  className={`field pl-11 ${
                    errors.location_context
                      ? "!border-[#d92d20]"
                      : ""
                  }`}
                  placeholder="For example: Lagos, Nigeria"
                  {...register("location_context", {
                    required: "Please enter your business location.",
                  })}
                />
              </div>

              {errors.location_context && (
                <span className="text-sm font-semibold text-[#d92d20]">
                  {errors.location_context.message}
                </span>
              )}
            </label>
          </div>
        </section>

        <section className="card p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-[#07143f]">
            How customers reach you
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#66729b]">
            Select every channel customers currently use to find,
            contact or buy from your business.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customerChannelOptions.map((channel) => (
              <label
                key={channel.value}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dfe6f1] bg-white p-4 text-sm font-semibold text-[#26375e]"
              >
                <input
                  type="checkbox"
                  value={channel.value}
                  className="h-4 w-4 accent-[#1379f4]"
                  {...register("customer_channels", {
                    required:
                      "Please select at least one customer channel.",
                  })}
                />

                {channel.label}
              </label>
            ))}
          </div>

          {errors.customer_channels && (
            <p className="mt-3 text-sm font-semibold text-[#d92d20]">
              {errors.customer_channels.message}
            </p>
          )}

          <label className="mt-5 flex items-start gap-3 rounded-xl bg-[#f6f8fc] p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-[#1379f4]"
              {...register("serves_customers_offline")}
            />

            <span>
              <span className="block font-bold text-[#07143f]">
                I also serve customers offline
              </span>

              <span className="mt-1 block text-sm leading-6 text-[#66729b]">
                Select this if customers visit your shop, office,
                workshop, stall or another physical location.
              </span>
            </span>
          </label>
        </section>

        <section className="card p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-[#07143f]">
            Payments and digital confidence
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#66729b]">
            This helps GrowthLens recommend tools that are practical
            for your current level.
          </p>

          <div className="mt-5">
            <p className="text-sm font-bold text-[#07143f]">
              Payment methods
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {paymentMethodOptions.map((method) => (
                <label
                  key={method.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dfe6f1] bg-white p-4 text-sm font-semibold text-[#26375e]"
                >
                  <input
                    type="checkbox"
                    value={method.value}
                    className="h-4 w-4 accent-[#1379f4]"
                    {...register("primary_payment_methods", {
                      required:
                        "Please select at least one payment method.",
                    })}
                  />

                  {method.label}
                </label>
              ))}
            </div>

            {errors.primary_payment_methods && (
              <p className="mt-3 text-sm font-semibold text-[#d92d20]">
                {errors.primary_payment_methods.message}
              </p>
            )}
          </div>

          <label className="mt-6 grid gap-2 text-sm font-bold">
            Digital confidence

            <select
              className="field"
              {...register("digital_confidence")}
            >
              <option value="beginner">
                Beginner — I need simple guidance
              </option>
              <option value="comfortable">
                Comfortable — I use common digital tools
              </option>
              <option value="advanced">
                Advanced — I confidently use business technology
              </option>
            </select>
          </label>
        </section>

        <section className="card p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-[#07143f]">
            Assessment perspectives
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#66729b]">
            Choose the perspectives that fit your business. This
            selection will apply when you create a new assessment.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#dfe6f1] p-5">
              <input
                type="radio"
                value="owner_customer"
                className="mt-1 h-4 w-4 accent-[#ff5d49]"
                {...register("perspective_type")}
              />

              <span>
                <span className="block font-extrabold text-[#07143f]">
                  Owner + Customer
                </span>

                <span className="mt-2 block text-sm leading-6 text-[#66729b]">
                  Best for solo businesses and businesses without
                  employees.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#dfe6f1] p-5">
              <input
                type="radio"
                value="owner_employee_customer"
                className="mt-1 h-4 w-4 accent-[#ff5d49]"
                {...register("perspective_type")}
              />

              <span>
                <span className="block font-extrabold text-[#07143f]">
                  Owner + Employee + Customer
                </span>

                <span className="mt-2 block text-sm leading-6 text-[#66729b]">
                  Best when employees influence service delivery and
                  customer experience.
                </span>
              </span>
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary min-w-[190px] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Saving changes...
              </>
            ) : (
              <>
                <Save size={18} />
                Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}