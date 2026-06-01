import {
  DEFAULT_STORE_THEME_ID,
  isStoreThemeId,
  type StoreThemeId,
} from "./store-themes";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

function cookieName(tenant: string): string {
  return `punyalink_store_theme_${tenant.trim().toLowerCase()}`;
}

export function readStoreThemeCookie(tenant: string): StoreThemeId | null {
  if (typeof document === "undefined") return null;
  const prefix = `${cookieName(tenant)}=`;
  const row = document.cookie
    .split("; ")
    .find((part) => part.startsWith(prefix));
  if (!row) return null;
  const raw = decodeURIComponent(row.slice(prefix.length));
  return isStoreThemeId(raw) ? raw : null;
}

export function writeStoreThemeCookie(
  tenant: string,
  themeId: StoreThemeId,
): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = [
    `${cookieName(tenant)}=${encodeURIComponent(themeId)}`,
    "path=/",
    `max-age=${COOKIE_MAX_AGE_SEC}`,
    "SameSite=Lax",
    secure,
  ].join("; ");
}

export function clearStoreThemeCookie(tenant: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${cookieName(tenant)}=; path=/; max-age=0; SameSite=Lax`;
}

export function readStoreThemeCookieOrDefault(tenant: string): StoreThemeId {
  return readStoreThemeCookie(tenant) ?? DEFAULT_STORE_THEME_ID;
}
