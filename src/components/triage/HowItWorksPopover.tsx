import type { UIMessage } from "ai";
import { CircleHelp } from "lucide-react";

import {
  buildWorkingSteps,
  type WorkingStepId,
} from "@/components/triage/AiWorkingSteps";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TriageStatus } from "@/hooks/useTriage";
import { cn } from "@/lib/utils";

const BEHIND_THE_SCENES: {
  id: WorkingStepId;
  title: string;
  detail: string;
}[] = [
  {
    id: "read",
    title: "Read the brief",
    detail: "Domain, features, timeline, and budget hints",
  },
  {
    id: "search",
    title: "Match SJI portfolio",
    detail: "12 real projects searched by meaning, not keywords",
  },
  {
    id: "match",
    title: "Route to POD",
    detail: "Picks the internal team that fits the stack",
  },
  {
    id: "budget",
    title: "Size hours & budget",
    detail: "Hours from similar work × $35/hr rate card",
  },
  {
    id: "write",
    title: "Build snapshot",
    detail: "Fit verdict, scope, and draft client reply",
  },
];

const OUTCOMES = [
  {
    title: "Snapshot",
    detail: "Fit verdict, budget range, POD, similar projects, biggest risk",
  },
  {
    title: "Breakdown",
    detail: "Phases, estimate, risks, clarifying questions, draft reply",
  },
];

function activeStepId(
  status: TriageStatus,
  message: UIMessage | null
): WorkingStepId | null {
  if (status !== "streaming") return null;
  const steps = buildWorkingSteps(status, message);
  const active = steps.find((step) => step.state === "active");
  return active?.id ?? null;
}

export function HowItWorksPopover({
  status,
  message,
}: {
  status: TriageStatus;
  message: UIMessage | null;
}) {
  const currentStep = activeStepId(status, message);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0 rounded-full"
          aria-label="How it works"
        >
          <CircleHelp className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">How it works</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            What happens behind the scenes — and what you get
          </p>
        </div>

        <div className="space-y-4 px-4 py-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Behind the scenes
            </p>
            <ol className="mt-2 space-y-2.5">
              {BEHIND_THE_SCENES.map((step, index) => {
                const isActive = currentStep === step.id;
                const isDone =
                  currentStep !== null &&
                  BEHIND_THE_SCENES.findIndex((s) => s.id === currentStep) >
                    index;

                return (
                  <li key={step.id} className="flex gap-3">
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        isActive &&
                          "bg-primary text-primary-foreground ring-2 ring-primary/20",
                        isDone && !isActive && "bg-muted text-muted-foreground",
                        !isActive &&
                          !isDone &&
                          "border border-border bg-background text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span
                        className={cn(
                          "block text-sm font-medium leading-none",
                          isActive && "text-foreground"
                        )}
                      >
                        {step.title}
                      </span>
                      <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                        {step.detail}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground">
              You get
            </p>
            <ul className="mt-2 space-y-2">
              {OUTCOMES.map((outcome) => (
                <li key={outcome.title} className="text-sm">
                  <span className="font-medium text-foreground">
                    {outcome.title}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {outcome.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
            Budget numbers come from our rate card and past project hours — the
            AI does not invent prices.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
