import type { BlogPostRecord } from "@/lib/blog";

export const blogSeedPosts: BlogPostRecord[] = [
  {
    slug: "idea-to-production-ai",
    title: "From idea to a production AI product",
    description:
      "How I take a founder’s AI idea through definition, architecture, and the first production slice — without treating the model as the product.",
    content: `Most AI products fail in the gap between a promising demo and something a real user can trust. The model is rarely the hard part. The product, the data, and the failure modes are.

## Start with a job, not a model

I begin with the job a founder needs done: a workflow that is slow, expensive, or inconsistent today. Then I ask what “done well” looks like in a number a stakeholder already cares about. That keeps the first slice small enough to ship and honest enough to evaluate.

## Architecture follows the first slice

The first production version should be boring where it can be: a clear interface, a retrieval or tool path you can inspect, and logs you can read when the model is wrong. Fancy agent graphs come later, if they earn their complexity.

## Reliability is part of the build

Before a wider rollout I want evaluation on real examples, a way to see what the system did, and a fallback when it should not answer. That is the difference between a demo and a product a founder can put in front of customers.

If you are starting from an idea rather than a codebase, that path is [startup development](/startup-development).`,
    coverImageUrl: null,
    tags: ["AI", "product", "greenfield"],
    status: "published",
    publishedAt: "2026-08-01T09:00:00.000Z",
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z",
  },
  {
    slug: "draft-internal-notes",
    title: "Internal notes (draft)",
    description: "This draft must never appear on the public blog.",
    content: "Draft body that listing and post pages must not render.",
    coverImageUrl: null,
    tags: ["internal"],
    status: "draft",
    publishedAt: null,
    createdAt: "2026-08-02T09:00:00.000Z",
    updatedAt: "2026-08-02T09:00:00.000Z",
  },
];
