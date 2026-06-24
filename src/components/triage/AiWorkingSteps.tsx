import type { UIMessage } from "ai";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import type { TriageStatus } from "@/hooks/useTriage";
import { cn } from "@/lib/utils";

export type WorkingStepId =
  | "read"
  | "search"
  | "match"
  | "budget"
  | "write";

export type WorkingStep = {
  id: WorkingStepId;
  label: string;
  detail?: string;
  state: "pending" | "active" | "done";
};

const CANONICAL_LABELS: Record<WorkingStepId, string> = {
  read: "Reading the brief…",
  search: "Finding similar SJI projects…",
  match: "Matching tech stack & team…",
  budget: "Sizing scope & budget…",
  write: "Writing your snapshot…",
};

function isToolPart(
  part: UIMessage["parts"][number]
): part is UIMessage["parts"][number] & {
  type: `tool-${string}`;
  state?: string;
  toolCallId?: string;
  input?: unknown;
  output?: unknown;
} {
  return part.type.startsWith("tool-");
}

function getToolParts(message: UIMessage | null) {
  return message?.parts.filter(isToolPart) ?? [];
}

function getSearchQuery(part: unknown): string | undefined {
  if (!part || typeof part !== "object" || !("input" in part)) return undefined;
  const input = (part as { input?: unknown }).input;
  if (!input || typeof input !== "object") return undefined;
  const query = (input as { query?: unknown }).query;
  return typeof query === "string" && query.trim() ? query.trim() : undefined;
}

function getSearchMatchCount(part: unknown): number | undefined {
  if (
    !part ||
    typeof part !== "object" ||
    !("output" in part) ||
    !Array.isArray((part as { output?: unknown }).output)
  ) {
    return undefined;
  }
  return (part as { output: unknown[] }).output.length;
}

export function buildWorkingSteps(
  status: TriageStatus,
  message: UIMessage | null
): WorkingStep[] {
  const toolParts = getToolParts(message);
  const searches = toolParts.filter(
    (part) => part.type === "tool-search_past_projects"
  );
  const pods = toolParts.filter((part) => part.type === "tool-get_pods");
  const rateCards = toolParts.filter((part) => part.type === "tool-get_rate_card");
  const budgets = toolParts.filter((part) => part.type === "tool-calculate_budget");

  const hasText =
    message?.parts.some(
      (part) => part.type === "text" && part.text.trim().length > 0
    ) ?? false;

  const readDone =
    status === "ready" || toolParts.length > 0 || hasText;
  const readActive = status === "streaming" && !readDone;

  const searchDone =
    searches.length > 0 &&
    searches.every((part) => part.state === "output-available");
  const searchActive =
    searches.some((part) => part.state !== "output-available") ||
    (readDone && !searchDone && status === "streaming" && searches.length === 0);

  const lastSearch = searches[searches.length - 1];
  const searchQuery = lastSearch ? getSearchQuery(lastSearch) : undefined;
  const totalMatches = searches.reduce((sum, part) => {
    if (part.state !== "output-available") return sum;
    return sum + (getSearchMatchCount(part) ?? 0);
  }, 0);

  let searchDetail: string | undefined;
  if (searchDone && totalMatches > 0) {
    searchDetail = `✓ ${totalMatches} match${totalMatches === 1 ? "" : "es"} found`;
  } else if (searchActive && searchQuery) {
    searchDetail = `Finding projects like: “${searchQuery}”`;
  }

  const matchTools = [...pods, ...rateCards];
  const matchDone =
    matchTools.length > 0 &&
    matchTools.every((part) => part.state === "output-available");
  const matchActive =
    matchTools.some((part) => part.state !== "output-available") ||
    (searchDone && !matchDone && status === "streaming" && matchTools.length === 0);

  const budgetDone =
    budgets.length > 0 &&
    budgets.every((part) => part.state === "output-available");
  const budgetActive =
    budgets.some((part) => part.state !== "output-available") ||
    (matchDone && !budgetDone && status === "streaming" && budgets.length === 0);

  const writeDone = status === "ready";
  const writeActive =
    status === "streaming" && (hasText || (budgetDone && !writeDone));

  const states: Record<WorkingStepId, WorkingStep["state"]> = {
    read: readActive ? "active" : readDone ? "done" : "pending",
    search: searchActive ? "active" : searchDone ? "done" : "pending",
    match: matchActive ? "active" : matchDone ? "done" : "pending",
    budget: budgetActive ? "active" : budgetDone ? "done" : "pending",
    write: writeActive ? "active" : writeDone ? "done" : "pending",
  };

  return (Object.keys(CANONICAL_LABELS) as WorkingStepId[]).map((id) => ({
    id,
    label: CANONICAL_LABELS[id],
    state: states[id],
    detail: id === "search" ? searchDetail : undefined,
  }));
}

function PendingIcon() {
  return (
    <span
      className="size-[18px] shrink-0 rounded-full border border-border/80 bg-background"
      aria-hidden
    />
  );
}

function ActiveIcon({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <span
      className="relative flex size-[18px] shrink-0 items-center justify-center"
      aria-hidden
    >
      <span className="absolute inset-0 rounded-full bg-brand-coral/15" />
      {!reduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-full border border-brand-coral/40"
          animate={{ scale: [1, 1.35], opacity: [0.55, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <svg viewBox="0 0 18 18" className="size-[18px] text-brand-coral">
        <circle
          cx="9"
          cy="9"
          r="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.2"
        />
        <path
          d="M9 2 A 7 7 0 0 1 16 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function DoneIcon({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.span
      className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-intel-teal/15"
      initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <Check className="size-3.5 text-intel-teal" strokeWidth={2.5} />
    </motion.span>
  );
}

function StepIcon({
  state,
  reduceMotion,
}: {
  state: WorkingStep["state"];
  reduceMotion: boolean;
}) {
  if (state === "done") return <DoneIcon reduceMotion={reduceMotion} />;
  if (state === "active") return <ActiveIcon reduceMotion={reduceMotion} />;
  return <PendingIcon />;
}

function WorkingStepRow({
  step,
  index,
  compact,
  reduceMotion,
  isLast,
}: {
  step: WorkingStep;
  index: number;
  compact: boolean;
  reduceMotion: boolean;
  isLast: boolean;
}) {
  const isActive = step.state === "active";
  const isDone = step.state === "done";

  return (
    <motion.li
      className="relative flex items-start gap-3"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.35,
        delay: reduceMotion ? 0 : index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {!isLast && (
        <span
          className={cn(
            "absolute left-[8px] top-[22px] w-px",
            compact ? "bottom-[-10px]" : "bottom-[-14px]",
            isDone ? "bg-intel-teal/40" : "bg-border"
          )}
          aria-hidden
        />
      )}

      <StepIcon state={step.state} reduceMotion={reduceMotion} />

      <div className="min-w-0 pb-1">
        <p
          className={cn(
            "font-medium transition-colors duration-300",
            compact ? "text-xs" : "text-sm",
            isActive && "text-foreground",
            isDone && "text-foreground",
            step.state === "pending" && "text-muted-foreground/70"
          )}
        >
          {step.label}
        </p>
        {step.detail && (
          <motion.p
            className={cn(
              "mt-0.5 leading-relaxed",
              compact ? "text-xs" : "text-sm",
              isDone
                ? "font-medium text-intel-teal"
                : "text-intel-indigo"
            )}
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            {step.detail}
          </motion.p>
        )}
      </div>
    </motion.li>
  );
}

export function AiWorkingSteps({
  status,
  message,
  compact = false,
}: {
  status: TriageStatus;
  message: UIMessage | null;
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const steps = buildWorkingSteps(status, message);
  const activeIndex = steps.findIndex((step) => step.state === "active");

  return (
    <motion.section
      layout
      className={cn(
        "relative overflow-hidden rounded-xl border shadow-sm",
        compact
          ? "border-border/60 bg-muted/30 px-4 py-3"
          : "border-border bg-card p-6"
      )}
      aria-live="polite"
      aria-busy={status === "streaming"}
    >
      {!compact && (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,hsl(190_80%_40%_/_.06),transparent_45%,hsl(245_56%_56%_/_.05))]"
            aria-hidden
          />
          <div className="relative mb-5 flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-intel-teal">
              AI working
            </p>
            {status === "streaming" && activeIndex >= 0 && (
              <motion.p
                className="text-xs text-muted-foreground"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                key={activeIndex}
              >
                Step {activeIndex + 1} of {steps.length}
              </motion.p>
            )}
          </div>
        </>
      )}

      <ol className={cn("relative", compact ? "space-y-2" : "space-y-4")}>
        {steps.map((step, index) => (
          <WorkingStepRow
            key={step.id}
            step={step}
            index={index}
            compact={compact}
            reduceMotion={Boolean(reduceMotion)}
            isLast={index === steps.length - 1}
          />
        ))}
      </ol>
    </motion.section>
  );
}

export function AiWorkingStepsExit({
  status,
  message,
  visible,
}: {
  status: TriageStatus;
  message: UIMessage | null;
  visible: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="working-steps"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -6, transition: { duration: 0.25 } }
          }
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <AiWorkingSteps status={status} message={message} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
