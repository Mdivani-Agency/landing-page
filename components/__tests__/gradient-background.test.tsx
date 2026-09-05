import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  pathname: "/",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

import { GradientBackground } from "@/components/gradient-background";

describe("GradientBackground", () => {
  it("keeps full intensity off the blog", () => {
    navigation.pathname = "/";
    const { container } = render(<GradientBackground />);

    expect(container.querySelector(".gradient-background")).not.toHaveClass(
      "opacity-[0.38]",
    );
  });

  it("dims the blobs on blog routes so body text stays readable", () => {
    navigation.pathname = "/blog/how-to-build-your-app-as-a-non-technical-founder";
    const { container } = render(<GradientBackground />);

    expect(container.querySelector(".gradient-background")).toHaveClass(
      "opacity-[0.38]",
    );
  });

  it("dims the blog index as well as individual posts", () => {
    navigation.pathname = "/blog";
    const { container } = render(<GradientBackground />);

    expect(container.querySelector(".gradient-background")).toHaveClass(
      "opacity-[0.38]",
    );
  });
});
