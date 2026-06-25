import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Pencil, RotateCcw, Sparkles } from "lucide-react";

import { TriagePanel } from "@/components/triage/TriagePanel";
import { HowItWorksPopover } from "@/components/triage/HowItWorksPopover";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTriage } from "@/hooks/useTriage";
import { loadTriageSession } from "@/lib/triage/session-storage";
import {
  sampleBriefs,
  sourceLabels,
  type BriefSource,
} from "@/data/triage/sample-briefs";
import { cn } from "@/lib/utils";

function briefPreview(text: string, max = 140): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

export function BriefInputShell() {
  const restored = loadTriageSession();
  const [brief, setBrief] = useState(restored?.brief ?? "");
  const [source, setSource] = useState<BriefSource | "">(
    restored?.source ?? ""
  );
  const [inputExpanded, setInputExpanded] = useState(!restored?.result);

  const handleSessionClear = useCallback(() => {
    setBrief("");
    setSource("");
    setInputExpanded(true);
  }, []);

  const { message, result, status, error, triage, reset, hasSavedSession } =
    useTriage(brief, source, handleSessionClear);

  const isStreaming = status === "streaming";
  const canSubmit = brief.trim().length > 0 && !isStreaming;
  const hasSnapshot = Boolean(result);
  const showClearButton =
    hasSnapshot || status === "ready" || status === "error";
  const collapseInput = hasSnapshot && !isStreaming;

  useEffect(() => {
    if (hasSnapshot && !isStreaming) {
      setInputExpanded(false);
    }
  }, [hasSnapshot, isStreaming]);

  function loadSample(id: BriefSource) {
    const sample = sampleBriefs.find((b) => b.id === id);
    if (!sample) return;
    reset();
    setBrief(sample.text);
    setSource(sample.source);
    setInputExpanded(true);
  }

  function handleStartNew() {
    reset();
    setInputExpanded(true);
  }

  async function handleTriage() {
    if (!canSubmit) return;
    try {
      await triage(brief);
    } catch (caught) {
      console.error("[triage]", caught);
    }
  }

  const inputForm = (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="brief" className="text-sm font-medium text-foreground">
          Project brief
        </label>
        <Select
          value={source || undefined}
          onValueChange={(value) => setSource(value as BriefSource)}
          disabled={isStreaming}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Brief source">
            <SelectValue placeholder="Source (optional)" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(sourceLabels) as BriefSource[]).map((key) => (
              <SelectItem key={key} value={key}>
                {sourceLabels[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Textarea
        id="brief"
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        placeholder="Paste an Upwork post, client email, or feature request…"
        rows={collapseInput ? 6 : 12}
        className={cn(
          "resize-y text-base leading-relaxed",
          collapseInput ? "min-h-32" : "min-h-48"
        )}
        disabled={isStreaming}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {sampleBriefs.map((sample) => (
            <Button
              key={sample.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadSample(sample.id)}
              disabled={isStreaming}
            >
              Try: {sample.label}
            </Button>
          ))}
        </div>
        <Button type="button" disabled={!canSubmit} onClick={handleTriage}>
          {isStreaming ? "Triaging…" : "Triage brief"}
        </Button>
      </div>

      {!brief.trim() && status === "idle" && (
        <p className="text-sm text-muted-foreground">
          Paste a brief to get started, or load a sample above.
        </p>
      )}
    </section>
  );

  return (
    <div
      className={`mx-auto flex w-full flex-col gap-6 ${hasSnapshot ? "max-w-4xl" : "max-w-3xl"}`}
    >
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5" aria-hidden />
            SJ Innovation · BD
          </div>
          <div className="flex items-center gap-2">
            <HowItWorksPopover status={status} message={message} />
            {showClearButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartNew}
                disabled={isStreaming}
                className="gap-2"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Start new brief
              </Button>
            )}
          </div>
        </div>
        {!hasSnapshot && (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              BD Triage Copilot
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              Paste a messy brief. Get a grounded first-response snapshot in
              seconds — backed by real SJI projects.
            </p>
          </>
        )}
        {hasSavedSession && hasSnapshot && !inputExpanded && (
          <p className="text-xs text-muted-foreground">
            Last triage saved in this browser until you start a new brief.
          </p>
        )}
      </header>

      {collapseInput ? (
        <Collapsible open={inputExpanded} onOpenChange={setInputExpanded}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-start gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50"
            >
              <Pencil className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-muted-foreground">
                  Brief
                  {source ? ` · ${sourceLabels[source]}` : ""}
                </span>
                <span className="mt-0.5 block text-sm text-foreground">
                  {briefPreview(brief)}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  inputExpanded && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">{inputForm}</CollapsibleContent>
        </Collapsible>
      ) : (
        inputForm
      )}

      <TriagePanel
        status={status}
        message={message}
        result={result}
        error={error}
      />
    </div>
  );
}
