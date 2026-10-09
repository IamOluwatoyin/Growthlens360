import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  History,
  LoaderCircle,
  NotebookPen,
  Pencil,
  PlayCircle,
  Plus,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  deleteActionNotes,
  loadAssessmentActions,
  updateActionNotes,
  updateActionStatus,
  type ActionStatus,
  type AssessmentAction,
} from "../services/action";
type ActionFilter = "all" | ActionStatus;
function formatArea(area: string) {
  return area
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
function formatDate(value: string | null) {
  if (!value) return "No target date";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string | null) {
  if (!value) return "No progress update yet";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
const statusLabels: Record<ActionStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};
const statusStyles: Record<ActionStatus, string> = {
  not_started: "bg-[#f2f4f8] text-[#52617e]",
  in_progress: "bg-[#fff6db] text-[#916500]",
  completed: "bg-[#e8f8ef] text-[#087a4d]",
};
export function ActionsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [actions, setActions] = useState<AssessmentAction[]>([]);
const actionIdFromUrl = searchParams.get("action");
const recommendationFromUrl = searchParams.get("recommendation");
const selectedActionId =
  actionIdFromUrl ??
  (
    recommendationFromUrl !== null
      ? actions.find(
          (action) =>
            action.recommendation_index ===
            Number(recommendationFromUrl),
        )?.id
      : null
  ) ??
  null;
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingActionId, setSavingActionId] = useState<string | null>(
    null,
  );
  const [editingNoteId, setEditingNoteId] = useState<string | null>(
    null,
  );
  const [addingNoteId, setAddingNoteId] = useState<string | null>(
    null,
  );
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<
    string | null
  >(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    null,
  );
  const [activeFilter, setActiveFilter] =
  useState<ActionFilter>("all");
  useEffect(() => {
    let isMounted = true;
    const loadActions = async () => {
      try {
        const savedActions = await loadAssessmentActions();
        if (isMounted) {
          setActions(savedActions);
          setNoteDrafts(
            Object.fromEntries(
              savedActions.map((action) => [
                action.id,
                action.notes ?? "",
              ]),
            ),
          );
        }
      } catch (error) {
        if (isMounted) {
          setPageError(
            error instanceof Error
              ? error.message
              : "Unable to load your action plan.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    void loadActions();
    return () => {
      isMounted = false;
    };
  }, []);
  useEffect(() => {
  if (
    isLoading ||
    !selectedActionId ||
    actions.length === 0
  ) {
    return;
  }
  const selectedActionExists = actions.some(
    (action) => action.id === selectedActionId,
  );
  if (!selectedActionExists) {
    return;
  }
  const animationFrameId =
    window.requestAnimationFrame(() => {
      const selectedElement =
        document.getElementById(
          `action-${selectedActionId}`,
        );
      selectedElement?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  const highlightTimeoutId =
    window.setTimeout(() => {
      navigate("/actions", {
        replace: true,
      });
    }, 2500);
  return () => {
    window.cancelAnimationFrame(
      animationFrameId,
    );
    window.clearTimeout(highlightTimeoutId);
  };
}, [
  actions,
  isLoading,
  navigate,
  selectedActionId,
]);
  const handleStatusChange = async (
    actionId: string,
    status: ActionStatus,
  ) => {
    setSavingActionId(actionId);
    setPageError(null);
    setSuccessMessage(null);
    try {
      const updatedAction = await updateActionStatus(actionId, status);
      setActions((currentActions) =>
        currentActions.map((action) =>
          action.id === updatedAction.id ? updatedAction : action,
        ),
      );
      setSuccessMessage("Action status updated.");
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to update the action status.",
      );
    } finally {
      setSavingActionId(null);
    }
  };
  const handleSaveNotes = async (actionId: string) => {
    setSavingActionId(actionId);
    setPageError(null);
    setSuccessMessage(null);
    try {
      const currentAction = actions.find(
        (action) => action.id === actionId,
      );

      const latestProgressUpdate =
        currentAction?.progress_updates[0];

      const updatedAction = await updateActionNotes(
        actionId,
        noteDrafts[actionId] ?? "",
        editingNoteId === actionId
          ? latestProgressUpdate?.id
          : undefined,
      );
      setActions((currentActions) =>
        currentActions.map((action) =>
          action.id === updatedAction.id ? updatedAction : action,
        ),
      );
      setNoteDrafts((currentDrafts) => ({
        ...currentDrafts,
        [updatedAction.id]: updatedAction.notes ?? "",
      }));
      setEditingNoteId(null);
      setAddingNoteId(null);
      setSuccessMessage(
        editingNoteId === actionId
          ? "Progress update edited."
          : "Progress update saved.",
      );
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to save your notes.",
      );
    } finally {
      setSavingActionId(null);
    }
  };
  const handleEditNotes = (action: AssessmentAction) => {
    setNoteDrafts((currentDrafts) => ({
      ...currentDrafts,
      [action.id]: action.notes ?? "",
    }));
    setEditingNoteId(action.id);
    setAddingNoteId(null);
    setConfirmingDeleteId(null);
    setPageError(null);
    setSuccessMessage(null);
  };

  const handleAddProgress = (actionId: string) => {
    setNoteDrafts((currentDrafts) => ({
      ...currentDrafts,
      [actionId]: "",
    }));
    setAddingNoteId(actionId);
    setEditingNoteId(null);
    setConfirmingDeleteId(null);
    setPageError(null);
    setSuccessMessage(null);
  };
  const handleCancelEdit = (action: AssessmentAction) => {
    setNoteDrafts((currentDrafts) => ({
      ...currentDrafts,
      [action.id]: action.notes ?? "",
    }));
    setEditingNoteId(null);
    setAddingNoteId(null);
  };
  const handleDeleteNotes = async (action: AssessmentAction) => {
    setSavingActionId(action.id);
    setPageError(null);
    setSuccessMessage(null);
    try {
      const latestProgressUpdate = action.progress_updates[0];

      if (!latestProgressUpdate) {
        throw new Error("This progress update could not be found.");
      }

      const updatedAction = await deleteActionNotes(
        action.id,
        latestProgressUpdate.id,
      );
      setActions((currentActions) =>
        currentActions.map((currentAction) =>
          currentAction.id === updatedAction.id
            ? updatedAction
            : currentAction,
        ),
      );
      setNoteDrafts((currentDrafts) => ({
        ...currentDrafts,
        [action.id]: updatedAction.notes ?? "",
      }));
      setEditingNoteId(null);
      setAddingNoteId(null);
      setConfirmingDeleteId(null);
      setSuccessMessage("Progress note deleted.");
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to delete the progress note.",
      );
    } finally {
      setSavingActionId(null);
    }
  };
  const completedCount = actions.filter(
    (action) => action.status === "completed",
  ).length;
  const inProgressCount = actions.filter(
    (action) => action.status === "in_progress",
  ).length;
  const notStartedCount = actions.filter(
    (action) => action.status === "not_started",
  ).length;
  const completionPercentage =
    actions.length === 0
      ? 0
      : Math.round((completedCount / actions.length) * 100);
      const filteredActions =
  activeFilter === "all"
    ? actions
    : actions.filter(
        (action) => action.status === activeFilter,
      );
const filterOptions: Array<{
  value: ActionFilter;
  label: string;
  count: number;
}> = [
  {
    value: "all",
    label: "All",
    count: actions.length,
  },
  {
    value: "not_started",
    label: "To do",
    count: notStartedCount,
  },
  {
    value: "in_progress",
    label: "In progress",
    count: inProgressCount,
  },
  {
    value: "completed",
    label: "Completed",
    count: completedCount,
  },
];
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle
          size={36}
          className="animate-spin text-[#1379f4]"
          aria-label="Loading action plan"
        />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-6xl">
     <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
  <div>
    <div className="flex flex-wrap items-center gap-2 text-sm text-[#315aa8]">
      <button
        type="button"
        onClick={() => navigate("/reports")}
        className="font-bold transition hover:text-[#1379f4]"
      >
        Reports
      </button>
      <span>/</span>
      <button
        type="button"
        onClick={() => navigate("/recommendations")}
        className="font-bold transition hover:text-[#1379f4]"
      >
        Recommendations
      </button>
      <span>/</span>
      <span>Action plan</span>
    </div>
    <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#07143f] sm:text-4xl xl:text-[2.7rem]">
      Keep your action plan moving
    </h1>
    <p className="mt-3 max-w-3xl text-base leading-7 text-[#526fba] sm:text-lg">
      Update each action as your business makes progress.
    </p>
  </div>
  <div className="flex flex-col gap-3 sm:flex-row">
    <button
      type="button"
      onClick={() => navigate("/reports")}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#cbd9ef] bg-white px-5 py-3 font-extrabold text-[#25427f] transition hover:bg-[#f6f8fc]"
    >
      Review assessment report
    </button>

    <button
      type="button"
      onClick={() => navigate("/recommendations")}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-[#1379f4] bg-white px-5 py-3 font-extrabold text-[#1379f4] transition hover:bg-[#eef5ff]"
    >
      <ArrowLeft size={18} />
      View recommendations
    </button>
  </div>
</div>
     {actions.length > 0 && (
  <section className="mt-7 rounded-[18px] border border-[#cbd9ef] bg-white p-5 shadow-[0_10px_35px_rgba(37,66,127,.04)] sm:p-6">
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_1.5fr] xl:items-center">
      <div className="flex items-center gap-3 xl:border-r xl:border-[#d8e1ef]">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eaf0fa] text-xl font-black">
          {actions.length}
        </span>
        <span className="font-bold text-[#25427f]">
          Total actions
        </span>
      </div>
      <div className="flex items-center gap-3 xl:border-r xl:border-[#d8e1ef]">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff0ed] text-xl font-black text-[#ef382b]">
          {inProgressCount}
        </span>
        <span className="font-bold text-[#25427f]">
          In progress
        </span>
      </div>
      <div className="flex items-center gap-3 xl:border-r xl:border-[#d8e1ef]">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8f8df] text-xl font-black text-[#087a4d]">
          {completedCount}
        </span>
        <span className="font-bold text-[#25427f]">
          Completed
        </span>
      </div>
      <div className="flex items-center gap-3 xl:border-r xl:border-[#d8e1ef]">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf2fa] text-xl font-black">
          {notStartedCount}
        </span>
        <span className="font-bold text-[#25427f]">
          To do
        </span>
      </div>
      <div>
        <p className="font-black text-[#07143f]">
          {completionPercentage}% completed
        </p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#dfe6f1]">
          <div
            className="h-full rounded-full bg-[#79c70b] transition-all duration-500"
            style={{
              width: `${completionPercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  </section>
)}
      {pageError && (
        <p
          className="mt-6 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-semibold text-[#b42318]"
          role="alert"
        >
          {pageError}
        </p>
      )}
      {successMessage && (
        <p
          className="mt-6 rounded-xl bg-[#e8f8ef] px-4 py-3 text-sm font-semibold text-[#087a4d]"
          role="status"
        >
          {successMessage}
        </p>
      )}
      {actions.length > 0 && (
  <div className="mt-5 flex flex-wrap gap-2">
    {filterOptions.map((filter) => {
      const isActive = activeFilter === filter.value;
      return (
        <button
          key={filter.value}
          type="button"
          onClick={() => setActiveFilter(filter.value)}
          className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-extrabold transition ${
            isActive
              ? "border-[#a9c8ff] bg-[#cfe1ff] text-[#073383]"
              : "border-[#cbd9ef] bg-white text-[#25427f] hover:bg-[#eef5ff]"
          }`}
        >
          {filter.label}
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              isActive
                ? "bg-white/70"
                : "bg-[#edf2fa]"
            }`}
          >
            {filter.count}
          </span>
        </button>
      );
    })}
  </div>
)}
     {actions.length === 0 ? (
  <section className="card mt-8 p-8 text-center sm:p-12">
    <Target size={40} className="mx-auto text-[#ff5d49]" />
    <h2 className="mt-5 text-2xl font-extrabold">
      No recommended actions yet
    </h2>
    <p className="mx-auto mt-3 max-w-xl leading-7 text-[#66729b]">
      Complete your assessment and wait for the diagnosis to finish.
      Your recommended actions will appear here automatically.
    </p>
    <button
      type="button"
      className="btn-primary mt-6"
      onClick={() => navigate("/assessments")}
    >
      Go to assessments
    </button>
  </section>
) : filteredActions.length === 0 ? (
  <section className="mt-8 rounded-[20px] border border-dashed border-[#b8c8df] bg-white px-6 py-12 text-center">
    <Target size={36} className="mx-auto text-[#1379f4]" />
    <h2 className="mt-4 text-xl font-extrabold text-[#07143f]">
      No actions in this category
    </h2>
    <p className="mt-2 text-[#66729b]">
      Choose another filter to view the rest of your action plan.
    </p>
    <button
      type="button"
      className="btn-secondary mt-5"
      onClick={() => setActiveFilter("all")}
    >
      View all actions
    </button>
  </section>
) : (
  <div className="mt-8 grid gap-5">
    {filteredActions.map((action) => {
      const isSaving = savingActionId === action.id;
            return (
              <article
  id={`action-${action.id}`}
  key={action.id}
  className={`card scroll-mt-28 p-6 transition-all duration-500 sm:p-8 ${
    selectedActionId === action.id
      ? "ring-4 ring-[#ffb4aa] shadow-[0_20px_55px_rgba(255,93,73,.18)]"
      : ""
  }`}
>
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#eaf5ff] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#1379f4]">
                       Action {action.recommendation_index + 1}
                      </span>
                      <span className="rounded-full bg-[#fff0ed] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#b42318]">
                        {formatArea(action.business_area)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-extrabold ${statusStyles[action.status]}`}
                      >
                        {statusLabels[action.status]}
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-extrabold">
                      {action.title}
                    </h2>
                    <p className="mt-3 leading-7 text-[#52617e]">
                      {action.action_description}
                    </p>
                  </div>
                  <label className="grid min-w-[190px] gap-2 text-sm font-bold">
                    Status
                    <select
                      className="field"
                      value={action.status}
                      disabled={isSaving}
                      onChange={(event) =>
                        void handleStatusChange(
                          action.id,
                          event.target.value as ActionStatus,
                        )
                      }
                    >
                      <option value="not_started">Not started</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#f6f8fc] p-4">
                    <Clock3 size={20} className="text-[#1379f4]" />
                    <div>
                      <p className="text-xs font-bold uppercase text-[#66729b]">
                        Timeframe
                      </p>
                      <p className="mt-1 font-extrabold">
                        {action.timeframe}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-[#f6f8fc] p-4">
                    <CalendarDays
                      size={20}
                      className="text-[#1379f4]"
                    />
                    <div>
                      <p className="text-xs font-bold uppercase text-[#66729b]">
                        Target date
                      </p>
                      <p className="mt-1 font-extrabold">
                        {formatDate(action.target_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-[#f6f8fc] p-4">
                    {action.status === "completed" ? (
                      <CheckCircle2
                        size={20}
                        className="text-[#10a968]"
                      />
                    ) : action.status === "in_progress" ? (
                      <PlayCircle
                        size={20}
                        className="text-[#d69700]"
                      />
                    ) : (
                      <Circle
                        size={20}
                        className="text-[#66729b]"
                      />
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase text-[#66729b]">
                        Effort
                      </p>
                      <p className="mt-1 font-extrabold capitalize">
                        {action.effort}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-[#f6f8fc] p-4">
                    <History size={20} className="shrink-0 text-[#1379f4]" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase text-[#66729b]">
                        Latest update
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {formatDateTime(
                          action.progress_updates[0]?.created_at ?? null,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                {action.reason && (
                  <div className="mt-5 rounded-2xl bg-[#fff8f6] p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-[#66729b]">
                      Why this action
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#52617e]">
                      {action.reason}
                    </p>
                  </div>
                )}
                <div className="mt-6 border-t border-[#e4e9f2] pt-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <NotebookPen size={17} className="text-[#1379f4]" />
                      Progress history
                    </div>

                    {action.notes &&
                      editingNoteId !== action.id &&
                      addingNoteId !== action.id && (
                        <button
                          type="button"
                          className="btn-secondary"
                          disabled={isSaving}
                          onClick={() => handleAddProgress(action.id)}
                        >
                          <Plus size={17} />
                          Add progress update
                        </button>
                      )}
                  </div>

                  {editingNoteId === action.id ||
                  addingNoteId === action.id ||
                  !action.notes ? (
                    <div className="mt-4">
                      <textarea
                        className="field min-h-28 resize-y"
                        value={noteDrafts[action.id] ?? ""}
                        placeholder="Describe what you tried, what changed and what you will do next."
                        disabled={isSaving}
                        onChange={(event) =>
                          setNoteDrafts((currentDrafts) => ({
                            ...currentDrafts,
                            [action.id]: event.target.value,
                          }))
                        }
                      />

                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        {(editingNoteId === action.id ||
                          addingNoteId === action.id) && (
                          <button
                            type="button"
                            className="btn-secondary"
                            disabled={isSaving}
                            onClick={() => handleCancelEdit(action)}
                          >
                            <X size={17} />
                            Cancel
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={
                            isSaving ||
                            !(noteDrafts[action.id] ?? "").trim()
                          }
                          onClick={() => void handleSaveNotes(action.id)}
                        >
                          {isSaving ? (
                            <>
                              <LoaderCircle size={17} className="animate-spin" />
                              Saving...
                            </>
                          ) : editingNoteId === action.id ? (
                            "Save changes"
                          ) : (
                            "Save progress update"
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="rounded-2xl border border-[#dfe6f1] bg-[#f8faff] p-4 sm:p-5">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                          <p className="text-xs font-extrabold uppercase tracking-wide text-[#66729b]">
                            Latest improvement
                          </p>
                          <p className="text-xs font-semibold text-[#7a86a8]">
                            {formatDateTime(
                              action.progress_updates[0]?.created_at ??
                                action.updated_at,
                            )}
                          </p>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#52617e]">
                          {action.notes}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          className="btn-secondary"
                          disabled={isSaving}
                          onClick={() => handleEditNotes(action)}
                        >
                          <Pencil size={17} />
                          Edit latest update
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f4b4ac] bg-white px-4 py-3 font-bold text-[#b42318] transition hover:bg-[#fff0ed] disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isSaving}
                          onClick={() => setConfirmingDeleteId(action.id)}
                        >
                          <Trash2 size={17} />
                          Delete latest update
                        </button>
                      </div>

                      {action.progress_updates.length > 1 && (
                        <details className="mt-4 rounded-2xl border border-[#dfe6f1] bg-white">
                          <summary className="flex cursor-pointer list-none items-center gap-2 p-4 font-extrabold text-[#25427f]">
                            <History size={18} className="text-[#1379f4]" />
                            View {action.progress_updates.length - 1} earlier
                            progress update
                            {action.progress_updates.length - 1 === 1 ? "" : "s"}
                          </summary>
                          <div className="grid gap-3 border-t border-[#e4e9f2] p-4">
                            {action.progress_updates.slice(1).map((update) => (
                              <div
                                key={update.id}
                                className="rounded-xl bg-[#f8faff] p-4"
                              >
                                <p className="text-xs font-semibold text-[#7a86a8]">
                                  {formatDateTime(update.created_at)}
                                </p>
                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#52617e]">
                                  {update.progress_note}
                                </p>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      {confirmingDeleteId === action.id && (
                        <div className="mt-4 rounded-2xl border border-[#f4b4ac] bg-[#fff8f6] p-4">
                          <p className="font-extrabold text-[#07143f]">
                            Delete the latest progress update?
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[#66729b]">
                            Earlier updates will remain in the progress history.
                          </p>
                          <div className="mt-4 flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              className="btn-secondary"
                              disabled={isSaving}
                              onClick={() => setConfirmingDeleteId(null)}
                            >
                              <X size={17} />
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b42318] px-4 py-3 font-bold text-white transition hover:bg-[#8f1c13] disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isSaving}
                              onClick={() => void handleDeleteNotes(action)}
                            >
                              {isSaving ? (
                                <>
                                  <LoaderCircle size={17} className="animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 size={17} />
                                  Yes, delete update
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
