export function generateSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Strip accents (é -> e)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special characters (keep word chars, spaces, hyphens)
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/-+/g, '-')        // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '')    // Remove leading/trailing hyphens
}
