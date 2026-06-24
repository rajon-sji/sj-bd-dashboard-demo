import { useState } from "react";
import { Sparkles } from "lucide-react";

import { TriagePanel } from "@/components/triage/TriagePanel";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTriage } from "@/hooks/useTriage";
import {
  sampleBriefs,
  sourceLabels,
  type BriefSource,
} from "@/data/triage/sample-briefs";

export function BriefInputShell() {
  const [brief, setBrief] = useState("");
  const [source, setSource] = useState<BriefSource | "">("");
  const { message, result, status, error, triage, reset } = useTriage(source);

  const isStreaming = status === "streaming";
  const canSubmit = brief.trim().length > 0 && !isStreaming;
  const hasSnapshot = Boolean(result);

  function loadSample(id: BriefSource) {
    const sample = sampleBriefs.find((b) => b.id === id);
    if (!sample) return;
    setBrief(sample.text);
    setSource(sample.source);
    reset();
  }

  async function handleTriage() {
    if (!canSubmit) return;
    await triage(brief);
  }

  return (
    <div
      className={`mx-auto flex w-full flex-col gap-8 ${hasSnapshot ? "max-w-4xl" : "max-w-3xl"}`}
    >
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-brand-coral-tint px-3 py-1 text-xs font-medium text-brand-blue-deep">
          <Sparkles className="size-3.5 text-brand-coral" aria-hidden />
          SJ Innovation · Business Development
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          BD Triage Copilot
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          Paste a messy brief. Get a grounded first-response snapshot in
          seconds — backed by real SJI projects.
        </p>
      </header>

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
          rows={12}
          className="min-h-48 resize-y text-base leading-relaxed"
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
          <Button
            type="button"
            disabled={!canSubmit}
            className="shrink-0 bg-brand-coral hover:bg-brand-coral-strong"
            onClick={handleTriage}
          >
            {isStreaming ? "Triaging…" : "Triage brief"}
          </Button>
        </div>

        {!brief.trim() && status === "idle" && (
          <p className="text-sm text-muted-foreground">
            Paste a brief to get started, or load a sample above.
          </p>
        )}
      </section>

      <TriagePanel
        status={status}
        message={message}
        result={result}
        error={error}
      />
    </div>
  );
}
