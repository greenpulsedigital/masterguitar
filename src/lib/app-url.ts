/**
 * Public base URL of the app, used for Stripe success/cancel URLs.
 * Must be set in production: falling back to localhost would send customers to a dead page after paying.
 */
export function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL

  if (url) return url.replace(/\/+$/, "")

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_APP_URL is not set")
  }

  return "http://localhost:3000"
}
