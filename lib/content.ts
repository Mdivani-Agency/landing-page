export const capabilities = [
  {
    id: "ai",
    eyebrow: "The sharpest edge",
    title: "AI Engineering",
    summary:
      "Agents, RAG, document intelligence, and LLM features that belong in a real product — not a demo.",
    items: [
      "AI agents and agentic workflows",
      "LLM-powered applications",
      "RAG and knowledge systems",
      "AI automation",
      "Document intelligence",
      "AI integrations and product features",
      "Evaluation, reliability, and AI infrastructure",
    ],
    featured: true,
  },
  {
    id: "product",
    eyebrow: "The product around it",
    title: "Product Engineering",
    summary:
      "Greenfield SaaS, web, mobile, and the backend that makes a first product shippable.",
    items: [
      "Greenfield SaaS products",
      "Web and mobile applications",
      "Backend and API development",
      "Integrations, auth, and payments",
      "MVP and first-product development",
    ],
    featured: false,
  },
  {
    id: "architecture",
    eyebrow: "The decisions before it",
    title: "Architecture & Technical Leadership",
    summary:
      "The decisions before the first sprint: architecture, cloud, stack, and a roadmap you can hire against.",
    items: [
      "Product and AI architecture",
      "AWS and cloud architecture",
      "Technology selection",
      "Technical roadmap",
      "Engineering team setup and scaling",
    ],
    featured: false,
  },
] as const;

export const processSteps = [
  {
    title: "Understand",
    body: "What you are building, who it is for, and the constraint that actually matters — time, risk, regulation, or capital.",
  },
  {
    title: "Define",
    body: "A sharp product slice. What ships first, what waits, and what would make this the wrong project.",
  },
  {
    title: "Architect",
    body: "Stack, data, AI boundaries, and the AWS shape that will still make sense after the first fifty users.",
  },
  {
    title: "Build",
    body: "I implement the critical path. When the work needs more hands, I bring trusted engineers and stay the technical contact.",
  },
  {
    title: "Launch",
    body: "Production, observability, and a handover you can operate — or we keep building the next slice together.",
  },
] as const;

export type SelectedWork = {
  href: string;
  slug: string;
  name: string;
  client: string;
  role: string;
  title: string;
  /** Condensed outcome. Present on the cases featured on the homepage. */
  homeOutcome?: string;
  // problem and outcome lead each case in plain language. Everything below
  // them is implementation detail and renders inside "How it was built".
  problem: string;
  outcome: string;
  built: string;
  challenge: string;
  challenges?: readonly string[];
  achievements?: readonly string[];
  stack: readonly string[];
};

export const selectedWork: readonly SelectedWork[] = [
  {
    href: "/work#metis",
    slug: "metis",
    name: "METIS",
    client: "METIS / Lloyd’s MGA",
    role: "AI Engineer / Fractional technical lead",
    title: "Operational compliance platform for a Lloyd’s MGA",
    homeOutcome:
      "A regulated insurance business ran approvals, evidence, and accountability on spreadsheets. It now runs on one platform where every step is recorded and an audit can be answered from the system itself.",
    problem:
      "A Lloyd’s managing general agent ran its regulated work — senior-manager accountability, product approval, evidence, and follow-up actions — across spreadsheets, ad-hoc forms, and what individual people happened to remember. Nothing enforced who had signed off on what, so every audit and every handover started again from the beginning.",
    outcome:
      "METIS is the system of record for that governance now. Approvals move through defined steps, evidence and templates sit in one place, owners are notified, and the platform decides whether a product is approved rather than a spreadsheet. Regulated status is recorded as work happens, so an audit can be answered from the system.",
    built:
      "A Next.js and Supabase application covering SMCR, Product Approval Process, principle-level maturity tracking, broker management, evidence libraries, action items, and in-app and email notifications. Postgres, Row Level Security, RPCs, triggers, and Edge Functions keep workflows transactional and access controlled, while a unified document and template model supports PAP obligations, Fair Value, Consumer Duty, Target Market, and maturity assessments.",
    challenge:
      "Encoding concurrent, multi-step regulated workflows while enforcing business rules through Postgres, RLS, RPCs, and reliable event-driven notifications.",
    challenges: [
      "Encoded the multi-step PAP workflow so product status is derived from completed steps rather than manually edited, while remaining race-safe under concurrent approvals.",
      "Unified assessments and obligations in one document engine without breaking existing workflows, permissions, seeds, or templates.",
      "Enforced Row Level Security, grants, and GraphQL access so clients cannot bypass business rules, routing privileged operations through RPCs.",
      "Built event-driven notifications from domain events through an outbox to email, with environment guards that prevent non-production environments from messaging real users.",
      "Kept production and development seed overlays, migrations, and Edge Function secrets aligned so deployments remained operable.",
    ],
    achievements: [
      "Shipped a production-ready governance platform spanning SMCR, PAP, maturity, brokers, evidence, and actions.",
      "Consolidated fragmented assessment surfaces into a reusable template and document architecture.",
      "Hardened product and document creation so critical launch artefacts, including the concept note, cannot silently fail.",
      "Stabilised Edge Function service authentication and notification delivery, including email allowlisting for safe non-production use.",
      "Established migration-first documentation, incremental seeding, CI, and role-based Playwright coverage as part of the delivery pipeline.",
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "Row Level Security",
      "Edge Functions",
    ],
  },
  {
    href: "/work#flighter",
    slug: "flighter",
    name: "Flighter",
    client: "Flighter Group",
    role: "Full-stack / fractional technical lead",
    title: "Aviation onboarding and document intelligence",
    problem:
      "Flighter onboarded aviation applicants over email and shared drives. Identity checks, certificates, employment history, compliance review, signatures, and approvals were all tracked by hand, evidence was scattered, and there was no dependable record of who had reviewed or approved what.",
    outcome:
      "Onboarding runs as one workflow. Documents are collected and read automatically, anything the system is unsure about goes to a person, signatures and approvals are captured in order, and every decision leaves a trail. Turnaround shortened and the repetitive checking largely went away — without removing the human approval gates a regulated business needs.",
    built:
      "A production onboarding and certification platform with secure authentication, encrypted document storage, AI-assisted extraction and validation, event-driven processing, human approval gates, and third-party electronic signatures. I owned the product architecture, frontend, backend, cloud infrastructure, document-processing workflows, integrations, deployment pipeline, and technical delivery.",
    challenge:
      "Automating sensitive, multi-stage aviation compliance workflows without sacrificing data security, auditability, reliability, or required human oversight.",
    challenges: [
      "Extracted and validated structured information from varied identity, employment, and aviation documents while routing uncertain results through human review.",
      "Designed resilient, idempotent workflows that could recover safely from retries, partial failures, and concurrent updates without skipping a compliance step.",
      "Protected sensitive applicant data through layered access controls, encryption, tenant isolation, and audit trails aligned with SOC 2 readiness.",
      "Integrated a third-party electronic signature service into asynchronous document and approval lifecycles, including status reconciliation and failure recovery.",
      "Kept frontend, backend, cloud infrastructure, environments, and deployment automation aligned as the product and its regulated workflows evolved.",
    ],
    achievements: [
      "Shipped the complete product from architecture through production across applicant onboarding, document collection, compliance review, signatures, and approval.",
      "Reduced onboarding turnaround and manual checking by automating document extraction, validation, reminders, and workflow progression.",
      "Replaced fragmented records with consistent certification data, centralised evidence, and an auditable history of decisions and actions.",
      "Combined automation with explicit human approval gates so operational efficiency did not weaken compliance controls.",
      "Established repeatable cloud infrastructure and deployment practices that supported ongoing product development and operational reliability.",
    ],
    stack: [
      "TypeScript",
      "React",
      "AWS",
      "Serverless Architecture",
      "Infrastructure as Code",
      "AI Document Processing",
    ],
  },
  {
    href: "/work#eolas",
    slug: "eolas",
    name: "Eolas",
    client: "Eolas Medical",
    role: "Senior full-stack engineer",
    title: "Hospital knowledge app with AI search",
    homeOutcome:
      "A production system used by hospitals and individual clinicians, with web and mobile clients on the same backend and AI search that stays inside patient-data access controls.",
    problem:
      "Clinicians needed one trustworthy place for clinical guidelines, their own hospital’s documents, and onboarding material — on a ward, on a phone, and without exposing anything a given user should not see.",
    outcome:
      "The app is in production with hospitals and individual clinicians, web and mobile running on the same backend, and AI-assisted search across millions of guidelines that stays inside each user’s access rights.",
    built:
      "High-availability hospital application with content management, secure messaging, fine-grained access, and AI-assisted search across millions of medical guidelines.",
    challenge:
      "HIPAA-sensitive data, cross-platform sync, and an AI search path that stays inside access controls.",
    stack: ["React Native", "React", "AWS", "GraphQL", "OpenAI"],
  },
  {
    href: "/work#localglobe",
    slug: "localglobe",
    name: "Phoenix Court",
    client: "Phoenix Court / LocalGlobe",
    role: "Senior full-stack engineer",
    title: "AI analytics for investment teams",
    homeOutcome:
      "Reported 30% higher engagement on insights, 40% less time spent on analysis, and 60% faster deploys after the pipeline work.",
    problem:
      "Investment analysts were spending too long turning raw market signals into something a partner could act on.",
    outcome:
      "Reported 30% higher engagement on insights, 40% less analysis time, and 60% faster deploys after the pipeline work. Trends and funding opportunities reach the team automatically, with the reasoning visible instead of a black box nobody trusts.",
    built:
      "React and Node features plus Python/PostgreSQL tools that detect trends and surface funding opportunities, with an AWS pipeline to ship them.",
    challenge:
      "Useful AI for domain experts — predictive analytics and workflow automation without a black-box that nobody trusts.",
    stack: ["React", "Node.js", "Python", "OpenAI", "AWS"],
  },
];

export type Testimonial = {
  body: string;
  author: string;
  title?: string;
  linkedinUrl: string;
  /**
   * Verbatim extract used for the homepage pull-quote. Quotes are published
   * recommendations, so an extract has to be a contiguous span of the body —
   * never a reworded version of it.
   */
  pullQuote?: string;
};

// David leads: the rotator opens on the first entry, and his recommendation is
// the only one written about the current senior-partner engagement.
export const testimonials = [
  {
    author: "David Espinosa",
    linkedinUrl: "https://www.linkedin.com/in/espinosa-david/",
    title: "CTO at Eolas Medical",
    pullQuote:
      "Giorgi is the best example of what a full-stack engineer should be. He can work in any part of a product's life cycle.",
    body: "Giorgi is the best example of what a full-stack engineer should be. He can work in any part of a product's life cycle. From its design, through the backend implementation, the creation of the infrastructure, as well as the visual layer where he can work great both on the web and on mobile.\n\nBut even so, what I will always remember most about having worked with him is how easy it is to work with him, always a pleasure, without a doubt he is a great team player.\n\nGiorgi would be an asset to any team and earns my highest recommendation.",
  },
  {
    author: "Iosif Boanca",
    linkedinUrl: "https://www.linkedin.com/in/iosifb/",
    body: "If you have the chance to get Giorgi on your team, your team's productivity will explode.",
  },
  {
    author: "Nick Cousins",
    title: "Founder/CEO at Relative",
    linkedinUrl: "https://www.linkedin.com/in/nickcousins/",
    body: "I hired George in 2018 as a contractor, and only the second developer I'd hired into my new company - Relative. The plan was for him - as a remote developer on the other side of the world - to help us out for a few weeks while we were under pressure. I was very wrong. George is quite simply one of the most incredible developers I've ever worked with.",
  },
  {
    author: "Duncan Gordon",
    title: "PMO at Pinter",
    linkedinUrl: "https://www.linkedin.com/in/duncansgordon/",
    body: "I could not speak more highly of George. As a start-up growing extremely quickly as well as being in another country and time-zone, there were a lot of difficult expectations and pressures placed on George but he took them all in stride and was critical to the build, launch and success of our mobile app. Always happy to go the extra mile and able to execute a very high level even no matter what the stresses and circumstances. George's spread of knowledge and skills as well as his ability to adapt/learn/execute on the fly is extremely impressive.",
  },
] satisfies readonly Testimonial[];

export const expertise = [
  "AI Engineering",
  "Software & Product Architecture",
  "Technical Leadership",
  "AWS Cloud Architecture",
  "Serverless & Distributed Systems",
  "Full-Stack Product Engineering",
  "LLM Applications & Agentic Systems",
  "Data & API Architecture",
  "DevOps & Infrastructure as Code",
  "TypeScript / Node.js",
  "Python",
  "React / Next.js / React Native",
] as const;

export const profileDescriptions = {
  primary: "Typical background on a call: greenfield SaaS, an AI feature that has to survive real users, or a first cloud architecture that will not need a rewrite in six months.",
  secondary: "I help founders architect and ship production-ready AI, SaaS, cloud, web, and mobile products, and I stay the technical contact while the team grows around the work.",
} as const;
