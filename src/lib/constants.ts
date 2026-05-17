/** Paths that must not be treated as link accessLink slugs */
export const RESERVED_PATHS = new Set([
  "login",
  "dashboard",
  "collection",
  "register",
  "profile",
  "links",
]);

/** Lowercase letters, numbers, hyphen — used for links and bundles */
const SLUG_CHARS = /^[a-z0-9-]+$/;

/**
 * Short-link slug fragment for `POST /links` optional field.
 * Empty defers to server; when set uses `SLUG_CHARS` only.
 */
export function isValidAccessLinkSlug(slug: string): boolean {
  const s = slug.trim();
  if (!s) return true;
  return SLUG_CHARS.test(s);
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_PATHS.has(slug.toLowerCase());
}

/**
 * Store subdomain rules align with register DTO: `[a-z0-9-]+`, min length 3,
 * and must not collide with reserved app paths.
 */
export function validateStoreSubdomain(
  raw: string,
): "empty" | "charset" | "length" | "reserved" | null {
  const s = raw.trim().toLowerCase();
  if (!s) return "empty";
  if (!SLUG_CHARS.test(s)) return "charset";
  if (s.length < 3) return "length";
  if (RESERVED_PATHS.has(s)) return "reserved";
  return null;
}

export function normalizeCollectionSlugInput(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Omit empty slug. Otherwise must match PATCH DTO: [a-z0-9-], length 3–120, not reserved. */
export function validateCollectionSlugForSubmit(
  raw: string,
): "charset" | "length" | "reserved" | null {
  const s = normalizeCollectionSlugInput(raw);
  if (!s) return null;
  if (!SLUG_CHARS.test(s)) return "charset";
  if (s.length < 3 || s.length > 120) return "length";
  if (RESERVED_PATHS.has(s)) return "reserved";
  return null;
}

/** Updating `accessLink` — value must satisfy full PATCH rules */
export function validateCollectionSlugMandatory(
  raw: string,
): "charset" | "length" | "reserved" | null {
  const s = normalizeCollectionSlugInput(raw);
  if (!s || s.length < 3 || s.length > 120) return "length";
  if (!SLUG_CHARS.test(s)) return "charset";
  if (RESERVED_PATHS.has(s)) return "reserved";
  return null;
}
