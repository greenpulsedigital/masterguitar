import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Button, buttonVariants } from "@/components/ui/button";

describe("Button component API", () => {
  it("should render a button element", () => {
    const { container } = render(<Button>Click me</Button>);
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Click me");
  });

  it("should export buttonVariants for use with Link components", () => {
    // Verify buttonVariants is a function (from cva)
    expect(typeof buttonVariants).toBe("function");

    // Verify it returns a string of classes
    const classes = buttonVariants();
    expect(typeof classes).toBe("string");
    expect(classes.length).toBeGreaterThan(0);
  });

  it("should support variant and size options in buttonVariants", () => {
    const outlineSmall = buttonVariants({ variant: "outline", size: "sm" });
    expect(typeof outlineSmall).toBe("string");
    expect(outlineSmall.length).toBeGreaterThan(0);
  });
});
