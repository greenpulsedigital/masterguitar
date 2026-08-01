import { vi } from "vitest";

// Mock Next.js font functions
vi.mock("next/font/google", () => ({
  Geist: () => ({
    variable: "--font-geist-sans",
    className: "font-sans",
  }),
  Geist_Mono: () => ({
    variable: "--font-geist-mono",
    className: "font-mono",
  }),
}));
