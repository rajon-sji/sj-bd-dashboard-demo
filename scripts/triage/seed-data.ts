export type ProjectPhase = {
  name: string;
  hours: number;
};

export type SeedProject = {
  slug: string;
  title: string;
  client_type: string;
  domain: string;
  problem: string;
  solution: string;
  tech_stack: string[];
  phases: ProjectPhase[];
  total_hours: number;
};

export type SeedPod = {
  slug: string;
  name: string;
  specialties: string[];
  description: string;
};

export type SeedRate = {
  role: string;
  hourly_rate: number;
};

export const seedPods: SeedPod[] = [
  {
    slug: "enterprise-web",
    name: "Enterprise Web POD",
    specialties: ["Next.js", "React", "Node.js", "TypeScript", "PostgreSQL"],
    description:
      "Full-stack web applications, SaaS platforms, and complex CMS-backed sites.",
  },
  {
    slug: "mobile",
    name: "Mobile POD",
    specialties: ["React Native", "iOS", "Swift", "Android", "Kotlin"],
    description: "Native and cross-platform mobile apps for iOS and Android.",
  },
  {
    slug: "ai-automation",
    name: "AI & Automation POD",
    specialties: ["Python", "Gemini", "LangChain", "RAG", "Agentic AI"],
    description:
      "AI copilots, workflow automation, RAG systems, and intelligent agents.",
  },
  {
    slug: "wordpress-cms",
    name: "WordPress & CMS POD",
    specialties: ["WordPress", "PHP", "WooCommerce", "Headless CMS"],
    description: "Marketing sites, eCommerce, and content-heavy web properties.",
  },
  {
    slug: "cloud-devops",
    name: "Cloud & DevOps POD",
    specialties: ["AWS", "Terraform", "CI/CD", "Docker", "Kubernetes"],
    description: "Cloud migration, infrastructure, and deployment pipelines.",
  },
];

export const seedRateCard: SeedRate[] = [
  { role: "Senior Engineer", hourly_rate: 110 },
  { role: "Mid Engineer", hourly_rate: 85 },
  { role: "Junior Engineer", hourly_rate: 65 },
  { role: "Project Manager", hourly_rate: 90 },
  { role: "UI/UX Designer", hourly_rate: 85 },
  { role: "QA Engineer", hourly_rate: 70 },
  { role: "DevOps Engineer", hourly_rate: 105 },
  { role: "AI/ML Engineer", hourly_rate: 120 },
];

/** Real SJI portfolio names + realistic augmented scope/hours for budget anchoring. */
export const seedProjects: SeedProject[] = [
  {
    slug: "neutrogena-ecommerce",
    title: "Neutrogena eCommerce",
    client_type: "Enterprise",
    domain: "eCommerce / Consumer Goods",
    problem:
      "Legacy storefront couldn't handle seasonal traffic spikes or support modern merchandising workflows for a global skincare brand.",
    solution:
      "Rebuilt the commerce experience on WordPress/WooCommerce with performance tuning, CDN caching, and a modular product catalog integrated with marketing campaigns.",
    tech_stack: ["WordPress", "WooCommerce", "PHP", "JavaScript", "AWS"],
    phases: [
      { name: "Discovery & UX", hours: 80 },
      { name: "Platform build", hours: 320 },
      { name: "Integrations & launch", hours: 120 },
      { name: "QA & hardening", hours: 80 },
    ],
    total_hours: 600,
  },
  {
    slug: "frasada-custom-website",
    title: "Frasada Custom Website",
    client_type: "Direct client",
    domain: "Real Estate / Marketing",
    problem:
      "Brokerage needed a premium brand site with property search, lead capture, and easy content updates for the marketing team.",
    solution:
      "Custom WordPress theme with IDX-style property listings, CRM lead routing, and an editor-friendly page builder for campaigns.",
    tech_stack: ["WordPress", "PHP", "JavaScript", "MySQL"],
    phases: [
      { name: "Brand & IA", hours: 40 },
      { name: "Design & build", hours: 200 },
      { name: "Lead capture & SEO", hours: 60 },
      { name: "Launch", hours: 40 },
    ],
    total_hours: 340,
  },
  {
    slug: "igotcoderz-education",
    title: "Igotcoderz",
    client_type: "Direct client",
    domain: "EdTech",
    problem:
      "Coding education startup needed a portal for course enrollment, progress tracking, and parent dashboards.",
    solution:
      "Custom web app with student dashboards, lesson modules, quiz engine, and admin tools for instructors to manage cohorts.",
    tech_stack: ["React", "Node.js", "PostgreSQL", "AWS"],
    phases: [
      { name: "Product design", hours: 60 },
      { name: "Core platform", hours: 280 },
      { name: "Admin & reporting", hours: 80 },
      { name: "QA & launch", hours: 60 },
    ],
    total_hours: 480,
  },
  {
    slug: "vygilance-ios",
    title: "Vygilance",
    client_type: "Direct client",
    domain: "Security / Mobile",
    problem:
      "Field teams needed a reliable iOS app for incident reporting, geolocation check-ins, and offline-first data capture.",
    solution:
      "Native iOS app with secure auth, offline sync, push notifications, and an admin web console for supervisors.",
    tech_stack: ["iOS", "Swift", "React", "Node.js", "PostgreSQL"],
    phases: [
      { name: "Mobile UX & architecture", hours: 80 },
      { name: "iOS development", hours: 360 },
      { name: "Backend & sync", hours: 160 },
      { name: "App Store launch", hours: 60 },
    ],
    total_hours: 660,
  },
  {
    slug: "fultoli-islamic-center",
    title: "Fultoli Islamic Center App",
    client_type: "Nonprofit",
    domain: "Community / Religious",
    problem:
      "Community center wanted a mobile app for prayer times, events, donations, and announcements in multiple languages.",
    solution:
      "Android-first community app with prayer schedule API, event calendar, push notifications, and Stripe donation flow.",
    tech_stack: ["Android", "Kotlin", "Firebase", "Stripe"],
    phases: [
      { name: "Community research", hours: 40 },
      { name: "App development", hours: 240 },
      { name: "Payments & notifications", hours: 80 },
      { name: "Launch & training", hours: 40 },
    ],
    total_hours: 400,
  },
  {
    slug: "crafted-email-marketing",
    title: "Crafted Email",
    client_type: "Agency partner",
    domain: "MarTech / Email",
    problem:
      "Agency needed a polished marketing site showcasing email design capabilities with a fast CMS workflow.",
    solution:
      "Design-forward WordPress site with case study templates, animation-rich hero sections, and HubSpot form integration.",
    tech_stack: ["WordPress", "PHP", "JavaScript", "HubSpot"],
    phases: [
      { name: "Creative direction", hours: 40 },
      { name: "Design & WordPress build", hours: 160 },
      { name: "Integrations", hours: 40 },
      { name: "Launch", hours: 24 },
    ],
    total_hours: 264,
  },
  {
    slug: "tour-patron-cathedral",
    title: "Tour Patron — St Patrick's Cathedral",
    client_type: "Enterprise",
    domain: "Tourism / Cultural",
    problem:
      "Historic cathedral needed an audio tour app for visitors with multilingual support and indoor wayfinding.",
    solution:
      "Android tour app with beacon-triggered audio, offline map packs, and CMS-managed tour content in 6 languages.",
    tech_stack: ["Android", "Kotlin", "Bluetooth Beacons", "CMS"],
    phases: [
      { name: "On-site discovery", hours: 60 },
      { name: "App & beacon integration", hours: 320 },
      { name: "Content & localization", hours: 120 },
      { name: "Pilot & rollout", hours: 60 },
    ],
    total_hours: 560,
  },
  {
    slug: "ivolunteer-platform",
    title: "IVolunteer",
    client_type: "Nonprofit",
    domain: "Volunteer Management",
    problem:
      "Nonprofit network needed a platform to match volunteers with opportunities, track hours, and report impact.",
    solution:
      "React web platform with opportunity search, volunteer profiles, hour logging, and admin reporting dashboards.",
    tech_stack: ["React", "Node.js", "PostgreSQL", "AWS"],
    phases: [
      { name: "Workflow design", hours: 60 },
      { name: "Platform build", hours: 300 },
      { name: "Reporting & admin", hours: 100 },
      { name: "QA & launch", hours: 60 },
    ],
    total_hours: 520,
  },
  {
    slug: "crm-insurance-integration",
    title: "CRM Integration for Insurance Broker",
    client_type: "Recurring client",
    domain: "Insurance / CRM",
    problem:
      "Regional broker needed Salesforce synced with a legacy policy admin system and automated lead routing.",
    solution:
      "Middleware integration layer with bidirectional sync, error queues, and a lightweight ops dashboard for support staff.",
    tech_stack: ["Node.js", "Salesforce", "PostgreSQL", "AWS Lambda"],
    phases: [
      { name: "Integration mapping", hours: 60 },
      { name: "Sync engine", hours: 200 },
      { name: "Ops dashboard", hours: 80 },
      { name: "UAT & rollout", hours: 60 },
    ],
    total_hours: 400,
  },
  {
    slug: "healthcare-patient-portal",
    title: "Healthcare Patient Portal",
    client_type: "Enterprise",
    domain: "Healthcare",
    problem:
      "Clinic network needed HIPAA-aware patient scheduling, telehealth links, and secure document upload.",
    solution:
      "Next.js patient portal with auth, appointment booking, EHR API integration, and audit logging.",
    tech_stack: ["Next.js", "TypeScript", "PostgreSQL", "AWS"],
    phases: [
      { name: "Compliance & UX", hours: 80 },
      { name: "Portal build", hours: 280 },
      { name: "EHR integration", hours: 160 },
      { name: "Security review & launch", hours: 80 },
    ],
    total_hours: 600,
  },
  {
    slug: "mortgage-loan-dashboard",
    title: "Mortgage Loan Officer Dashboard",
    client_type: "Direct client",
    domain: "Mortgage / FinTech",
    problem:
      "Lender's loan officers juggled spreadsheets across LOS, CRM, and email — no single pipeline view.",
    solution:
      "Custom dashboard pulling Encompass LOS data with pipeline stages, task reminders, and compliance checklists.",
    tech_stack: ["React", "Node.js", "PostgreSQL", "Encompass API"],
    phases: [
      { name: "Workflow audit", hours: 40 },
      { name: "Dashboard build", hours: 240 },
      { name: "LOS integration", hours: 120 },
      { name: "Pilot & training", hours: 40 },
    ],
    total_hours: 440,
  },
  {
    slug: "ai-document-classifier",
    title: "AI Document Classifier",
    client_type: "Enterprise",
    domain: "AI / Document Processing",
    problem:
      "Legal team spent hours manually sorting inbound contracts and NDAs into the right folders and workflows.",
    solution:
      "RAG-powered classifier with Gemini, vector search over templates, and a review queue for low-confidence items.",
    tech_stack: ["Python", "Gemini", "pgvector", "FastAPI", "React"],
    phases: [
      { name: "Data audit & labeling", hours: 60 },
      { name: "Classifier & RAG pipeline", hours: 200 },
      { name: "Review UI", hours: 100 },
      { name: "Pilot & tuning", hours: 60 },
    ],
    total_hours: 420,
  },
];
