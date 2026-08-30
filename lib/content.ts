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

export const selectedWork = [
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
    href: "/work#flighter",
    slug: "flighter",
    client: "Flighter Group",
    role: "Full-stack / fractional technical lead",
    title: "Aviation onboarding and document intelligence",
    problem:
      "Aviation onboarding was slow and manual: certificates, identity documents, and compliance checks lived in email and shared drives.",
    built:
      "Serverless multi-stage onboarding on AWS — S3/KMS storage, Lambda validation, EventBridge workflows, and AI-assisted document processing.",
    challenge:
      "Sensitive aviation data, SOC 2 readiness, and automation that does not skip a required human check.",
    outcome:
      "Faster applicant processing, less manual compliance work, and a path to consistent certification data.",
    stack: ["TypeScript", "AWS Lambda", "DynamoDB", "Terraform", "AI agents"],
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
] as const;

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
