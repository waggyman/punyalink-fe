/** Supported keys on `UserMe.socialLinks` and `PublicStoreOwner.socialLinks`. */
export const SOCIAL_PLATFORMS = [
  "instagram",
  "tiktok",
  "facebook",
  "x",
  "youtube",
  "linkedin",
  "pinterest",
  "snapchat",
  "threads",
  "whatsapp",
  "telegram",
  "discord",
  "twitch",
  "spotify",
  "github",
  "behance",
  "dribbble",
  "website",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export type SocialLinks = Partial<Record<SocialPlatform, string | null>>;

/** Profile URL prefix; user enters only the handle/path after this. */
export const SOCIAL_PLATFORM_BASE_URL: Record<SocialPlatform, string> = {
  instagram: "https://instagram.com/",
  tiktok: "https://www.tiktok.com/@",
  facebook: "https://facebook.com/",
  x: "https://x.com/",
  youtube: "https://www.youtube.com/@",
  linkedin: "https://www.linkedin.com/in/",
  pinterest: "https://www.pinterest.com/",
  snapchat: "https://www.snapchat.com/add/",
  threads: "https://www.threads.net/@",
  whatsapp: "https://wa.me/",
  telegram: "https://t.me/",
  discord: "https://discord.gg/",
  twitch: "https://www.twitch.tv/",
  spotify: "https://open.spotify.com/user/",
  github: "https://github.com/",
  behance: "https://www.behance.net/",
  dribbble: "https://dribbble.com/",
  website: "https://",
};

/** Shown beside the username field (without https://). */
export const SOCIAL_PLATFORM_HANDLE_PREFIX: Record<SocialPlatform, string> = {
  instagram: "instagram.com/",
  tiktok: "tiktok.com/@",
  facebook: "facebook.com/",
  x: "x.com/",
  youtube: "youtube.com/@",
  linkedin: "linkedin.com/in/",
  pinterest: "pinterest.com/",
  snapchat: "snapchat.com/add/",
  threads: "threads.net/@",
  whatsapp: "wa.me/",
  telegram: "t.me/",
  discord: "discord.gg/",
  twitch: "twitch.tv/",
  spotify: "open.spotify.com/user/",
  github: "github.com/",
  behance: "behance.net/",
  dribbble: "dribbble.com/",
  website: "",
};

export function emptySocialLinkForm(): Record<SocialPlatform, string> {
  return Object.fromEntries(
    SOCIAL_PLATFORMS.map((key) => [key, ""]),
  ) as Record<SocialPlatform, string>;
}

/** Form state holds handles/usernames, not full URLs (except website domain/path). */
export function socialLinksToFormValues(
  links: SocialLinks | null | undefined,
): Record<SocialPlatform, string> {
  const values = emptySocialLinkForm();
  if (!links) return values;
  for (const key of SOCIAL_PLATFORMS) {
    const url = links[key];
    values[key] =
      typeof url === "string" ? socialUrlToUsername(key, url) : "";
  }
  return values;
}

export function buildSocialLinksPayload(
  values: Record<SocialPlatform, string>,
): SocialLinks {
  const out: SocialLinks = {};
  for (const key of SOCIAL_PLATFORMS) {
    const handle = values[key]?.trim() ?? "";
    out[key] = handle === "" ? null : buildSocialProfileUrl(key, handle);
  }
  return out;
}

export function socialUrlToUsername(
  platform: SocialPlatform,
  url: string,
): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (platform === "website") {
    return trimmed
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/\/$/, "");
  }

  const handle = trimmed.replace(/^@/, "");

  const base = SOCIAL_PLATFORM_BASE_URL[platform];
  if (handle.toLowerCase().startsWith(base.toLowerCase())) {
    return handle.slice(base.length).replace(/^\/+/, "").replace(/\/$/, "");
  }

  try {
    const parsed = new URL(
      handle.includes("://") ? handle : `https://${handle}`,
    );
    const baseHost = new URL(base).hostname.replace(/^www\./, "");
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === baseHost || host.endsWith(`.${baseHost}`)) {
      return parsed.pathname.replace(/^\/+/, "").replace(/\/$/, "");
    }
  } catch {
    /* use raw handle */
  }

  if (handle.includes("://") || handle.includes("/")) {
    return "";
  }

  return handle;
}

export function buildSocialProfileUrl(
  platform: SocialPlatform,
  username: string,
): string {
  const raw = username.trim().replace(/^@+/, "");
  if (!raw) return "";

  if (platform === "website") {
    const host = raw
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/\/$/, "");
    if (!host || /\s/.test(host)) return "";
    const full = host.includes("://") ? host : `https://${host}`;
    try {
      const parsed = new URL(full);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return "";
      }
      return parsed.href.replace(/\/$/, "");
    } catch {
      return "";
    }
  }

  const handle = raw
    .replace(/^https?:\/\//i, "")
    .split("/")[0]
    ?.split("?")[0]
    ?.trim();
  if (!handle || /[\s/]/.test(handle)) return "";

  return `${SOCIAL_PLATFORM_BASE_URL[platform]}${handle}`;
}

/** Platforms that already have a URL in form state or API data. */
export function platformsWithSocialUrls(
  values: Record<SocialPlatform, string>,
): SocialPlatform[] {
  return SOCIAL_PLATFORMS.filter((p) => (values[p] ?? "").trim() !== "");
}

export function getActiveSocialLinks(
  links: SocialLinks | null | undefined,
): { platform: SocialPlatform; url: string }[] {
  if (!links) return [];
  return SOCIAL_PLATFORMS.flatMap((platform) => {
    const url = links[platform];
    if (typeof url !== "string" || !url.trim()) return [];
    return [{ platform, url: url.trim() }];
  });
}

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;
const WHATSAPP_PATTERN = /^\+?[0-9]{8,15}$/;

export function validateSocialUsername(
  platform: SocialPlatform,
  username: string,
): boolean {
  const trimmed = username.trim();
  if (!trimmed) return true;

  if (platform === "website") {
    return buildSocialProfileUrl(platform, trimmed) !== "";
  }

  if (platform === "whatsapp") {
    return WHATSAPP_PATTERN.test(trimmed.replace(/\s/g, ""));
  }

  if (!USERNAME_PATTERN.test(trimmed.replace(/^@/, ""))) {
    return false;
  }

  return buildSocialProfileUrl(platform, trimmed) !== "";
}

export function validateSocialLinkForm(
  values: Record<SocialPlatform, string>,
): SocialPlatform | null {
  for (const key of SOCIAL_PLATFORMS) {
    if (!validateSocialUsername(key, values[key] ?? "")) return key;
  }
  return null;
}

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  x: "X",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  snapchat: "Snapchat",
  threads: "Threads",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  discord: "Discord",
  twitch: "Twitch",
  spotify: "Spotify",
  github: "GitHub",
  behance: "Behance",
  dribbble: "Dribbble",
  website: "Website",
};
