import { beforeEach, describe, expect, it, vi } from "vitest";

// The scroll lock keeps a module-level counter, so each test imports a fresh copy.
async function importScrollLock() {
  return import("@/lib/scroll-lock");
}

beforeEach(() => {
  vi.resetModules();
  document.body.style.overflow = "";
});

describe("scroll lock", () => {
  it("hides body overflow while locked and restores it on release", async () => {
    const { acquireScrollLock, releaseScrollLock } = await importScrollLock();

    acquireScrollLock();
    expect(document.body.style.overflow).toBe("hidden");

    releaseScrollLock();
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps the lock until every holder releases it", async () => {
    const { acquireScrollLock, releaseScrollLock } = await importScrollLock();

    acquireScrollLock();
    acquireScrollLock();

    releaseScrollLock();
    expect(document.body.style.overflow).toBe("hidden");

    releaseScrollLock();
    expect(document.body.style.overflow).toBe("");
  });

  it("ignores unbalanced releases", async () => {
    const { acquireScrollLock, releaseScrollLock } = await importScrollLock();

    releaseScrollLock();
    expect(document.body.style.overflow).toBe("");

    acquireScrollLock();
    expect(document.body.style.overflow).toBe("hidden");

    releaseScrollLock();
    expect(document.body.style.overflow).toBe("");
  });
});
