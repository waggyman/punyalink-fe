import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { useDashboardI18n } from "@/app/dashboard-i18n/use-dashboard-i18n";
import {
  ApiError,
  fetchStoreMe,
  fetchUserMe,
  patchStoreMe,
  patchUserMe,
  resolveApiMediaUrl,
  uploadStoreBackgroundImage,
  uploadUserProfileImage,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  SOCIAL_PLATFORM_LABELS,
  buildSocialLinksPayload,
  socialLinksToFormValues,
  validateSocialLinkForm,
} from "@/lib/social-links";
import { SocialLinksEditor } from "../components/SocialLinksEditor";
import { StoreThemePicker } from "../components/StoreThemePicker";
import { StorefrontThemeProvider } from "../storefront/StorefrontThemeContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

type StoreProfilePageProps = {
  tenant: string;
};

const MAX_UPLOAD_MB = 2;

function assertFileSize(file: File, maxMb: number): void {
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error("too_large");
  }
}

export function StoreProfilePage({ tenant }: StoreProfilePageProps) {
  const { t } = useDashboardI18n();
  const { token } = useAuth();

  const idBase = useId();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [socialLinkValues, setSocialLinkValues] = useState(() =>
    socialLinksToFormValues(null),
  );
  const [socialLinksResetKey, setSocialLinksResetKey] = useState(0);

  const [storeTitle, setStoreTitle] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [user, store] = await Promise.all([
          fetchUserMe(tenant, token),
          fetchStoreMe(tenant, token),
        ]);
        if (cancelled) return;
        setOwnerName(user.name);
        setOwnerEmail(user.email);
        setProfileImageUrl(resolveApiMediaUrl(user.profileImageUrl));
        setSocialLinkValues(socialLinksToFormValues(user.socialLinks));
        setSocialLinksResetKey((k) => k + 1);
        setStoreTitle(store.title ?? "");
        setStoreDescription(store.description ?? "");
        setBackgroundImageUrl(resolveApiMediaUrl(store.backgroundImageUrl));
      } catch (err) {
        if (!cancelled) {
          toast.error(t.profileToastLoadFailed, {
            description:
              err instanceof ApiError ? err.message : "Unexpected error",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tenant, token, t]);

  async function handleAvatarFile(file: File | null) {
    if (!file || !token) return;
    try {
      assertFileSize(file, MAX_UPLOAD_MB);
    } catch {
      toast.error(t.profileUploadTooLarge(MAX_UPLOAD_MB * 1024));
      return;
    }
    setUploadingAvatar(true);
    try {
      const user = await uploadUserProfileImage(tenant, token, file);
      setProfileImageUrl(resolveApiMediaUrl(user.profileImageUrl));
      setOwnerName(user.name);
      toast.success(t.profileToastImageUploaded);
    } catch (err) {
      toast.error(t.profileToastSaveFailed, {
        description:
          err instanceof ApiError ? err.message : "Unexpected error",
      });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleBannerFile(file: File | null) {
    if (!file || !token) return;
    try {
      assertFileSize(file, MAX_UPLOAD_MB);
    } catch {
      toast.error(t.profileUploadTooLarge(MAX_UPLOAD_MB * 1024));
      return;
    }
    setUploadingBanner(true);
    try {
      const store = await uploadStoreBackgroundImage(tenant, token, file);
      setBackgroundImageUrl(resolveApiMediaUrl(store.backgroundImageUrl));
      toast.success(t.profileToastImageUploaded);
    } catch (err) {
      toast.error(t.profileToastSaveFailed, {
        description:
          err instanceof ApiError ? err.message : "Unexpected error",
      });
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const trimmedName = ownerName.trim();
    if (trimmedName.length < 2) {
      toast.error(t.profileOwnerNameTooShort);
      return;
    }
    const invalidPlatform = validateSocialLinkForm(socialLinkValues);
    if (invalidPlatform) {
      toast.error(
        t.profileSocialLinkInvalid(SOCIAL_PLATFORM_LABELS[invalidPlatform]),
      );
      return;
    }
    setSaving(true);
    try {
      const [user, store] = await Promise.all([
        patchUserMe(tenant, token, {
          name: trimmedName,
          socialLinks: buildSocialLinksPayload(socialLinkValues),
        }),
        patchStoreMe(tenant, token, {
          title: storeTitle.trim() || null,
          description: storeDescription,
        }),
      ]);
      setOwnerName(user.name);
      setOwnerEmail(user.email);
      setProfileImageUrl(resolveApiMediaUrl(user.profileImageUrl));
      setSocialLinkValues(socialLinksToFormValues(user.socialLinks));
      setSocialLinksResetKey((k) => k + 1);
      setStoreTitle(store.title ?? "");
      setStoreDescription(store.description ?? "");
      setBackgroundImageUrl(resolveApiMediaUrl(store.backgroundImageUrl));
      toast.success(t.profileToastSaved);
    } catch (err) {
      toast.error(t.profileToastSaveFailed, {
        description:
          err instanceof ApiError ? err.message : "Unexpected error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 px-3 py-6 sm:px-4 sm:py-10">
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle>{t.profilePageTitle}</CardTitle>
          <CardDescription className="max-w-[60ch] text-pretty">
            {t.profilePageDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSave}>
            <fieldset
              disabled={loading || saving || !token}
              className="space-y-8"
            >
              <section className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {t.profileSectionOwner}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.profileSectionOwnerHint}
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2 sm:max-w-md">
                    <Label htmlFor={`${idBase}-owner-name`}>
                      {t.fieldOwnerName}
                    </Label>
                    <Input
                      id={`${idBase}-owner-name`}
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      minLength={2}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2 sm:max-w-md">
                    <Label htmlFor={`${idBase}-owner-email`}>
                      {t.fieldOwnerEmail}
                    </Label>
                    <Input
                      id={`${idBase}-owner-email`}
                      value={ownerEmail}
                      readOnly
                      disabled
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="space-y-3 sm:col-span-2">
                    <Label>{t.fieldProfilePicture}</Label>
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="size-28 overflow-hidden rounded-full border bg-muted shadow-sm ring-2 ring-border/70">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt={t.avatarPreviewAlt}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                            —
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-fit"
                          disabled={uploadingAvatar}
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          {uploadingAvatar
                            ? t.profileUploading
                            : t.uploadPickImage}
                        </Button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          tabIndex={-1}
                          aria-hidden
                          onChange={(ev) =>
                            handleAvatarFile(ev.target.files?.[0] ?? null)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-5">
                  <div>
                    <h4 className="text-sm font-semibold tracking-tight">
                      {t.profileSectionSocialLinks}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t.profileSectionSocialLinksHint}
                    </p>
                  </div>
                  <SocialLinksEditor
                    idBase={idBase}
                    values={socialLinkValues}
                    onChange={setSocialLinkValues}
                    resetKey={socialLinksResetKey}
                    disabled={loading || saving || !token}
                  />
                </div>
              </section>

              <section className="space-y-5 border-t pt-6">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {t.profileSectionStore}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.profileSectionStoreHint}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>{t.fieldBanner}</Label>
                  <div className="relative h-32 w-full overflow-hidden rounded-xl border bg-muted shadow-sm ring-2 ring-border/70">
                    {backgroundImageUrl ? (
                      <img
                        src={backgroundImageUrl}
                        alt={t.bannerPreviewAlt}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        —
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingBanner}
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    {uploadingBanner ? t.profileUploading : t.uploadPickImage}
                  </Button>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                    onChange={(ev) =>
                      handleBannerFile(ev.target.files?.[0] ?? null)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${idBase}-title`}>{t.fieldStoreTitle}</Label>
                  <Input
                    id={`${idBase}-title`}
                    value={storeTitle}
                    onChange={(e) => setStoreTitle(e.target.value)}
                    placeholder={tenant}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${idBase}-desc`}>
                    {t.fieldStoreDescription}
                  </Label>
                  <Textarea
                    id={`${idBase}-desc`}
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    rows={4}
                    className="min-h-[96px] resize-y"
                  />
                </div>
              </section>

            </fieldset>

            <div className="sticky bottom-0 z-10 -mx-6 flex flex-wrap gap-3 border-t border-border/70 bg-card/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <Button type="submit" disabled={!token || saving || loading}>
                {saving ? t.profileSaving : t.profileSave}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6 border-border/70 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle>{t.profileSectionStorefrontTheme}</CardTitle>
          <CardDescription className="max-w-[60ch] text-pretty">
            {t.profileSectionStorefrontThemeHint}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StorefrontThemeProvider tenant={tenant}>
            <StoreThemePicker />
          </StorefrontThemeProvider>
        </CardContent>
      </Card>
    </main>
  );
}
