import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Tier2Breakdown } from "@/lib/triage/schemas";
import { formatUsd } from "@/lib/triage/budget";
import { cn } from "@/lib/utils";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-medium text-foreground">{children}</h3>
  );
}

function hasTier2Content(tier2: Tier2Breakdown): boolean {
  return (
    tier2.requirements.length > 0 ||
    tier2.phases.length > 0 ||
    tier2.estimateRows.length > 0 ||
    tier2.risks.length > 0 ||
    tier2.assumptions.length > 0 ||
    tier2.clarifyingQuestions.length > 0 ||
    tier2.draftClientMessage.trim().length > 0
  );
}

export function Tier2BreakdownPanel({ tier2 }: { tier2: Tier2Breakdown }) {
  const [open, setOpen] = useState(true);

  if (!hasTier2Content(tier2)) return null;

  const estimateTotal = tier2.estimateRows.reduce(
    (sum, row) => sum + row.subtotal,
    0
  );

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/80 px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Detailed breakdown
          </p>
          <p className="text-xs text-muted-foreground">
            Scope, estimate, risks, and a draft first reply
          </p>
        </div>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-2">
            {open ? "Hide" : "Expand"}
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="space-y-8 px-6 py-6">
          {tier2.requirements.length > 0 && (
            <section className="space-y-3">
              <SectionTitle>Parsed requirements</SectionTitle>
              <ul className="space-y-2">
                {tier2.requirements.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-foreground"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tier2.phases.length > 0 && (
            <section className="space-y-3">
              <SectionTitle>Phase-by-phase scope</SectionTitle>
              <ul className="divide-y divide-border rounded-lg border border-border/80">
                {tier2.phases.map((phase) => (
                  <li
                    key={phase.name}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <span className="font-medium">{phase.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {phase.hours}h
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tier2.estimateRows.length > 0 && (
            <section className="space-y-3">
              <SectionTitle>Estimate</SectionTitle>
              <div className="overflow-x-auto rounded-lg border border-border/80">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Hours</th>
                      <th className="px-4 py-3 font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tier2.estimateRows.map((row) => (
                      <tr
                        key={`${row.role}-${row.hours}-${row.rate}`}
                        className="border-t border-border/60"
                      >
                        <td className="px-4 py-3 font-medium">{row.role}</td>
                        <td className="px-4 py-3 tabular-nums">{row.hours}</td>
                        <td className="px-4 py-3 tabular-nums font-medium">
                          {formatUsd(row.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-muted/30">
                      <td
                        colSpan={2}
                        className="px-4 py-3 text-right text-sm text-muted-foreground"
                      >
                        Total @ $35/hr
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums">
                        {formatUsd(estimateTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          )}

          {(tier2.risks.length > 0 || tier2.assumptions.length > 0) && (
            <section className="grid gap-6 md:grid-cols-2">
              {tier2.risks.length > 0 && (
                <div className="space-y-3">
                  <SectionTitle>Risks</SectionTitle>
                  <ul className="space-y-2 text-sm text-foreground">
                    {tier2.risks.map((risk) => (
                      <li
                        key={risk}
                        className="rounded-lg border border-destructive/15 bg-destructive/5 px-3 py-2"
                      >
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tier2.assumptions.length > 0 && (
                <div className="space-y-3">
                  <SectionTitle>Assumptions</SectionTitle>
                  <ul className="space-y-2 text-sm text-foreground">
                    {tier2.assumptions.map((assumption) => (
                      <li
                        key={assumption}
                        className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2"
                      >
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {tier2.clarifyingQuestions.length > 0 && (
            <section className="space-y-3">
              <SectionTitle>Clarifying questions</SectionTitle>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                {tier2.clarifyingQuestions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ol>
            </section>
          )}

          {tier2.draftClientMessage.trim().length > 0 && (
            <section className="space-y-3">
              <SectionTitle>Draft first-response message</SectionTitle>
              <div className="rounded-lg border border-border/80 bg-muted/20 px-5 py-4">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-3 text-sm leading-relaxed text-foreground last:mb-0">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-3 list-disc space-y-1 pl-5 text-sm last:mb-0">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm last:mb-0">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {tier2.draftClientMessage}
                </ReactMarkdown>
              </div>
            </section>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
