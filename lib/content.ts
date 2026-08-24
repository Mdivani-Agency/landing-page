export const capabilities = [
  {
    id: "ai",
    href: "/ai-engineering",
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
    href: "/product-development",
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
    href: "/about#architecture",
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

export const selectedWork = [
  {
    href: "/work#eolas",
    slug: "eolas",
    client: "Eolas Medical",
    role: "Senior full-stack engineer",
    title: "Hospital knowledge app with AI search",
    summary: "AI search across hospital guidelines and clinician documents.",
    problem:
      "Clinicians needed one searchable place for guidelines and hospital documents.",
    built:
      "Web and mobile hospital app with content management, messaging, and AI search.",
    challenge: "Sensitive clinical data, with search that stays inside access controls.",
    outcome: "In production for hospitals and individual clinicians.",
    stack: ["React Native", "React", "AWS", "GraphQL", "OpenAI"],
  },
  {
    href: "/work#flighter",
    slug: "flighter",
    client: "Flighter Group",
    role: "Full-stack / fractional technical lead",
    title: "Aviation onboarding and document intelligence",
    summary: "Aviation onboarding with AI document processing.",
    problem:
      "Certificates and compliance checks lived in email and shared drives.",
    built:
      "Serverless AWS onboarding with encrypted storage, workflows, and AI document processing.",
    challenge:
      "Sensitive aviation data, with automation that still includes required human checks.",
    outcome: "Faster applicant processing and less manual compliance work.",
    stack: ["TypeScript", "AWS Lambda", "DynamoDB", "Terraform", "AI agents"],
  },
  {
    href: "/work#localglobe",
    slug: "localglobe",
    client: "Phoenix Court / LocalGlobe",
    role: "Senior full-stack engineer",
    title: "AI analytics for investment teams",
    summary: "AI analytics that help investment teams act on signals faster.",
    problem:
      "Analysts spent too long turning raw signals into partner-ready insights.",
    built:
      "React, Node, and Python tools that surface trends and funding opportunities.",
    challenge: "Predictive analytics that domain experts can trust.",
    outcome: "Faster analysis and a pipeline that ships insights to production.",
    stack: ["React", "Node.js", "Python", "OpenAI", "AWS"],
  },
] as const;

export const stack = [
  "TypeScript",
  "Node.js",
  "Python",
  "React",
  "Next.js",
  "React Native",
  "AWS Lambda",
  "DynamoDB",
  "PostgreSQL",
  "Terraform",
  "OpenAI",
  "RAG / agents",
] as const;
