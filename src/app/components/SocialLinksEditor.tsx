import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";

import { useDashboardI18n } from "@/app/dashboard-i18n/use-dashboard-i18n";
import {
  SOCIAL_PLATFORMS,
  SOCIAL_PLATFORM_HANDLE_PREFIX,
  SOCIAL_PLATFORM_LABELS,
  platformsWithSocialUrls,
  type SocialPlatform,
} from "@/lib/social-links";

import { SocialPlatformIcon } from "./SocialPlatformIcon";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type SocialLinksEditorProps = {
  idBase: string;
  values: Record<SocialPlatform, string>;
  onChange: (values: Record<SocialPlatform, string>) => void;
  /** Bumped when profile data is loaded from the API so visible rows re-sync. */
  resetKey: number;
  disabled?: boolean;
};

function handlePlaceholder(platform: SocialPlatform): string {
  if (platform === "website") return "yoursite.com";
  if (platform === "whatsapp") return "6281234567890";
  return "username";
}

export function SocialLinksEditor({
  idBase,
  values,
  onChange,
  resetKey,
  disabled,
}: SocialLinksEditorProps) {
  const { t } = useDashboardI18n();
  const pickerId = useId();
  const [visiblePlatforms, setVisiblePlatforms] = useState<SocialPlatform[]>(
    [],
  );

  useEffect(() => {
    setVisiblePlatforms(platformsWithSocialUrls(values));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync visible rows only after API load/save
  }, [resetKey]);

  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (p) => !visiblePlatforms.includes(p),
  );

  function addPlatform(platform: SocialPlatform) {
    setVisiblePlatforms((prev) =>
      prev.includes(platform) ? prev : [...prev, platform],
    );
  }

  function removePlatform(platform: SocialPlatform) {
    setVisiblePlatforms((prev) => prev.filter((p) => p !== platform));
    onChange({ ...values, [platform]: "" });
  }

  function updateHandle(platform: SocialPlatform, handle: string) {
    const cleaned =
      platform === "website"
        ? handle.replace(/\s/g, "")
        : handle.replace(/\s/g, "").replace(/^@+/, "");
    onChange({ ...values, [platform]: cleaned });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:max-w-md sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Label htmlFor={pickerId} className="text-sm">
            {t.profileSocialAddLabel}
          </Label>
          <Select
            key={`social-picker-${visiblePlatforms.length}`}
            onValueChange={(v) => {
              if (v) addPlatform(v as SocialPlatform);
            }}
            disabled={disabled || availablePlatforms.length === 0}
          >
            <SelectTrigger id={pickerId} className="h-9 w-full">
              <SelectValue
                placeholder={
                  availablePlatforms.length === 0
                    ? t.profileSocialAllAdded
                    : t.profileSocialAddPlaceholder
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availablePlatforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  <span className="flex items-center gap-2">
                    <SocialPlatformIcon
                      platform={platform}
                      className="size-4 shrink-0"
                    />
                    {SOCIAL_PLATFORM_LABELS[platform]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {visiblePlatforms.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.profileSocialEmpty}</p>
      ) : (
        <ul className="space-y-2">
          {visiblePlatforms.map((platform) => {
            const prefix = SOCIAL_PLATFORM_HANDLE_PREFIX[platform];
            const isWebsite = platform === "website";
            return (
              <li
                key={platform}
                className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/15 py-1.5 pr-1 pl-2"
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded border bg-background"
                  title={SOCIAL_PLATFORM_LABELS[platform]}
                >
                  <SocialPlatformIcon
                    platform={platform}
                    className="size-3.5 text-foreground"
                  />
                </span>
                <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/40">
                  {prefix ? (
                    <span className="max-w-[42%] shrink-0 truncate border-r bg-muted/40 px-1.5 py-1.5 text-[10px] text-muted-foreground sm:max-w-none sm:px-2 sm:text-xs">
                      {prefix}
                    </span>
                  ) : (
                    <span className="shrink-0 border-r bg-muted/40 px-1.5 py-1.5 text-[10px] text-muted-foreground sm:px-2 sm:text-xs">
                      https://
                    </span>
                  )}
                  <Input
                    id={`${idBase}-social-${platform}`}
                    type={isWebsite ? "url" : "text"}
                    inputMode={platform === "whatsapp" ? "tel" : "text"}
                    autoComplete="off"
                    placeholder={
                      isWebsite
                        ? handlePlaceholder(platform)
                        : prefix
                          ? handlePlaceholder(platform)
                          : handlePlaceholder(platform)
                    }
                    value={values[platform]}
                    disabled={disabled}
                    onChange={(e) => updateHandle(platform, e.target.value)}
                    className="h-8 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={disabled}
                  onClick={() => removePlatform(platform)}
                  aria-label={`${t.profileSocialRemove} ${SOCIAL_PLATFORM_LABELS[platform]}`}
                >
                  <X className="size-4" aria-hidden />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">{t.profileSocialUsernameHint}</p>
    </div>
  );
}
