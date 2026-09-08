import "server-only";

import type { ValidatedContact } from "@/lib/contact";
import {
  createSupabaseAdminClient,
  readSupabaseAdminEnv,
} from "@/lib/supabase";

const TABLE = "inquiries";

export type InquiryInsert = {
  name: string;
  email: string;
  company: string | null;
  project_type: string;
  budget: string | null;
  timeline: string;
  description: string;
  link: string | null;
};

export function toInquiryInsert(value: ValidatedContact): InquiryInsert {
  return {
    name: value.name,
    email: value.email,
    company: value.company ?? null,
    project_type: value.projectType,
    budget: value.budget ?? null,
    timeline: value.timeline,
    description: value.description,
    link: value.link ?? null,
  };
}

export async function insertInquiry(
  row: InquiryInsert,
): Promise<{ id: string }> {
  const env = readSupabaseAdminEnv();

  if (!env.ok) {
    throw new Error(`contact: missing env ${env.missing.join(", ")}`);
  }

  const { data, error } = await createSupabaseAdminClient(env.url, env.key)
    .from(TABLE)
    .insert(row)
    .select("id")
    .single();

  if (error || typeof data?.id !== "string") {
    console.error("contact: inquiry insert failed", error ?? "missing id");
    throw new Error("contact: inquiry insert failed");
  }

  return { id: data.id };
}
