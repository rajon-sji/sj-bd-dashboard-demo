import type { Tier1Snapshot } from "@/lib/triage/schemas";
import { formatUsd } from "@/lib/triage/budget";
import { cn } from "@/lib/utils";

const verdictStyles = {
  "Strong fit": {
    badge: "bg-intel-teal/10 text-intel-teal border-intel-teal/20",
    accent: "border-l-intel-teal",
  },
  "Possible fit": {
    badge: "bg-brand-coral-tint text-brand-blue-deep border-brand-amber/30",
    accent: "border-l-brand-amber",
  },
  "Poor fit": {
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    accent: "border-l-destructive",
  },
} as const;

const confidenceStyles = {
  High: "text-intel-teal",
  Medium: "text-brand-blue",
  Low: "text-muted-foreground",
} as const;

function MatchBadge({ percent }: { percent: number }) {
  const tone =
    percent >= 75
      ? "bg-intel-indigo/10 text-intel-indigo border-intel-indigo/20"
      : percent >= 50
        ? "bg-brand-blue/10 text-brand-blue border-brand-blue/20"
        : "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex min-w-11 shrink-0 items-center justify-center rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums",
        tone
      )}
    >
      {percent}%
    </span>
  );
}

function StatCell({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border/80 bg-muted/30 px-4 py-3">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold leading-snug text-foreground">
        {value}
      </dd>
      {sub && (
        <dd className="mt-0.5 text-xs text-muted-foreground">{sub}</dd>
      )}
    </div>
  );
}

export function Tier1SnapshotCard({ snapshot }: { snapshot: Tier1Snapshot }) {
  const verdict = verdictStyles[snapshot.verdict];

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        "border-l-4",
        verdict.accent
      )}
      aria-label="First-response snapshot"
    >
      <header className="border-b border-border/80 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              First-response snapshot
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {snapshot.verdict}
              </h2>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  verdict.badge
                )}
              >
                {snapshot.projectType}
              </span>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {snapshot.verdictReason}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Confidence
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-semibold",
                confidenceStyles[snapshot.confidence]
              )}
            >
              {snapshot.confidence}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCell label="Domain" value={snapshot.domain} />
        <StatCell
          label="Scope"
          value={snapshot.scopeSize}
          sub={snapshot.hoursBand}
        />
        <StatCell label="Route to" value={snapshot.routeToPod} />
        <StatCell
          label="Budget range"
          value={`${formatUsd(snapshot.budgetMin)} – ${formatUsd(snapshot.budgetMax)}`}
        />
      </div>

      <div className="border-t border-border/80 px-6 py-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Suggested stack
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {snapshot.suggestedStack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border/80 bg-muted/20 px-6 py-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Grounded in {snapshot.groundedProjects.length} similar SJI project
          {snapshot.groundedProjects.length === 1 ? "" : "s"}
        </p>
        <ul className="mt-3 space-y-2">
          {snapshot.groundedProjects.map((project) => (
            <li
              key={project.slug}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5"
            >
              <MatchBadge percent={project.matchPercent} />
              <span className="min-w-0 text-sm font-medium text-foreground">
                {project.title}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="border-t border-border/80 px-6 py-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Biggest risk:</span>{" "}
          {snapshot.biggestRisk}
        </p>
      </footer>
    </article>
  );
}
