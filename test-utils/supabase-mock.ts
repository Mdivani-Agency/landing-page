/**
 * Minimal in-memory stand-in for the Supabase query builder.
 *
 * It applies the filters it is given rather than returning canned rows, so
 * tests keep asserting behaviour — that drafts stay hidden, that the site
 * filter excludes other front ends — instead of the shape of a query.
 *
 * Only the surface `lib/blog.ts` and `lib/inquiries.ts` use is implemented.
 */

export type FakeRow = Record<string, unknown>;

export type FakeSupabase = {
  from: (table: string) => FakeQueryBuilder;
  rows: FakeRow[];
};

type QueryOutcome = { data: FakeRow[] | null; error: { message: string } | null };

export type FakeQueryBuilder = {
  select: (columns?: string) => FakeQueryBuilder;
  eq: (column: string, value: unknown) => FakeQueryBuilder;
  contains: (column: string, values: unknown[]) => FakeQueryBuilder;
  order: (
    column: string,
    options?: { ascending?: boolean },
  ) => FakeQueryBuilder;
  insert: (row: FakeRow | FakeRow[]) => FakeQueryBuilder;
  upsert: (
    row: FakeRow,
    options?: { onConflict?: string },
  ) => FakeQueryBuilder;
  maybeSingle: () => Promise<{
    data: FakeRow | null;
    error: { message: string } | null;
  }>;
  single: () => Promise<{
    data: FakeRow | null;
    error: { message: string } | null;
  }>;
  then: <T>(onFulfilled: (value: QueryOutcome) => T) => Promise<T>;
};

export function createFakeSupabase(
  initialRows: FakeRow[] = [],
  options: { error?: { message: string } } = {},
): FakeSupabase {
  const rows: FakeRow[] = initialRows.map((row) => ({ ...row }));

  function build(): FakeQueryBuilder {
    const filters: Array<(row: FakeRow) => boolean> = [];
    let order: { column: string; ascending: boolean } | null = null;
    let pendingInsert: FakeRow | null = null;
    let pendingUpsert: FakeRow | null = null;

    function run(): QueryOutcome {
      if (options.error) {
        return { data: null, error: options.error };
      }

      if (pendingInsert) {
        const stored = {
          ...pendingInsert,
          id:
            typeof pendingInsert.id === "string"
              ? pendingInsert.id
              : "inquiry-1",
        };
        rows.push(stored);
        return { data: [stored], error: null };
      }

      if (pendingUpsert) {
        const index = rows.findIndex(
          (row) => row.slug === pendingUpsert?.slug,
        );

        if (index === -1) {
          rows.push({ ...pendingUpsert });
        } else {
          rows[index] = { ...pendingUpsert };
        }

        return { data: [{ ...pendingUpsert }], error: null };
      }

      let result = rows.filter((row) =>
        filters.every((matches) => matches(row)),
      );

      if (order) {
        const { column, ascending } = order;
        result = [...result].sort((left, right) => {
          const a = String(left[column] ?? "");
          const b = String(right[column] ?? "");
          return ascending ? a.localeCompare(b) : b.localeCompare(a);
        });
      }

      return { data: result, error: null };
    }

    const builder: FakeQueryBuilder = {
      select: () => builder,
      eq: (column, value) => {
        filters.push((row) => row[column] === value);
        return builder;
      },
      contains: (column, values) => {
        filters.push((row) => {
          const cell = row[column];
          return (
            Array.isArray(cell) && values.every((value) => cell.includes(value))
          );
        });
        return builder;
      },
      order: (column, orderOptions) => {
        order = { column, ascending: orderOptions?.ascending ?? true };
        return builder;
      },
      insert: (row) => {
        pendingInsert = Array.isArray(row) ? (row[0] ?? null) : row;
        return builder;
      },
      upsert: (row) => {
        pendingUpsert = row;
        return builder;
      },
      maybeSingle: async () => {
        const { data, error } = run();
        return { data: data?.[0] ?? null, error };
      },
      single: async () => {
        const { data, error } = run();

        if (!error && (!data || data.length === 0)) {
          return { data: null, error: { message: "no rows returned" } };
        }

        return { data: data?.[0] ?? null, error };
      },
      then: (onFulfilled) => Promise.resolve(run()).then(onFulfilled),
    };

    return builder;
  }

  return { from: () => build(), rows };
}

/**
 * Module shape for `vi.mock("@/lib/supabase", ...)`. Both clients resolve to
 * the same store, so a write is visible to the next read.
 *
 * Call it from an async mock factory, since `vi.mock` is hoisted above
 * imports:
 *
 * ```ts
 * vi.mock("@/lib/supabase", async () => {
 *   const { supabaseModuleMock } = await import("@/test-utils/supabase-mock");
 *   return supabaseModuleMock(() => state.client);
 * });
 * ```
 */
export function supabaseModuleMock(
  getClient: () => FakeSupabase,
  isConfigured: () => boolean = () => true,
) {
  const env = (missing: string[]) =>
    isConfigured()
      ? { ok: true, url: "https://test.supabase.co", key: "sb_test_key" }
      : { ok: false, missing };

  return {
    readSupabaseEnv: () => env(["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"]),
    readSupabaseAdminEnv: () => env(["SUPABASE_URL", "SUPABASE_SECRET_KEY"]),
    createSupabaseReadClient: () => getClient(),
    createSupabaseAdminClient: () => getClient(),
  };
}

function row(overrides: FakeRow): FakeRow {
  const iso = "2026-08-01T09:00:00.000Z";

  return {
    title: "A post",
    description: "Enough description for the card.",
    content: "## Start with a job\n\nThe model is not the product.",
    cover_image_url: null,
    tags: [],
    sites: ["agency"],
    status: "published",
    featured: false,
    published_at: iso,
    created_at: iso,
    updated_at: iso,
    ...overrides,
  };
}

/**
 * Fixture rows for tests only — nothing seeds the database. The mix covers a
 * draft, two published dates, and a post belonging to the other front end.
 */
export const fakeBlogRows: FakeRow[] = [
  row({
    slug: "idea-to-production-ai",
    title: "From idea to a production AI product",
    tags: ["AI", "product", "greenfield"],
    featured: true,
    published_at: "2026-08-01T09:00:00.000Z",
  }),
  row({
    slug: "shipping-the-first-slice",
    title: "Shipping the first slice",
    published_at: "2026-08-15T09:00:00.000Z",
  }),
  row({
    slug: "draft-internal-notes",
    title: "Internal notes (draft)",
    description: "This draft must never appear on the public blog.",
    tags: ["internal"],
    status: "draft",
    published_at: null,
  }),
  row({
    slug: "talvio-only-post",
    title: "Only for Talvio",
    sites: ["talvio"],
    published_at: "2026-08-20T09:00:00.000Z",
  }),
];
