import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CalendarModal } from "@/components/calendar-modal";
import { CalendarProvider } from "@/components/calendar-provider";
import {
  ContactCtaLink,
  ConversationButton,
} from "@/components/conversation-button";
import { Header } from "@/components/header";
import { PageIntro } from "@/components/page-intro";
import { FinalCta } from "@/components/sections/final-cta";
import { Hero } from "@/components/sections/hero";
import { site } from "@/lib/site";

function renderWithCalendar(ui: ReactNode) {
  return render(<CalendarProvider>{ui}</CalendarProvider>);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ConversationButton", () => {
  it("renders a primary medium button by default", () => {
    renderWithCalendar(<ConversationButton>Book a call</ConversationButton>);

    const button = screen.getByRole("button", { name: "Book a call" });
    expect(button).toHaveAttribute("title", "Book a call");
    expect(button).toHaveClass("bg-primary", "min-h-6");
  });

  it("supports the ghost variant and small size", () => {
    renderWithCalendar(
      <ConversationButton variant="ghost" size="sm">
        Talk
      </ConversationButton>,
    );

    const button = screen.getByRole("button", { name: "Talk" });
    expect(button).toHaveClass("border-subtle", "bg-transparent", "min-h-5");
    expect(button).not.toHaveClass("bg-primary");
  });

  it("throws when rendered outside the CalendarProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      render(<ConversationButton>Book a call</ConversationButton>),
    ).toThrow("useCalendar must be used within CalendarProvider");
  });

  it("calls the optional onClick handler before opening the calendar", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    renderWithCalendar(
      <>
        <ConversationButton onClick={onClick}>Book a call</ConversationButton>
        <CalendarModal />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Book a call" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByTitle("Google Calendar")).toBeInTheDocument();
  });
});

describe("ContactCtaLink", () => {
  it("goes to /inquiry and does not open the calendar", async () => {
    const user = userEvent.setup();

    renderWithCalendar(
      <>
        <ContactCtaLink>Let’s talk about your product</ContactCtaLink>
        <CalendarModal />
      </>,
    );

    const link = screen.getByRole("link", {
      name: "Let’s talk about your product",
    });
    expect(link).toHaveAttribute("href", "/inquiry");
    expect(link).toHaveAttribute("title", "Tell me about your project");

    await user.click(link);

    expect(screen.queryByTitle("Google Calendar")).not.toBeInTheDocument();
  });
});

describe("page CTAs", () => {
  it("send hero, closing, and inner-page intros to /inquiry", () => {
    render(
      <>
        <Hero />
        <FinalCta />
        <PageIntro
          eyebrow="Work"
          title="Selected work"
          lede="Example inner page."
        />
      </>,
    );

    const links = screen.getAllByRole("link", {
      name: "Let’s talk about your product",
    });

    expect(links).toHaveLength(3);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/inquiry");
    }
    expect(
      screen.queryByRole("button", { name: "Let’s talk about your product" }),
    ).not.toBeInTheDocument();
  });

  it("keeps only the header Schedule a call button as the calendar opener", () => {
    renderWithCalendar(<Header />);

    expect(
      screen.queryByRole("button", { name: "Start a conversation" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Schedule a call" }),
    ).not.toBeInTheDocument();

    const scheduleButtons = screen.getAllByRole("button", {
      name: "Schedule a call",
    });
    expect(scheduleButtons.length).toBeGreaterThanOrEqual(1);
    for (const button of scheduleButtons) {
      expect(button).toHaveAttribute("title", "Book a call");
    }
  });
});

describe("Calendar modal open and close", () => {
  function renderModal() {
    renderWithCalendar(
      <>
        <ConversationButton>Book a call</ConversationButton>
        <CalendarModal />
      </>,
    );
  }

  it("keeps the calendar iframe unmounted until opened", () => {
    renderModal();

    expect(screen.queryByTitle("Google Calendar")).not.toBeInTheDocument();
  });

  it("opens the modal with the booking iframe and locks scrolling", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Book a call" }));

    const iframe = screen.getByTitle("Google Calendar");
    expect(iframe).toHaveAttribute("src", site.calendarUrl);
    expect(document.body).toHaveStyle({ overflow: "hidden" });
  });

  it("closes via the close button and releases the scroll lock", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Book a call" }));
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByTitle("Google Calendar")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Book a call" }));
    expect(screen.getByTitle("Google Calendar")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByTitle("Google Calendar")).not.toBeInTheDocument();
  });
});
