import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

describe("jest-dom matchers", () => {
  it("should have toBeInTheDocument matcher available", () => {
    const { container } = render(<div>Test content</div>);
    const div = container.querySelector("div");

    // This test verifies @testing-library/jest-dom is properly imported
    // The toBeInTheDocument matcher should be available
    expect(div).toBeInTheDocument();
  });

  it("should have toHaveTextContent matcher available", () => {
    const { container } = render(<p>Hello World</p>);
    const paragraph = container.querySelector("p");

    expect(paragraph).toHaveTextContent("Hello World");
  });
});
