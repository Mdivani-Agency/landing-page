export const capabilities = [
  {
    id: "ai",
    href: "/how-i-work",
    eyebrow: "Primary focus",
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
    href: "/how-i-work",
    eyebrow: "Product",
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
    href: "/about",
    eyebrow: "Leadership",
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
  client: string;
  role: string;
  title: string;
  tagline?: string;
  problem: string;
  built: string;
  challenge: string;
  challenges?: readonly string[];
  outcome: string;
  achievements?: readonly string[];
  stack: readonly string[];
};

export const selectedWork: readonly SelectedWork[] = [
  {
    href: "/work#metis",
    slug: "metis",
    client: "METIS / Lloyd’s MGA",
    role: "AI Engineer / Fractional technical lead",
    title: "Operational compliance platform for a Lloyd’s MGA",
    tagline:
      "METIS turns Lloyd’s MGA compliance workflows—SMCR, product approval, maturity, and evidence—into an auditable, RLS-backed web platform.",
    problem:
      "Regulated workflows lived across spreadsheets, ad-hoc forms, and tribal knowledge. The business needed one platform where status, approvals, evidence, and accountability were enforced in the database—not only in the UI—so audits, handoffs, and daily operations stayed consistent.",
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
    outcome:
      "Shipped a production-ready system of record for governance, approvals, evidence, and actions, backed by reusable domain models, hardened workflows, and role-based end-to-end coverage.",
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
    client: "Flighter Group",
    role: "Full-stack / fractional technical lead",
    title: "Aviation onboarding and document intelligence",
    tagline:
      "Flighter turns aviation applicant onboarding, document verification, compliance review, signatures, and approvals into one secure, auditable workflow.",
    problem:
      "Applicant onboarding, identity checks, certificates, employment history, compliance reviews, and approvals were handled across email, shared drives, and manual processes. The business needed one reliable workflow for collecting evidence, validating aviation credentials, coordinating human review, and maintaining a consistent audit trail.",
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
    outcome:
      "Launched a secure production platform that shortened onboarding, reduced repetitive compliance work, and created a consistent source of truth for applicant evidence, certification data, reviews, and approvals.",
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
    client: "Eolas Medical",
    role: "Senior full-stack engineer",
    title: "Hospital knowledge app with AI search",
    problem:
      "Clinicians needed one place for guidelines, private hospital documents, and onboarding — searchable, secure, and usable on web and mobile.",
    built:
      "High-availability hospital application with content management, secure messaging, fine-grained access, and AI-assisted search across millions of medical guidelines.",
    challenge:
      "HIPAA-sensitive data, cross-platform sync, and an AI search path that stays inside access controls.",
    outcome:
      "A production system used by hospitals and individual clinicians, with web and mobile clients on the same backend.",
    stack: ["React Native", "React", "AWS", "GraphQL", "OpenAI"],
  },
  {
    href: "/work#localglobe",
    slug: "localglobe",
    client: "Phoenix Court / LocalGlobe",
    role: "Senior full-stack engineer",
    title: "AI analytics for investment teams",
    problem:
      "Investment analysts were spending too long turning raw signals into something a partner could act on.",
    built:
      "React and Node features plus Python/PostgreSQL tools that detect trends and surface funding opportunities, with an AWS pipeline to ship them.",
    challenge:
      "Useful AI for domain experts — predictive analytics and workflow automation without a black-box that nobody trusts.",
    outcome:
      "Reported 30% higher engagement on insights, 40% less analysis time, and 60% faster deploys after the pipeline work.",
    stack: ["React", "Node.js", "Python", "OpenAI", "AWS"],
  },
];

export type Testimonial = {
  body: string;
  author: string;
  title?: string;
  linkedinUrl: string;
};

export const testimonials = [
  {
    author: "David Espinosa",
    linkedinUrl: "https://www.linkedin.com/in/espinosa-david/",
    title: "CTO at Eolas Medical",
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
  secondary: "Toptal-vetted software engineer, selected for its network of the top 3% of freelance developers. I help founders architect and ship production-ready AI, SaaS, cloud, web, and mobile products.",
} as const;
