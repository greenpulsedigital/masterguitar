/**
 * Format price in cents to French Euro format
 * @param cents - Price in cents (e.g., 4900 = 49.00€)
 * @returns Formatted price string (e.g., "49,00 €")
 */
export function formatPrice(cents: number): string {
  const euros = cents / 100
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(euros)
}
