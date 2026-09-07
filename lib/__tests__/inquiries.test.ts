import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFakeSupabase,
  type FakeSupabase,
} from "@/test-utils/supabase-mock";
import {
  BUDGETS,
  PROJECT_TYPES,
  TIMELINES,
  type ValidatedContact,
} from "@/lib/contact";

const state = vi.hoisted(() => ({
  client: undefined as unknown as FakeSupabase,
  configured: true,
}));

vi.mock("@/lib/supabase", async () => {
  const { supabaseModuleMock } = await import("@/test-utils/supabase-mock");
  return supabaseModuleMock(
    () => state.client,
    () => state.configured,
  );
});

import { insertInquiry, toInquiryInsert } from "@/lib/inquiries";

const contact: ValidatedContact = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  projectType: PROJECT_TYPES[0],
  timeline: TIMELINES[1],
  description:
    "We want to build an AI-assisted product for founders starting from an idea.",
};

beforeEach(() => {
  state.client = createFakeSupabase();
  state.configured = true;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("toInquiryInsert", () => {
  it("maps optional fields to null when they are omitted", () => {
    expect(toInquiryInsert(contact)).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      company: null,
      project_type: PROJECT_TYPES[0],
      budget: null,
      timeline: TIMELINES[1],
      description: contact.description,
      link: null,
    });
  });

  it("passes through optional company, budget, and link", () => {
    expect(
      toInquiryInsert({
        ...contact,
        company: "Analytical Engines",
        budget: BUDGETS[0],
        link: "https://example.com",
      }),
    ).toMatchObject({
      company: "Analytical Engines",
      budget: BUDGETS[0],
      link: "https://example.com",
    });
  });
});

describe("insertInquiry", () => {
  it("inserts the row and returns the generated id", async () => {
    await expect(insertInquiry(toInquiryInsert(contact))).resolves.toEqual({
      id: "inquiry-1",
    });
    expect(state.client.rows).toEqual([
      expect.objectContaining({
        id: "inquiry-1",
        name: "Ada Lovelace",
        email: "ada@example.com",
        company: null,
        project_type: PROJECT_TYPES[0],
        budget: null,
        timeline: TIMELINES[1],
        description: contact.description,
        link: null,
      }),
    ]);
  });

  it("logs and throws a generic error when the insert fails", async () => {
    state.client = createFakeSupabase([], {
      error: { message: "relation does not exist" },
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(insertInquiry(toInquiryInsert(contact))).rejects.toThrow(
      "contact: inquiry insert failed",
    );
    expect(error).toHaveBeenCalledWith("contact: inquiry insert failed", {
      message: "relation does not exist",
    });
  });

  it("throws when the admin env is missing", async () => {
    state.configured = false;

    await expect(insertInquiry(toInquiryInsert(contact))).rejects.toThrow(
      "contact: missing env SUPABASE_URL, SUPABASE_SECRET_KEY",
    );
  });
});
