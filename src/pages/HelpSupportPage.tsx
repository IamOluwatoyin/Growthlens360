import {
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  Mail,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  createSupportRequest,
  type SupportRequestValues,
} from "../services/support";

const faqs = [
  {
    question: "How does the business diagnosis work?",
    answer:
      "You complete the owner assessment and invite customers and, when relevant, employees. GrowthLens compares the perspectives and highlights strengths, gaps and practical next steps.",
  },
  {
    question: "Can I use GrowthLens without employees?",
    answer:
      "Yes. Solo and owner-led businesses can use the owner and customer perspectives without adding employees.",
  },
  {
    question: "How do I invite a customer or employee?",
    answer:
      "Open Assessments, select your assessment and add the participant. You can email their private link or copy and share it yourself.",
  },
  {
    question: "When will my report be ready?",
    answer:
      "Your report becomes available after the required perspectives have completed their assessments and the analysis has finished.",
  },
  {
    question: "What does a perspective gap mean?",
    answer:
      "A perspective gap means the owner, customers or employees experience part of the business differently. It is an opportunity to understand what needs attention.",
  },
  {
    question: "Are my business results private?",
    answer:
      "Yes. Your business information, assessments and reports are available only through authorised access.",
  },
];

export function HelpSupportPage() {
  const [search, setSearch] = useState("");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SupportRequestValues>({
    defaultValues: {
      category: "assessment",
      subject: "",
      message: "",
    },
  });

  const filteredFaqs = faqs.filter(({ question, answer }) => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return true;

    return (
      question.toLowerCase().includes(searchValue) ||
      answer.toLowerCase().includes(searchValue)
    );
  });

  const submitRequest = async (values: SupportRequestValues) => {
    setSuccessMessage(null);

    try {
      await createSupportRequest(values);

      setSuccessMessage(
        "Your support request has been received. We will respond as soon as possible.",
      );

      reset({
        category: "assessment",
        subject: "",
        message: "",
      });
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit your support request.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <span className="eyebrow">Help & support</span>

      <h1 className="mt-2 text-3xl font-black tracking-tight text-[#07143f] sm:text-4xl">
        How can we help?
      </h1>

      <p className="mt-2 max-w-2xl leading-7 text-[#66729b]">
        Find answers about assessments, reports and your account, or send
        us a support request.
      </p>

      <div className="relative mt-8 max-w-3xl">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a86a8]"
          size={20}
        />

        <input
          type="search"
          className="field py-4 pl-12"
          placeholder="Search help topics..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="mt-8 grid gap-7 lg:grid-cols-[1.1fr_.9fr]">
        <section>
          <h2 className="text-xl font-extrabold text-[#07143f]">
            Frequently asked questions
          </h2>

          <div className="mt-4 grid gap-3">
            {filteredFaqs.length === 0 ? (
              <div className="card p-6 text-[#66729b]">
                No help topics matched your search.
              </div>
            ) : (
              filteredFaqs.map(({ question, answer }) => {
                const isOpen = openQuestion === question;

                return (
                  <div className="card overflow-hidden" key={question}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 p-5 text-left"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenQuestion(isOpen ? null : question)
                      }
                    >
                      <span className="font-extrabold text-[#07143f]">
                        {question}
                      </span>

                      <ChevronDown
                        size={20}
                        className={`shrink-0 text-[#1379f4] transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <p className="border-t border-[#edf0f5] px-5 py-4 leading-7 text-[#66729b]">
                        {answer}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="card p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf5ff] text-[#1379f4]">
              <Mail size={21} />
            </span>

            <div>
              <h2 className="text-xl font-extrabold text-[#07143f]">
                Contact support
              </h2>
              <p className="mt-1 text-sm text-[#66729b]">
                Tell us what you need help with.
              </p>
            </div>
          </div>

          <form
            className="mt-6 grid gap-5"
            onSubmit={handleSubmit(submitRequest)}
            noValidate
          >
            <label className="grid gap-2 text-sm font-bold">
              Help category
              <select
                className="field"
                {...register("category", {
                  required: "Please choose a category.",
                })}
              >
                <option value="assessment">Assessment</option>
                <option value="report">Report</option>
                <option value="recommendations">
                  Recommendations
                </option>
                <option value="account">Account</option>
                <option value="technical">Technical issue</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Subject
              <input
                className={`field ${
                  errors.subject ? "!border-[#d92d20]" : ""
                }`}
                placeholder="Briefly describe the issue"
                {...register("subject", {
                  required: "Please enter a subject.",
                  minLength: {
                    value: 4,
                    message: "Subject must contain at least 4 characters.",
                  },
                })}
              />
            </label>

            {errors.subject && (
              <p className="text-sm font-semibold text-[#d92d20]">
                {errors.subject.message}
              </p>
            )}

            <label className="grid gap-2 text-sm font-bold">
              Message
              <textarea
                className={`field min-h-36 resize-y ${
                  errors.message ? "!border-[#d92d20]" : ""
                }`}
                placeholder="Explain what happened and what you need help with."
                {...register("message", {
                  required: "Please enter your message.",
                  minLength: {
                    value: 10,
                    message: "Message must contain at least 10 characters.",
                  },
                })}
              />
            </label>

            {errors.message && (
              <p className="text-sm font-semibold text-[#d92d20]">
                {errors.message.message}
              </p>
            )}

            {errors.root?.message && (
              <p
                className="rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#b42318]"
                role="alert"
              >
                {errors.root.message}
              </p>
            )}

            {successMessage && (
              <p
                className="flex gap-2 rounded-xl bg-[#e8f8ef] px-4 py-3 text-sm font-semibold text-[#087a4d]"
                role="status"
              >
                <CheckCircle2 size={19} className="shrink-0" />
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Sending request...
                </>
              ) : (
                <>
                  <Mail size={18} />
                  Send support request
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}