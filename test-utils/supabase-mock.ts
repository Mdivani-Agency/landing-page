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

type QueryOutcome = {
  data: FakeRow[] | null;
  error: { message: string } | null;
  count: number | null;
};

function parsePostgrestArray(value: string): string[] {
  const trimmed = value.trim();

  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    throw new Error(`fake supabase: expected an array literal, received ${value}`);
  }

  const inner = trimmed.slice(1, -1).trim();

  if (!inner) {
    return [];
  }

  return inner.split(",").map((part) => {
    const item = part.trim();

    if (item.startsWith('"') && item.endsWith('"')) {
      return item.slice(1, -1);
    }

    return item;
  });
}

function arrayOverlaps(cell: unknown, expected: string[]): boolean {
  return (
    Array.isArray(cell) &&
    cell.some((item) => expected.includes(String(item)))
  );
}

function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let inQuotes = false;

  for (const char of input) {
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
      continue;
    }

    if (!inQuotes && char === "(") {
      depth += 1;
    }

    if (!inQuotes && char === ")") {
      depth -= 1;
    }

    if (!inQuotes && depth === 0 && char === ",") {
      parts.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

function matchesCondition(row: FakeRow, condition: string): boolean {
  const match = condition.match(/^([A-Za-z0-9_]+)\.(not\.)?([a-z]+)\.(.*)$/);

  if (!match) {
    throw new Error(`fake supabase: unsupported filter ${condition}`);
  }

  const [, column, negated, operator, value] = match;

  if (operator !== "ov") {
    throw new Error(`fake supabase: unsupported operator ${operator}`);
  }

  const overlaps = arrayOverlaps(row[column], parsePostgrestArray(value));
  return negated ? !overlaps : overlaps;
}

function matchesLogic(row: FakeRow, expression: string): boolean {
  const trimmed = expression.trim();

  if (trimmed.startsWith("and(") && trimmed.endsWith(")")) {
    return splitTopLevel(trimmed.slice(4, -1)).every((part) =>
      matchesLogic(row, part),
    );
  }

  if (trimmed.startsWith("or(") && trimmed.endsWith(")")) {
    return splitTopLevel(trimmed.slice(3, -1)).some((part) =>
      matchesLogic(row, part),
    );
  }

  return matchesCondition(row, trimmed);
}

export type FakeQueryBuilder = {
  select: (
    columns?: string,
    options?: { count?: "exact" },
  ) => FakeQueryBuilder;
  eq: (column: string, value: unknown) => FakeQueryBuilder;
  contains: (column: string, values: unknown[]) => FakeQueryBuilder;
  lte: (column: string, value: unknown) => FakeQueryBuilder;
  not: (column: string, operator: string, value: string) => FakeQueryBuilder;
  or: (filters: string) => FakeQueryBuilder;
  order: (
    column: string,
    options?: { ascending?: boolean },
  ) => FakeQueryBuilder;
  range: (from: number, to: number) => FakeQueryBuilder;
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
    const orders: Array<{ column: string; ascending: boolean }> = [];
    let pendingInsert: FakeRow | null = null;
    let pendingUpsert: FakeRow | null = null;
    let rangeBounds: { from: number; to: number } | null = null;
    let countExact = false;

    function run(): QueryOutcome {
      if (options.error) {
        return { data: null, error: options.error, count: null };
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
        return { data: [stored], error: null, count: null };
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

        return { data: [{ ...pendingUpsert }], error: null, count: null };
      }

      let result = rows.filter((row) =>
        filters.every((matches) => matches(row)),
      );

      if (orders.length > 0) {
        result = [...result].sort((left, right) => {
          for (const { column, ascending } of orders) {
            const a = String(left[column] ?? "");
            const b = String(right[column] ?? "");
            const comparison = a.localeCompare(b);

            if (comparison !== 0) {
              return ascending ? comparison : -comparison;
            }
          }

          return 0;
        });
      }

      const total = result.length;

      if (rangeBounds) {
        result = result.slice(rangeBounds.from, rangeBounds.to + 1);
      }

      return {
        data: result,
        error: null,
        count: countExact ? total : null,
      };
    }

    const builder: FakeQueryBuilder = {
      select: (_columns, selectOptions) => {
        countExact = selectOptions?.count === "exact";
        return builder;
      },
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
      lte: (column, value) => {
        filters.push((row) => {
          const cell = row[column];

          if (cell == null) {
            return false;
          }

          return String(cell) <= String(value);
        });
        return builder;
      },
      range: (from, to) => {
        rangeBounds = { from, to };
        return builder;
      },
      not: (column, operator, value) => {
        if (operator !== "ov") {
          throw new Error(`fake supabase: unsupported not operator ${operator}`);
        }

        const expected = parsePostgrestArray(value);
        filters.push((row) => !arrayOverlaps(row[column], expected));
        return builder;
      },
      or: (expression) => {
        filters.push((row) => matchesLogic(row, `or(${expression})`));
        return builder;
      },
      order: (column, orderOptions) => {
        orders.push({ column, ascending: orderOptions?.ascending ?? true });
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

export function fakeBlogRow(overrides: FakeRow): FakeRow {
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
  fakeBlogRow({
    slug: "idea-to-production-ai",
    title: "From idea to a production AI product",
    tags: ["AI", "product", "greenfield"],
    featured: true,
    published_at: "2026-08-01T09:00:00.000Z",
  }),
  fakeBlogRow({
    slug: "shipping-the-first-slice",
    title: "Shipping the first slice",
    published_at: "2026-08-15T09:00:00.000Z",
  }),
  fakeBlogRow({
    slug: "draft-internal-notes",
    title: "Internal notes (draft)",
    description: "This draft must never appear on the public blog.",
    tags: ["internal"],
    status: "draft",
    published_at: null,
  }),
  fakeBlogRow({
    slug: "talvio-only-post",
    title: "Only for Talvio",
    sites: ["talvio"],
    published_at: "2026-08-20T09:00:00.000Z",
  }),
];
