import type { UIMessage } from "ai";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { AiWorkingStepsExit } from "@/components/triage/AiWorkingSteps";
import { Tier1SnapshotCard } from "@/components/triage/Tier1SnapshotCard";
import { Tier2BreakdownPanel } from "@/components/triage/Tier2Breakdown";
import type { TriageResult } from "@/lib/triage/schemas";
import type { TriageStatus } from "@/hooks/useTriage";

export function TriagePanel({
  status,
  message,
  result,
  error,
}: {
  status: TriageStatus;
  message: UIMessage | null;
  result: TriageResult | null;
  error: string | null;
}) {
  const reduceMotion = useReducedMotion();

  if (status === "idle") return null;

  const showSnapshot = Boolean(result);
  const showWorking = !showSnapshot && (status === "streaming" || status === "ready");

  return (
    <div className="space-y-4">
      <AiWorkingStepsExit
        status={status}
        message={message}
        visible={showWorking}
      />

      {error && (
        <motion.p
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="snapshot"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              ease: [0.22, 1, 0.36, 1],
              delay: reduceMotion ? 0 : 0.08,
            }}
          >
            <div className="space-y-4">
              <Tier1SnapshotCard snapshot={result.tier1} />
              <Tier2BreakdownPanel tier2={result.tier2} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {status === "ready" && !result && !error && (
        <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Triage finished but the snapshot could not be parsed. Try again, or
          check the API response in the network tab.
        </p>
      )}
    </div>
  );
}
