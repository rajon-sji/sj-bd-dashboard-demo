import type { Tier1Snapshot } from "@/lib/triage/schemas";
import { formatUsd } from "@/lib/triage/budget";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const verdictTheme = {
  "Strong fit": {
    text: "text-emerald-700 dark:text-emerald-400",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    accent: "border-l-emerald-500",
  },
  "Possible fit": {
    text: "text-amber-700 dark:text-amber-400",
    badge: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
    accent: "border-l-amber-500",
  },
  "Poor fit": {
    text: "text-destructive",
    badge: "border-destructive/30 bg-destructive/10 text-destructive",
    accent: "border-l-destructive",
  },
} as const;

function MatchBadge({ percent }: { percent: number }) {
  return (
    <Badge variant="secondary" className="tabular-nums">
      {percent}% match
    </Badge>
  );
}

export function Tier1SnapshotCard({ snapshot }: { snapshot: Tier1Snapshot }) {
  const theme = verdictTheme[snapshot.verdict];

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        "border-l-4",
        theme.accent
      )}
      aria-label="Triage result"
    >
      <header className="border-b border-border/80 px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <h2
              className={cn(
                "text-4xl font-bold tracking-tight sm:text-5xl",
                theme.text
              )}
            >
              {snapshot.verdict}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={theme.badge}>
                {snapshot.projectType}
              </Badge>
              <Badge variant="secondary">
                {snapshot.confidence} confidence
              </Badge>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              {snapshot.verdictReason}
            </p>
          </div>
        </div>
      </header>

      <dl className="grid gap-4 border-b border-border/80 px-6 py-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Domain</dt>
          <dd className="mt-0.5 font-medium text-foreground">{snapshot.domain}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Scope</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {snapshot.scopeSize}
            <span className="font-normal text-muted-foreground">
              {" "}
              · {snapshot.hoursBand}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Route to</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {snapshot.routeToPod}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Budget range</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {formatUsd(snapshot.budgetMin)} – {formatUsd(snapshot.budgetMax)}
            <span className="block text-sm font-normal text-muted-foreground">
              $35/hr × estimated hours
            </span>
          </dd>
        </div>
      </dl>

      <div className="border-b border-border/80 px-6 py-5">
        <h3 className="text-sm font-medium text-foreground">Suggested stack</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {snapshot.suggestedStack.map((tech) => (
            <li key={tech}>
              <Badge variant="outline">{tech}</Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-b border-border/80 bg-muted/20 px-6 py-5">
        <h3 className="text-sm font-medium text-foreground">
          Similar SJI projects
        </h3>
        {snapshot.groundedProjects.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {snapshot.groundedProjects.map((project) => (
              <li
                key={project.slug}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2.5"
              >
                <span className="text-sm font-medium text-foreground">
                  {project.title}
                </span>
                <MatchBadge percent={project.matchPercent} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            No close portfolio matches — try a broader brief.
          </p>
        )}
      </div>

      <footer className="px-6 py-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Biggest risk:</span>{" "}
          {snapshot.biggestRisk}
        </p>
      </footer>
    </article>
  );
}
