import { describe, it, expect } from "vitest";
import { metadata } from "../app/layout";

describe("RootLayout", () => {
  it("should have French language metadata", () => {
    // Since the layout is a Server Component and uses lang="fr",
    // we verify the metadata is properly set for French content
    expect(metadata.title).toBe("MasterGuitar");
    expect(metadata.description).toBe("Plateforme d'apprentissage de la guitare en ligne");
  });
});
