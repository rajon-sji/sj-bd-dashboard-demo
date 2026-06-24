import { BriefInputShell } from "@/components/triage/BriefInputShell";

export default function TriageCopilotPage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,hsl(190_80%_40%_/_.08),transparent_60%)]"
        aria-hidden
      />
      <div className="relative flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <BriefInputShell />
      </div>
    </div>
  );
}
