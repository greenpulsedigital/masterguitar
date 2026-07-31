import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

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

// Mock next-auth (requires next/server which doesn't resolve in Vitest)
vi.mock("next-auth", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => Promise.resolve(null)),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));
