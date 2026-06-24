import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import type { Tier2Breakdown } from "@/lib/triage/schemas";
import { formatUsd } from "@/lib/triage/budget";
import { cn } from "@/lib/utils";

const PHASE_COLORS = [
  "hsl(26 85% 55%)",
  "hsl(208 58% 49%)",
  "hsl(190 80% 40%)",
  "hsl(245 56% 56%)",
  "hsl(37 100% 50%)",
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </h3>
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

function PhaseHoursChart({
  phases,
}: {
  phases: Tier2Breakdown["phases"];
}) {
  const data = phases.map((phase) => ({
    name: phase.name,
    hours: phase.hours,
  }));

  return (
    <div className="h-52 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 13% 91%)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={56}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            cursor={{ fill: "hsl(214 32% 97%)" }}
            formatter={(value) => [`${value}h`, "Hours"]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(220 13% 91%)",
              fontSize: 12,
            }}
          />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PHASE_COLORS[index % PHASE_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Tier2BreakdownPanel({ tier2 }: { tier2: Tier2Breakdown }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  if (!hasTier2Content(tier2)) return null;

  const estimateTotal = tier2.estimateRows.reduce(
    (sum, row) => sum + row.subtotal,
    0
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border/80 px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Detailed breakdown
          </p>
          <p className="text-xs text-muted-foreground">
            Scope, estimate, risks, and a draft first reply
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {open ? "Hide" : "Expand"}
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
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
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-coral" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {tier2.phases.length > 0 && (
                <section className="space-y-4">
                  <SectionTitle>Phase-by-phase scope</SectionTitle>
                  <PhaseHoursChart phases={tier2.phases} />
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {tier2.phases.map((phase) => (
                      <li
                        key={phase.name}
                        className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm"
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
                  <SectionTitle>Estimate table</SectionTitle>
                  <div className="overflow-x-auto rounded-lg border border-border/80">
                    <table className="w-full min-w-[420px] text-left text-sm">
                      <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Role</th>
                          <th className="px-4 py-3 font-medium">Hours</th>
                          <th className="px-4 py-3 font-medium">Rate</th>
                          <th className="px-4 py-3 font-medium">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tier2.estimateRows.map((row) => (
                          <tr
                            key={`${row.role}-${row.hours}`}
                            className="border-t border-border/60"
                          >
                            <td className="px-4 py-3 font-medium">{row.role}</td>
                            <td className="px-4 py-3 tabular-nums">{row.hours}</td>
                            <td className="px-4 py-3 tabular-nums">
                              {formatUsd(row.rate)}/hr
                            </td>
                            <td className="px-4 py-3 tabular-nums font-medium">
                              {formatUsd(row.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border bg-muted/30">
                          <td
                            colSpan={3}
                            className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground"
                          >
                            Total
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
                  <SectionTitle>Clarifying questions for the client</SectionTitle>
                  <ol className="space-y-2">
                    {tier2.clarifyingQuestions.map((question, index) => (
                      <li
                        key={question}
                        className="flex gap-3 rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm leading-relaxed"
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-intel-indigo/10 text-xs font-semibold text-intel-indigo">
                          {index + 1}
                        </span>
                        <span>{question}</span>
                      </li>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
