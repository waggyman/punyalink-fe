import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { useDashboardI18n } from "@/app/dashboard-i18n/use-dashboard-i18n";
import {
  ApiError,
  fetchStoreBrandingMaybe,
  patchStoreBrandingMaybe,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  DEFAULT_STORE_BRANDING,
  type StoreBranding,
  readStoreBranding,
  writeStoreBranding,
} from "@/lib/store-branding-local";
import type { StoreBrandingApi } from "@/lib/types";
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

const MAX_UPLOAD_KB = 512;

function mergeRemoteIntoForm(
  api: StoreBrandingApi | null,
  local: StoreBranding,
): StoreBranding {
  if (!api) return { ...local };
  return {
    title: typeof api.title === "string" ? api.title : local.title,
    description:
      typeof api.description === "string"
        ? api.description
        : local.description,
    profilePicture:
      api.profilePicture !== undefined &&
      api.profilePicture !== null &&
      api.profilePicture.length > 0
        ? api.profilePicture
        : api.profilePicture === null ||
            api.profilePicture === ""
          ? null
          : local.profilePicture,
    banner:
      api.banner !== undefined && api.banner !== null && api.banner.length > 0
        ? api.banner
        : api.banner === null || api.banner === ""
          ? null
          : local.banner,
  };
}

function readFileAsDataUrl(file: File, maxKb: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > maxKb * 1024) {
      reject(new Error("too_large"));
      return;
    }
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result ?? ""));
    fr.onerror = () => reject(fr.error ?? new Error("read_failed"));
    fr.readAsDataURL(file);
  });
}

export function StoreProfilePage({ tenant }: StoreProfilePageProps) {
  const { t } = useDashboardI18n();
  const { token, session } = useAuth();

  const idBase = useId();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const storeId = session?.store.id;

  const [form, setForm] = useState<StoreBranding>(() => ({
    ...DEFAULT_STORE_BRANDING,
    ...readStoreBranding(tenant),
  }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !storeId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const api = await fetchStoreBrandingMaybe(tenant, storeId, token);
        if (cancelled) return;
        const local = readStoreBranding(tenant);
        setForm(mergeRemoteIntoForm(api, local));
      } catch {
        if (!cancelled) {
          const local = readStoreBranding(tenant);
          setForm({ ...local });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tenant, token, storeId]);

  async function pickAvatarFile(file: File | null) {
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file, MAX_UPLOAD_KB);
      setForm((s) => ({ ...s, profilePicture: dataUrl }));
    } catch (e) {
      if ((e as Error).message === "too_large") {
        toast.error(t.profileUploadTooLarge(MAX_UPLOAD_KB));
      }
    }
  }

  async function pickBannerFile(file: File | null) {
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file, MAX_UPLOAD_KB);
      setForm((s) => ({ ...s, banner: dataUrl }));
    } catch (e) {
      if ((e as Error).message === "too_large") {
        toast.error(t.profileUploadTooLarge(MAX_UPLOAD_KB));
      }
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !storeId) return;
    const payload: StoreBranding = {
      title: form.title.trim(),
      description: form.description,
      profilePicture:
        typeof form.profilePicture === "string" &&
        form.profilePicture.trim() === ""
          ? null
          : form.profilePicture,
      banner:
        typeof form.banner === "string" && form.banner.trim() === ""
          ? null
          : form.banner,
    };
    setSaving(true);
    writeStoreBranding(tenant, payload);
    try {
      const updated = await patchStoreBrandingMaybe(tenant, storeId, token, {
        title: payload.title || null,
        description: payload.description || null,
        profilePicture: payload.profilePicture,
        banner: payload.banner,
      });
      setForm((prev) => mergeRemoteIntoForm(updated, prev));
      if (updated) {
        toast.success(t.profileToastSaved);
      } else {
        toast.success(t.profileToastSaved, {
          description: t.profileToastSavedLocally,
        });
      }
    } catch (err) {
      toast.error(t.profileToastSaveFailed, {
        description:
          err instanceof ApiError ? err.message : "Unexpected error",
      });
      toast.info(t.profileToastSavedLocally);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 px-3 py-6 sm:px-4 sm:py-10">
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle>{t.profilePageTitle}</CardTitle>
          <CardDescription className="text-pretty max-w-[60ch]">
            {t.profilePageDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-10" onSubmit={handleSave}>
            <fieldset
              disabled={loading || saving || !token}
              className="space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor={`${idBase}-avatar-url`}>{t.fieldProfilePicture}</Label>
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="size-28 overflow-hidden rounded-full border bg-muted shadow-sm ring-2 ring-border/70">
                      {form.profilePicture ? (
                        <img
                          src={form.profilePicture}
                          alt={t.avatarPreviewAlt}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                          —
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-[12rem] flex-1 flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        {t.uploadPickImage}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-fit px-2 text-muted-foreground"
                        onClick={() =>
                          setForm((s) => ({ ...s, profilePicture: null }))
                        }
                      >
                        {t.profileClearPicture}
                      </Button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        tabIndex={-1}
                        aria-hidden
                        onChange={(ev) =>
                          pickAvatarFile(ev.target.files?.[0] ?? null)
                        }
                      />
                      <Input
                        id={`${idBase}-avatar-url`}
                        placeholder={t.profilePictureUrlPlaceholder}
                        value={form.profilePicture ?? ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            profilePicture: e.target.value || null,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor={`${idBase}-banner-url`}>{t.fieldBanner}</Label>
                  <div
                    className="relative h-32 w-full overflow-hidden rounded-xl border bg-muted shadow-sm ring-2 ring-border/70"
                  >
                    {form.banner ? (
                      <img
                        src={form.banner}
                        alt={t.bannerPreviewAlt}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        —
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => bannerInputRef.current?.click()}
                    >
                      {t.uploadPickImage}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => setForm((s) => ({ ...s, banner: null }))}
                    >
                      {t.profileClearBanner}
                    </Button>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      tabIndex={-1}
                      aria-hidden
                      onChange={(ev) =>
                        pickBannerFile(ev.target.files?.[0] ?? null)
                      }
                    />
                  </div>
                  <Input
                    id={`${idBase}-banner-url`}
                    placeholder={t.bannerUrlPlaceholder}
                    value={form.banner ?? ""}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        banner: e.target.value || null,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${idBase}-title`}>{t.fieldStoreTitle}</Label>
                <Input
                  id={`${idBase}-title`}
                  value={form.title}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, title: e.target.value }))
                  }
                  placeholder={tenant}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${idBase}-desc`}>
                  {t.fieldStoreDescription}
                </Label>
                <Textarea
                  id={`${idBase}-desc`}
                  value={form.description}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, description: e.target.value }))
                  }
                  rows={4}
                  className="min-h-[96px] resize-y"
                  placeholder=""
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={!token}>
                  {saving ? t.profileSaving : t.profileSave}
                </Button>
              </div>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
