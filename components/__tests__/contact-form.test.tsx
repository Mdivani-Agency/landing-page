import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/components/contact-form";
import { trackAdsConversionAboutUs } from "@/lib/analytics";
import { PROJECT_TYPES, TIMELINES } from "@/lib/contact";
import { site } from "@/lib/site";

vi.mock("@/lib/analytics", () => ({
  trackAdsConversionAboutUs: vi.fn(),
}));

const validDescription =
  "We want to build an AI-assisted product for founders starting from an idea.";

const filledPayload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "",
  projectType: PROJECT_TYPES[0],
  budget: "",
  timeline: TIMELINES[1],
  description: validDescription,
  link: "",
  website: "",
};

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

function postedBody() {
  const init = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit | undefined;
  return JSON.parse(String(init?.body));
}

describe("ContactForm", () => {
  beforeEach(() => {
    vi.mocked(trackAdsConversionAboutUs).mockClear();
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

  it("renders labelled fields and keeps the honeypot out of the accessibility tree", () => {
    const { container } = render(<ContactForm />);

    expect(screen.getByLabelText(/name/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/company/i)).not.toBeRequired();
    expect(screen.getByLabelText(/project type/i)).toBeRequired();
    expect(screen.getByLabelText(/budget range/i)).not.toBeRequired();
    expect(screen.getByLabelText(/timeline/i)).toBeRequired();

    const projectType = screen.getByLabelText(/project type/i);
    expect(projectType).toHaveClass("appearance-none");
    expect(
      projectType.parentElement?.querySelector("svg[aria-hidden='true']"),
    ).not.toBeNull();
    expect(screen.getByLabelText(/project description/i)).toBeRequired();
    expect(screen.getByLabelText(/link to product\/site/i)).not.toBeRequired();

    expect(screen.queryByLabelText("Website")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: /website/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/fax/i)).not.toBeInTheDocument();

    const honeypot = container.querySelector('input[name="company_fax"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveAttribute("autocomplete", "off");
    expect(honeypot?.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("shows field errors and focuses the first invalid field after they are announced", async () => {
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

    const nameError = await screen.findByText(
      "Enter your name (2–100 characters).",
    );
    const nameInput = screen.getByLabelText(/name/i);

    expect(nameError).toBeInTheDocument();
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput).toHaveAttribute(
      "aria-describedby",
      "contact-name-error",
    );
    await waitFor(() => {
      expect(nameInput).toHaveFocus();
    });
    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("posts the filled values and an empty honeypot, then shows a focused success status", async () => {
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
    expect(postedBody()).toEqual(filledPayload);
    expect(trackAdsConversionAboutUs).toHaveBeenCalledTimes(1);
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

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong",
    );
    expect(screen.getByRole("link", { name: site.email })).toHaveAttribute(
      "href",
      `mailto:${site.email}`,
    );
    expect(trackAdsConversionAboutUs).not.toHaveBeenCalled();
  });

  it("shows the same form-level alert when fetch rejects", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network down"));

    render(<ContactForm />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong. Please try again or email us directly.",
    );
    expect(fetch).toHaveBeenCalledTimes(1);
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

    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();

    resolveFetch({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  it("allows a second submit after a 400 once the lock is released", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          ok: false,
          errors: { name: "Enter your name (2–100 characters)." },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ok: true }),
      } as Response);

    render(<ContactForm />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(
      await screen.findByText("Enter your name (2–100 characters)."),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("ignores a second submit while a request is in flight", async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: Response) => void = () => {};
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    render(<ContactForm />);
    await fillRequiredFields(user);

    const form = screen
      .getByRole("button", { name: "Send inquiry" })
      .closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);
    fireEvent.submit(form as HTMLFormElement);
    await user.click(screen.getByRole("button", { name: "Sending…" }));

    expect(fetch).toHaveBeenCalledTimes(1);

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
