import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/components/contact-form";
import { PROJECT_TYPES, TIMELINES } from "@/lib/contact";
import { site } from "@/lib/site";

const validDescription =
  "We want to build an AI-assisted product for founders starting from an idea.";

async function fillRequiredFields(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(screen.getByLabelText(/name/i), "Ada Lovelace");
  await user.type(screen.getByLabelText(/email/i), "ada@example.com");
  await user.selectOptions(
    screen.getByLabelText(/project type/i),
    PROJECT_TYPES[0],
  );
  await user.selectOptions(screen.getByLabelText(/timeline/i), TIMELINES[1]);
  await user.type(screen.getByLabelText(/project description/i), validDescription);
}

describe("ContactForm", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ok: true }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders labelled fields and skips the honeypot in the tab order", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/name/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/company/i)).not.toBeRequired();
    expect(screen.getByLabelText(/project type/i)).toBeRequired();
    expect(screen.getByLabelText(/budget range/i)).not.toBeRequired();
    expect(screen.getByLabelText(/timeline/i)).toBeRequired();
    expect(screen.getByLabelText(/project description/i)).toBeRequired();
    expect(screen.getByLabelText(/link to product\/site/i)).not.toBeRequired();

    const honeypot = screen.getByLabelText("Website");
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveAttribute("autocomplete", "off");
    expect(honeypot.closest(".sr-only")).not.toBeNull();
  });

  it("shows field errors and focuses the first invalid field on 400", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        ok: false,
        errors: {
          name: "Enter your name (2–100 characters).",
          email: "Enter a valid email address.",
        },
      }),
    } as Response);

    render(<ContactForm />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(
      await screen.findByText("Enter your name (2–100 characters)."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/name/i)).toHaveFocus();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("replaces the form with a focused success status on 200", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Send inquiry" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(
      "Thanks — I read every inquiry and reply within 1–2 business days.",
    );
    expect(status).toHaveFocus();
    expect(
      screen.queryByRole("button", { name: "Send inquiry" }),
    ).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("shows a form-level error with a mailto fallback on 500", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        ok: false,
        errors: {
          form: "Something went wrong. Please try again or email us directly.",
        },
      }),
    } as Response);

    render(<ContactForm />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Something went wrong");
    expect(screen.getByRole("link", { name: site.email })).toHaveAttribute(
      "href",
      `mailto:${site.email}`,
    );
  });

  it("disables the submit button while the request is pending", async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: Response) => void = () => {};
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    render(<ContactForm />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(
      screen.getByRole("button", { name: "Sending…" }),
    ).toBeDisabled();

    resolveFetch({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });
});
