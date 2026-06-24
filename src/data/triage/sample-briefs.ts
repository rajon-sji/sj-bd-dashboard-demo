export type BriefSource = "upwork" | "direct" | "recurring";

export type SampleBrief = {
  id: BriefSource;
  label: string;
  source: BriefSource;
  text: string;
};

export const sampleBriefs: SampleBrief[] = [
  {
    id: "upwork",
    label: "Upwork post",
    source: "upwork",
    text: `Looking for an experienced team to build a B2B SaaS dashboard for insurance brokers.

We need:
- Pipeline view for loan/application stages
- Integration with our existing LOS (Encompass or similar)
- Role-based access for loan officers vs managers
- Email reminders for stale deals
- Must be HIPAA-aware

Budget: $15k–25k. Timeline: 8–10 weeks.
Please share similar work and your recommended stack.`,
  },
  {
    id: "direct",
    label: "Client email",
    source: "direct",
    text: `Hi team,

We're a regional skincare brand exploring a storefront refresh before Q4. Our current WordPress/Woo setup struggles during campaign spikes and the merchandising workflow is painful for our marketing team.

Ideally we'd keep WordPress but need better performance, cleaner product templates, and something our team can update without dev help every week.

Can you ballpark scope and timeline for a discovery call next week?

Thanks,
Maria`,
  },
  {
    id: "recurring",
    label: "Recurring feature",
    source: "recurring",
    text: `Hey — quick one for the IVolunteer platform.

Nonprofit admins want volunteer hour certificates auto-generated at month end (PDF with logo, hours, opportunity name). We already have hours logged in the DB.

Rough ask:
- Admin toggles per-org
- Template with merge fields
- Batch job on the 1st
- Email delivery optional

Not huge but needs to fit our existing React/Node stack. What would you charge and how long?`,
  },
];

export const sourceLabels: Record<BriefSource, string> = {
  upwork: "Upwork",
  direct: "Direct client",
  recurring: "Recurring client",
};
