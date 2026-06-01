/** Hardcoded storefront theme catalog (cookie-backed until API). */

export type StoreThemeId =
  | "violet-classic"
  | "minimal-slate"
  | "ocean-plus"
  | "sunset-plus";

export type StoreThemeDefinition = {
  id: StoreThemeId;
  name: string;
  description: string;
  isPremium: boolean;
  /** Swatches for the theme picker preview */
  preview: {
    primary: string;
    background: string;
    accent: string;
  };
};

export const DEFAULT_STORE_THEME_ID: StoreThemeId = "violet-classic";

export const STORE_THEMES: StoreThemeDefinition[] = [
  {
    id: "violet-classic",
    name: "Violet Classic",
    description: "Default Punyalink look with violet accents.",
    isPremium: false,
    preview: {
      primary: "#7c3aed",
      background: "#faf5ff",
      accent: "#ddd6fe",
    },
  },
  {
    id: "minimal-slate",
    name: "Minimal Slate",
    description: "Clean neutrals and sharp contrast.",
    isPremium: false,
    preview: {
      primary: "#334155",
      background: "#f8fafc",
      accent: "#e2e8f0",
    },
  },
  {
    id: "ocean-plus",
    name: "Ocean Breeze",
    description: "Teal accents and a calm storefront feel.",
    isPremium: true,
    preview: {
      primary: "#0d9488",
      background: "#f0fdfa",
      accent: "#99f6e4",
    },
  },
  {
    id: "sunset-plus",
    name: "Sunset Glow",
    description: "Warm coral and rose highlights.",
    isPremium: true,
    preview: {
      primary: "#e11d48",
      background: "#fff1f2",
      accent: "#fecdd3",
    },
  },
];

const THEME_BY_ID = new Map(STORE_THEMES.map((t) => [t.id, t]));

export function getStoreTheme(id: string | null | undefined): StoreThemeDefinition {
  if (id && THEME_BY_ID.has(id as StoreThemeId)) {
    return THEME_BY_ID.get(id as StoreThemeId)!;
  }
  return THEME_BY_ID.get(DEFAULT_STORE_THEME_ID)!;
}

export function isStoreThemeId(value: string): value is StoreThemeId {
  return THEME_BY_ID.has(value as StoreThemeId);
}

export function canUseStoreTheme(
  theme: StoreThemeDefinition,
  isPlus: boolean,
): boolean {
  return !theme.isPremium || isPlus;
}
