import { Crown, Lock } from "lucide-react";

import { useStorefrontTheme } from "@/app/storefront/StorefrontThemeContext";
import {
  canUseStoreTheme,
  type StoreThemeDefinition,
  type StoreThemeId,
} from "@/lib/store-themes";
import { cn } from "./ui/utils";
import { Badge } from "./ui/badge";

type StoreThemePickerProps = {
  className?: string;
  compact?: boolean;
};

function ThemeOption({
  theme,
  selected,
  locked,
  compact,
  onSelect,
}: {
  theme: StoreThemeDefinition;
  selected: boolean;
  locked: boolean;
  compact?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all",
        selected
          ? "border-primary ring-2 ring-primary/25"
          : "border-border/80 hover:border-primary/40",
        locked && "cursor-not-allowed opacity-70",
      )}
    >
      <div
        className="flex h-16 items-end gap-1 p-2"
        style={{ background: theme.preview.background }}
      >
        <span
          className="h-8 flex-1 rounded-md shadow-sm"
          style={{ background: theme.preview.primary }}
        />
        <span
          className="h-5 w-5 rounded-full border border-white/50 shadow-sm"
          style={{ background: theme.preview.accent }}
        />
      </div>
      <div className="space-y-0.5 bg-card p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{theme.name}</span>
          {theme.isPremium ? (
            <Badge
              variant="secondary"
              className="gap-0.5 px-1.5 py-0 text-[10px] font-medium"
            >
              <Crown className="size-2.5" />
              Plus
            </Badge>
          ) : (
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
              Free
            </Badge>
          )}
        </div>
        {!compact && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {theme.description}
          </p>
        )}
      </div>
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-[1px]">
          <Lock className="size-5 text-muted-foreground" aria-hidden />
          <span className="sr-only">Requires Plus</span>
        </div>
      )}
    </button>
  );
}

export function StoreThemePicker({
  className,
  compact = false,
}: StoreThemePickerProps) {
  const { themeId, themes, isPlus, membershipLoading, setThemeId } =
    useStorefrontTheme();

  return (
    <div className={cn("space-y-3", className)}>
      {!compact && (
        <p className="text-sm text-muted-foreground">
          Choose how your public storefront looks. Selection is saved in a
          cookie on this browser until the API is connected.
          {membershipLoading
            ? " Checking membership…"
            : isPlus
              ? " You have access to all themes."
              : " Premium themes require Plus."}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {themes.map((theme) => {
          const locked = !canUseStoreTheme(theme, isPlus) && !membershipLoading;
          return (
            <ThemeOption
              key={theme.id}
              theme={theme}
              selected={themeId === theme.id}
              locked={locked}
              compact={compact}
              onSelect={() => setThemeId(theme.id as StoreThemeId)}
            />
          );
        })}
      </div>
    </div>
  );
}
