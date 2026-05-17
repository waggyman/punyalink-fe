export type StoreBranding = {
  title: string;
  description: string;
  profilePicture: string | null;
  banner: string | null;
};

const STORAGE_PREFIX = "punyalink_store_branding_";

export function brandingStorageKey(tenant: string): string {
  return `${STORAGE_PREFIX}${tenant}`;
}

export const DEFAULT_STORE_BRANDING: StoreBranding = {
  title: "",
  description: "",
  profilePicture: null,
  banner: null,
};

export function readStoreBranding(tenant: string): StoreBranding {
  try {
    const raw = localStorage.getItem(brandingStorageKey(tenant));
    if (!raw) return { ...DEFAULT_STORE_BRANDING };
    const parsed = JSON.parse(raw) as Partial<StoreBranding>;
    return {
      title: typeof parsed.title === "string" ? parsed.title : "",
      description:
        typeof parsed.description === "string" ? parsed.description : "",
      profilePicture:
        typeof parsed.profilePicture === "string" || parsed.profilePicture === null
          ? parsed.profilePicture
          : null,
      banner:
        typeof parsed.banner === "string" || parsed.banner === null
          ? parsed.banner
          : null,
    };
  } catch {
    return { ...DEFAULT_STORE_BRANDING };
  }
}

export function writeStoreBranding(
  tenant: string,
  branding: StoreBranding,
): void {
  try {
    localStorage.setItem(brandingStorageKey(tenant), JSON.stringify(branding));
  } catch {
    /* quota / privacy mode */
  }
}
