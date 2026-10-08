import {

  Check,

  CircleCheckBig,

  Copy,

  FileText,

  Info,

  LoaderCircle,

  Mail,

  Plus,

  UserPlus,

  Users,

  X,

} from "lucide-react";

import { useEffect, useState } from "react";

import { useForm, useWatch } from "react-hook-form";

import { Link, useParams } from "react-router-dom";

import {

  addAssessmentParticipant,

  loadAssessmentParticipants,

  requestParticipantEmailInvitation,

  requestAssessmentAnalysis,

  type AssessmentParticipant,

  type ParticipantType,

} from "../services/assessmentParticipants";

type InviteFormValues = {

  fullName: string;

  email: string;

  phoneNumber: string;

  participantType: ParticipantType;

  sendEmailInvitation: boolean;

};

export function AssessmentParticipantsPage() {

  const { assessmentId } = useParams();

  const [participants, setParticipants] = useState<

    AssessmentParticipant[]

  >([]);

  const [perspectiveType, setPerspectiveType] = useState<

    "owner_customer" | "owner_employee_customer"

  >("owner_customer");

  const [isLoading, setIsLoading] = useState(true);

  const [pageError, setPageError] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [emailActionId, setEmailActionId] = useState<

  string | null

  >(null);

  const [assessmentStatus, setAssessmentStatus] = useState<
    "draft" | "collecting" | "ready_for_analysis" | "completed"
  >("collecting");

  const [isRequestingAnalysis, setIsRequestingAnalysis] =
    useState(false);

  const [showAnalysisConfirmation, setShowAnalysisConfirmation] =
    useState(false);

  const [isAddParticipantOpen, setIsAddParticipantOpen] =
    useState(false);

  const {

    register,

    handleSubmit,

    reset,

    control,

    setError,

    formState: { errors, isSubmitting },

  } = useForm<InviteFormValues>({

    defaultValues: {

  fullName: "",

  email: "",

  phoneNumber: "",

  participantType: "customer",

  sendEmailInvitation: true,

},

  });

  const shouldSendEmail = useWatch({
    control,
    name: "sendEmailInvitation",
  });

  useEffect(() => {

    if (!assessmentId) {

  return;

}

    const loadParticipants = async () => {

      try {

        const data = await loadAssessmentParticipants(assessmentId);

        setPerspectiveType(data.perspectiveType);

        setAssessmentStatus(data.assessmentStatus);

        setParticipants(data.participants);

      } catch (error) {

        setPageError(

          error instanceof Error

            ? error.message

            : "Unable to load assessment participants.",

        );

      } finally {

        setIsLoading(false);

      }

    };

    void loadParticipants();

  }, [assessmentId]);

  const refreshParticipantUntilSettled = async (

  participantId: string,

) => {

  if (!assessmentId) return;

  for (let attempt = 0; attempt < 10; attempt += 1) {

    await new Promise<void>((resolve) => {

      window.setTimeout(resolve, 2000);

    });

    try {

      const refreshedData =

        await loadAssessmentParticipants(assessmentId);

      setParticipants(refreshedData.participants);

      const refreshedParticipant =

        refreshedData.participants.find(

          (participant) => participant.id === participantId,

        );

      if (

        !refreshedParticipant ||

        refreshedParticipant.invitation_email_status !== "pending"

      ) {

        return;

      }

    } catch {

      // Try again on the next polling attempt.

    }

  }

};

  const submitInvitation = async (values: InviteFormValues) => {

    if (!assessmentId || assessmentStatus !== "collecting") return;

    setPageError(null);

    try {

      const participant = await addAssessmentParticipant(

  assessmentId,

  values.participantType,

  values.email,

  values.fullName,

  values.phoneNumber,

  values.sendEmailInvitation,

);

      setParticipants((currentParticipants) => {

        const withoutExisting = currentParticipants.filter(

          (currentParticipant) =>

            currentParticipant.id !== participant.id,

        );

        return [...withoutExisting, participant];

      });

      if (values.sendEmailInvitation) {

  void refreshParticipantUntilSettled(participant.id);

}

      reset({

  fullName: "",

  email: "",

  phoneNumber: "",

  participantType: "customer",

  sendEmailInvitation: true,

});

      setIsAddParticipantOpen(false);

    } catch (error) {

      setError("root", {

        type: "server",

        message:

          error instanceof Error

            ? error.message

            : "Unable to add this participant.",

      });

    }

  };

  const copyResponseLink = async (

    participant: AssessmentParticipant,

  ) => {

    const responseLink = `${window.location.origin}/respond/${participant.access_token}`;

    await navigator.clipboard.writeText(responseLink);

    setCopiedId(participant.id);

    window.setTimeout(() => {

      setCopiedId(null);

    }, 2000);

  };

  const sendEmailInvitation = async (

  participant: AssessmentParticipant,

) => {

  if (participant.status === "completed") return;

  setEmailActionId(participant.id);

  setPageError(null);

  try {

    const updatedParticipant =

      await requestParticipantEmailInvitation(

        participant.id,

      );

    setParticipants((currentParticipants) =>

      currentParticipants.map((currentParticipant) =>

        currentParticipant.id === updatedParticipant.id

          ? updatedParticipant

          : currentParticipant,

      ),

    );

    void refreshParticipantUntilSettled(

  updatedParticipant.id,

);

  } catch (error) {

    setPageError(

      error instanceof Error

        ? error.message

        : "Unable to send the email invitation.",

    );

  } finally {

    setEmailActionId(null);

  }

};

  const invitedParticipants = participants.filter(

    (participant) => participant.participant_type !== "owner",

  );

  const completedParticipants = invitedParticipants.filter(
    (participant) => participant.status === "completed",
  ).length;

  const ownerCompleted = participants.some(
    (participant) =>
      participant.participant_type === "owner" &&
      participant.status === "completed",
  );

  const customerCompleted = participants.some(
    (participant) =>
      participant.participant_type === "customer" &&
      participant.status === "completed",
  );

  const employeeCompleted = participants.some(
    (participant) =>
      participant.participant_type === "employee" &&
      participant.status === "completed",
  );

  const minimumResponsesReady =
    ownerCompleted &&
    customerCompleted &&
    (perspectiveType === "owner_customer" || employeeCompleted);

  const pendingParticipants = invitedParticipants.filter(
    (participant) => participant.status !== "completed",
  ).length;

  const completedResponseTotal =
    (ownerCompleted ? 1 : 0) + completedParticipants;

  const recommendedResponseTarget = 5;

  const recommendedTargetMet =
    completedResponseTotal >= recommendedResponseTarget;

  const collectionIsOpen = assessmentStatus === "collecting";

  const generateReport = async () => {
    if (!assessmentId || !minimumResponsesReady) return;

    setIsRequestingAnalysis(true);
    setPageError(null);

    try {
      await requestAssessmentAnalysis(assessmentId);
      setAssessmentStatus("ready_for_analysis");
      setShowAnalysisConfirmation(false);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to start report generation.",
      );
    } finally {
      setIsRequestingAnalysis(false);
    }
  };

  if (!assessmentId) {

  return (

    <div className="mx-auto max-w-5xl">

      <div className="card p-6">

        <h1 className="text-xl font-extrabold text-[#07143f]">

          Assessment not found

        </h1>

        <p className="mt-2 text-[#66729b]">

          This assessment link is missing or invalid.

        </p>

        <Link to="/assessments" className="btn-primary mt-5">

          Return to assessments

        </Link>

      </div>

    </div>

  );

}

  if (isLoading) {

    return (

      <div className="flex min-h-[60vh] items-center justify-center">

        <LoaderCircle

          size={34}

          className="animate-spin text-[#1379f4]"

        />

      </div>

    );

  }

  return (

    <div className="mx-auto max-w-[1180px] text-[#07143f]">

      <span className="eyebrow">Invite perspectives</span>

      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">

        Bring in the customer view

      </h1>

      <p className="mt-3 max-w-3xl leading-7 text-[#66729b]">

        Your owner assessment is complete. Invite customers

        {perspectiveType === "owner_employee_customer"

          ? " and employees"

          : ""}{" "}

        to share how they experience your business.

      </p>

      <section className="mt-7 grid gap-4 rounded-[22px] border border-[#dfe6f1] bg-white p-5 shadow-[0_12px_35px_rgba(21,40,87,.05)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8f8df] text-[#65ad00]">
            <CircleCheckBig size={25} />
          </span>

          <div>
            <h2 className="text-lg font-extrabold">
              Your owner assessment is complete
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#66729b]">
              You can now compare your view with the people who experience
              your business from a different perspective.
            </p>
          </div>
        </div>

        <div className="flex gap-3 sm:justify-end">
          <div className="rounded-xl bg-[#f5f8fd] px-4 py-3 text-center">
            <p className="text-xl font-black">{invitedParticipants.length}</p>
            <p className="text-xs font-bold text-[#66729b]">Invited</p>
          </div>
          <div className="rounded-xl bg-[#f2f9e9] px-4 py-3 text-center">
            <p className="text-xl font-black text-[#087a4d]">
              {completedParticipants}
            </p>
            <p className="text-xs font-bold text-[#66729b]">Completed</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[22px] border border-[#cfe0f5] bg-[#f5f9ff] p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#315ca7]">
              Recommended response target
            </p>
            <h2 className="mt-2 text-xl font-extrabold">
              {completedResponseTotal} of {recommendedResponseTarget} perspectives completed
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#52617e]">
              Aim for five completed perspectives, including your owner response,
              to produce a stronger and more representative report.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#315ca7]">
              <span>Progress</span>
              <span>{Math.min(100, Math.round((completedResponseTotal / recommendedResponseTarget) * 100))}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#dfe9f7]">
              <div
                className="h-full rounded-full bg-[#65ad00] transition-all"
                style={{
                  width: `${Math.min(100, (completedResponseTotal / recommendedResponseTarget) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-[#d7e4f4] pt-5">
          {assessmentStatus === "collecting" && minimumResponsesReady ? (
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <p className="text-sm font-semibold leading-6 text-[#31548e]">
                {recommendedTargetMet
                  ? "Great work — you have enough responses for a stronger report. You may generate it now or keep collecting."
                  : "Every selected perspective is now represented. You may generate an early report or keep collecting toward five responses."}
              </p>

              <button
                type="button"
                className="btn-primary shrink-0 justify-center"
                onClick={() => setShowAnalysisConfirmation(true)}
              >
                <FileText size={18} />
                Generate report
              </button>
            </div>
          ) : assessmentStatus !== "collecting" ? (
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <p className="text-sm font-semibold text-[#31548e]">
                Your responses are being analysed and your report is being prepared.
              </p>
              <Link to="/dashboard" className="btn-primary shrink-0 justify-center">
                View report progress
              </Link>
            </div>
          ) : (
            <p className="text-sm font-semibold leading-6 text-[#52617e]">
              Keep collecting the required perspectives. The report button will
              appear here as soon as every selected perspective is represented.
            </p>
          )}

          {showAnalysisConfirmation && collectionIsOpen && (
            <div className="mt-5 rounded-2xl border-2 border-[#ffb5aa] bg-[#fff8f6] p-5">
              <h3 className="text-lg font-extrabold text-[#07143f]">
                {recommendedTargetMet
                  ? "Ready to generate your report?"
                  : "Generate with the current responses?"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#66729b]">
                GrowthLens will analyse the {completedResponseTotal} completed
                perspectives currently available. Once your report begins,
                any remaining participant link
                {pendingParticipants === 1 ? "" : "s"} will stop accepting new
                responses for this assessment.
              </p>

              {!recommendedTargetMet && (
                <p className="mt-3 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-bold text-[#b42318]">
                  You have not reached the recommended total of five responses.
                  The report may be less representative of the wider customer or
                  employee experience.
                </p>
              )}

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="btn-secondary justify-center"
                  disabled={isRequestingAnalysis}
                  onClick={() => setShowAnalysisConfirmation(false)}
                >
                  Keep collecting
                </button>
                <button
                  type="button"
                  className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isRequestingAnalysis}
                  onClick={() => void generateReport()}
                >
                  {isRequestingAnalysis ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Starting analysis...
                    </>
                  ) : (
                    "Generate report"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mt-6">

        {isAddParticipantOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#07143f]/45 p-0 sm:items-center sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-participant-title"
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) {
                setIsAddParticipantOpen(false);
              }
            }}
          >
        <form

          className="grid max-h-[92vh] w-full max-w-xl gap-5 overflow-y-auto rounded-t-[24px] bg-white p-5 shadow-2xl sm:rounded-[24px] sm:p-6"

          onSubmit={handleSubmit(submitInvitation)}

          noValidate

        >

          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-3">

            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf5ff] text-[#1379f4]">
              <UserPlus size={21} />
            </span>

            <h2 id="add-participant-title" className="text-xl font-extrabold">

              Add a participant

            </h2>

            </div>

            <button
              type="button"
              className="rounded-full p-2 text-[#66729b] transition hover:bg-slate-100 hover:text-[#07143f]"
              aria-label="Close add participant form"
              onClick={() => setIsAddParticipantOpen(false)}
            >
              <X size={20} />
            </button>

          </div>

          <label className="grid gap-2 text-sm font-bold">

            Name (optional)

            <input

              className="field"

              placeholder="Participant’s name"

              {...register("fullName")}

            />

          </label>

          <label className="grid gap-2 text-sm font-bold">

            Email address {shouldSendEmail ? "" : "(optional)"}

            <input

              className={`field ${

                errors.email ? "!border-[#d92d20]" : ""

              }`}

              type="email"

              placeholder="person@example.com"

              {...register("email", {

                validate: (value) =>
                  !shouldSendEmail ||
                  Boolean(value.trim()) ||
                  "Enter an email address to send the invitation.",

                pattern: {

                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                  message: "Please enter a valid email address.",

                },

              })}

            />

          </label>

          {errors.email && (

            <p className="text-sm font-semibold text-[#d92d20]">

              {errors.email.message}

            </p>

          )}

          <label className="grid gap-2 text-sm font-bold">

            Phone or WhatsApp number (optional)

            <input

              className="field"

              type="tel"

              placeholder="e.g. 0801 234 5678"

              {...register("phoneNumber")}

            />

          </label>

          {!shouldSendEmail && (

            <p className="rounded-xl bg-[#eef8ff] px-4 py-3 text-xs leading-5 text-[#315aa8]">

              Email is not required. Add a name or phone number, then copy
              the private link and share it through WhatsApp, SMS or any
              channel you prefer.

            </p>

          )}

          <label className="grid gap-2 text-sm font-bold">

            Perspective

            <select

              className="field"

              {...register("participantType")}

            >

              <option value="customer">Customer</option>

              {perspectiveType === "owner_employee_customer" && (

                <option value="employee">Employee</option>

              )}

            </select>

          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#dfe6f1] bg-[#f8faff] p-4">

  <input

    type="checkbox"

    className="mt-1 h-4 w-4 accent-[#1379f4]"

    {...register("sendEmailInvitation")}

  />

  <span>

    <span className="block text-sm font-extrabold text-[#07143f]">

      Send the assessment link by email

    </span>

    <span className="mt-1 block text-xs leading-5 text-[#66729b]">

      You can still copy the private link and share it through

      WhatsApp or another channel.

    </span>

  </span>

</label>

          {errors.root?.message && (

            <p className="rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#b42318]">

              {errors.root.message}

            </p>

          )}

          <button

            type="submit"

            className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"

            disabled={isSubmitting || !collectionIsOpen}

          >

            {isSubmitting ? (

              <>

                <LoaderCircle size={18} className="animate-spin" />

                Adding...

              </>

            ) : (

              <>

                <Mail size={18} />

                Add participant

              </>

            )}

          </button>

        </form>
          </div>
        )}

        <section className="card p-5 sm:p-6">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f9e9] text-[#65ad00]">
              <Users size={21} />
            </span>

            <div>

          <h2 className="text-xl font-extrabold">

            Participant links

          </h2>

         <p className="mt-2 text-sm leading-6 text-[#66729b]">

  Send assessment links by email or copy and share them through

  WhatsApp or another channel.

</p>

            </div>

            </div>

            {collectionIsOpen && (
              <button
                type="button"
                className="btn-primary w-full justify-center sm:w-auto"
                onClick={() => setIsAddParticipantOpen(true)}
              >
                <Plus size={18} />
                Add participant
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-3">

            {invitedParticipants.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-[#cfd8e7] p-7 text-center text-[#66729b]">

                <Users size={28} className="mx-auto text-[#9aabc5]" />
                <p className="mt-3 font-extrabold text-[#07143f]">
                  No participants added yet
                </p>
                <p className="mt-2 text-sm">
                  Add your first customer or employee using the form.
                </p>

                {collectionIsOpen && (
                  <button
                    type="button"
                    className="btn-primary mx-auto mt-5 justify-center"
                    onClick={() => setIsAddParticipantOpen(true)}
                  >
                    <Plus size={18} />
                    Add your first participant
                  </button>
                )}

              </div>

            ) : (

              invitedParticipants.map((participant) => (

                <div

                  key={participant.id}

                  className="rounded-2xl border border-[#dfe6f1] p-4"

                >

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>

  <p className="font-extrabold text-[#07143f]">

    {participant.full_name ||
      participant.email ||
      participant.phone_number ||
      "Participant"}

  </p>

  <p className="mt-1 text-sm text-[#66729b]">

    {participant.email || participant.phone_number || "Manual link"} ·{" "}

    {participant.participant_type}

  </p>

  <div className="mt-2">

    {participant.status === "completed" ? (

      <span className="inline-flex rounded-full bg-[#e8f8ef] px-3 py-1 text-xs font-bold text-[#087a4d]">

        Assessment completed

      </span>

    ) : participant.invitation_email_status === "sent" ? (

      <span className="inline-flex rounded-full bg-[#eaf5ff] px-3 py-1 text-xs font-bold text-[#1379f4]">

        Email sent

      </span>

    ) : participant.invitation_email_status === "pending" ? (

      <span className="inline-flex rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-bold text-[#a15c00]">

        Email pending

      </span>

    ) : participant.invitation_email_status === "failed" ? (

      <span className="inline-flex rounded-full bg-[#fff0ed] px-3 py-1 text-xs font-bold text-[#b42318]">

        Email failed

      </span>

    ) : (

      <span className="inline-flex rounded-full bg-[#f1f4f8] px-3 py-1 text-xs font-bold text-[#66729b]">

        Link ready to share

      </span>

    )}

  </div>

</div>

<div className="flex w-full flex-col gap-2 sm:w-auto">

  <button

    type="button"

    className="btn-secondary w-full justify-center sm:w-auto"

    onClick={() => copyResponseLink(participant)}

  >

    {copiedId === participant.id ? (

      <>

        <Check size={17} />

        Copied

      </>

    ) : (

      <>

        <Copy size={17} />

        Copy link

      </>

    )}

  </button>

  {participant.status !== "completed" &&
    collectionIsOpen &&
    Boolean(participant.email) && (

    <button

      type="button"

      className="btn-secondary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"

      disabled={

        emailActionId === participant.id ||

        participant.invitation_email_status === "pending"

      }

      onClick={() =>

        void sendEmailInvitation(participant)

      }

    >

      {emailActionId === participant.id ||

      participant.invitation_email_status === "pending" ? (

        <>

          <LoaderCircle

            size={17}

            className="animate-spin"

          />

          Sending...

        </>

      ) : (

        <>

          <Mail size={17} />

          {participant.invitation_email_status === "sent"

            ? "Resend email"

            : "Send email"}

        </>

      )}

    </button>

  )}

</div>

                  </div>

                </div>

              ))

            )}

          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#f8faff] p-4 text-sm leading-6 text-[#52617e]">
            <Info size={19} className="mt-0.5 shrink-0 text-[#1379f4]" />
            <p>
              Responses are securely collected and displayed as combined
              insights in your business report.
            </p>
          </div>

        </section>

      </div>


      {pageError && (

        <p className="mt-5 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#b42318]">

          {pageError}

        </p>

      )}

      <div className="mt-7 flex justify-end">
        <Link to="/dashboard" className="btn-primary justify-center">

          Continue to dashboard

        </Link>

      </div>

    </div>

  );

}
