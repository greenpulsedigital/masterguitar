import { describe, it, expect } from "vitest";

describe("App smoke test", () => {
  it("app exports without error", async () => {
    // Test that the layout module can be imported without error
    const layoutModule = await import("../app/layout");
    expect(layoutModule.default).toBeDefined();
    expect(typeof layoutModule.default).toBe("function");

    // Test that metadata is defined
    expect(layoutModule.metadata).toBeDefined();
    expect(layoutModule.metadata.title).toBe("MasterGuitar");
  });
});
