import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { useDashboardI18n } from "@/app/dashboard-i18n/use-dashboard-i18n";
import { LinkThumbnailCropDialog } from "@/app/components/LinkThumbnailCropDialog";
import {
  ApiError,
  createLink,
  deleteLink,
  fetchLinks,
  patchLink,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { isReservedSlug, isValidAccessLinkSlug } from "@/lib/constants";
import {
  LINK_THUMB_MAX_BYTES,
  validateLinkThumbnailDimensions,
  validateLinkThumbnailFile,
} from "@/lib/link-thumbnail-image";
import type { Link as StoreLink } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";

type ManageLinksPageProps = {
  tenant: string;
};

type LinkForm = {
  name: string;
  externalLink: string;
  accessLink: string;
  isPublic: boolean;
  isActive: boolean;
};

const EMPTY_FORM: LinkForm = {
  name: "",
  externalLink: "",
  accessLink: "",
  isPublic: true,
  isActive: true,
};

function linkToForm(link: StoreLink): LinkForm {
  return {
    name: link.name,
    externalLink: link.externalLink,
    accessLink: link.accessLink,
    isPublic: link.isPublic,
    isActive: link.isActive,
  };
}

const PLACEHOLDER_THUMB =
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=256&h=256&fit=crop";

const MAX_MB = LINK_THUMB_MAX_BYTES / (1024 * 1024);

export function ManageLinksPage({ tenant }: ManageLinksPageProps) {
  const { t } = useDashboardI18n();
  const { token } = useAuth();
  const idBase = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [links, setLinks] = useState<StoreLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<LinkForm>(EMPTY_FORM);

  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [imagePreviewBroken, setImagePreviewBroken] = useState(false);

  const [cropOpen, setCropOpen] = useState(false);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<StoreLink | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    };
  }, [previewObjectUrl]);

  useEffect(() => {
    setImagePreviewBroken(false);
  }, [existingImageUrl, previewObjectUrl]);

  function resetImageState() {
    setExistingImageUrl("");
    setPendingImageFile(null);
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    setPreviewObjectUrl(null);
    setCropSourceFile(null);
    setCropOpen(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function reloadLinks() {
    if (!token) return;
    setLoading(true);
    setLoadErr(null);
    fetchLinks(tenant, token)
      .then(setLinks)
      .catch((err) => {
        setLoadErr(err instanceof ApiError ? err.message : t.failedLoadLinks);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    reloadLinks();
  }, [tenant, token]);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    resetImageState();
    setDialogOpen(true);
  }

  function openEdit(link: StoreLink) {
    setEditId(link.id);
    setForm(linkToForm(link));
    resetImageState();
    setExistingImageUrl(link.imageUrl?.trim() ?? "");
    setDialogOpen(true);
  }

  async function handleImagePick(file: File | null) {
    if (!file) return;
    const basic = validateLinkThumbnailFile(file);
    if (basic === "type") {
      toast.error(t.linkImageInvalidType);
      return;
    }
    if (basic === "size") {
      toast.error(t.linkImageTooLarge(MAX_MB));
      return;
    }
    const dim = await validateLinkThumbnailDimensions(file);
    if (dim === "dimensions") {
      toast.error(t.linkImageTooSmall(640));
      return;
    }
    if (dim === "type") {
      toast.error(t.linkImageInvalidType);
      return;
    }
    setCropSourceFile(file);
    setCropOpen(true);
  }

  function handleCropConfirm(file: File) {
    setPendingImageFile(file);
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    setPreviewObjectUrl(URL.createObjectURL(file));
  }

  function clearPendingImage() {
    setPendingImageFile(null);
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    setPreviewObjectUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  async function handleSubmitSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const name = form.name.trim();
    const externalLink = form.externalLink.trim();
    if (!name || !externalLink) return;

    const slugInput = form.accessLink.trim().toLowerCase();
    if (!isValidAccessLinkSlug(slugInput)) {
      toast.error(t.slugInvalid);
      return;
    }
    if (slugInput && isReservedSlug(slugInput)) {
      toast.error(t.slugReserved);
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await patchLink(tenant, editId, token, {
          name,
          externalLink,
          isPublic: form.isPublic,
          isActive: form.isActive,
          ...(pendingImageFile ? { file: pendingImageFile } : {}),
        });
        toast.success(t.linkToastUpdated);
      } else {
        await createLink(tenant, token, {
          name,
          externalLink,
          accessLink: slugInput || undefined,
          isPublic: form.isPublic,
          isActive: form.isActive,
          ...(pendingImageFile ? { file: pendingImageFile } : {}),
        });
        toast.success(t.linkToastCreated);
      }
      setDialogOpen(false);
      resetImageState();
      reloadLinks();
    } catch (err) {
      toast.error(t.linkToastSaveFailed, {
        description:
          err instanceof ApiError ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!token || !deleteTarget) return;
    setSaving(true);
    try {
      await deleteLink(tenant, deleteTarget.id, token);
      toast.success(t.linkToastDeleted);
      setDeleteTarget(null);
      reloadLinks();
    } catch (err) {
      toast.error(t.linkToastSaveFailed, {
        description: err instanceof ApiError ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  }

  const imagePreviewSrc =
    previewObjectUrl ??
    (existingImageUrl.trim() && !imagePreviewBroken
      ? existingImageUrl.trim()
      : PLACEHOLDER_THUMB);

  const hasExistingThumb = !!existingImageUrl.trim();
  const hasPendingThumb = !!pendingImageFile;

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 px-3 py-6 sm:px-4 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t.linksPageTitle}
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground text-pretty">
            {t.linksPageDescription}
          </p>
        </div>
        <Button
          type="button"
          disabled={!token}
          className="shrink-0"
          onClick={openCreate}
        >
          {t.linkAdd}
        </Button>
      </div>

      {loading && (
        <p className="py-16 text-center text-muted-foreground">…</p>
      )}
      {!loading && loadErr && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-8 text-destructive">{loadErr}</CardContent>
        </Card>
      )}

      {!loading && !loadErr && links.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            {t.linksEmptyPrompt}
          </CardContent>
        </Card>
      )}

      {!loading && !loadErr && links.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-1">
          {links.map((link) => {
            const thumb =
              link.imageUrl && link.imageUrl.trim() !== ""
                ? link.imageUrl
                : PLACEHOLDER_THUMB;
            return (
              <Card
                key={link.id}
                className="overflow-hidden border-border/70 shadow-sm"
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/60">
                      <img
                        src={thumb}
                        alt=""
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold">{link.name}</p>
                        <Badge variant="secondary" className="font-mono text-xs">
                          /{link.accessLink}
                        </Badge>
                        {!link.isPublic && (
                          <Badge variant="outline">{t.badgePrivate}</Badge>
                        )}
                        {!link.isActive && (
                          <Badge variant="outline">{t.badgeInactive}</Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.linksTableDestination}:{" "}
                        <span className="font-mono">{link.externalLink}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.linksTableEngagement}: {link.view}{" "}
                        {t.tooltipViewsWord} · {link.click}{" "}
                        {t.tooltipClicksWord}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => openEdit(link)}
                    >
                      {t.linkEdit}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(link)}
                    >
                      {t.linkDelete}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!saving) {
            setDialogOpen(o);
            if (!o) resetImageState();
          }
        }}
      >
        <DialogContent className="max-h-[min(92vh,44rem)] overflow-hidden p-0 sm:max-w-lg">
          <form
            className="flex max-h-[min(92vh,44rem)] flex-col"
            onSubmit={handleSubmitSave}
          >
            <DialogHeader className="shrink-0 space-y-1.5 px-6 pt-6 pb-2 pr-12">
              <DialogTitle>{editId ? t.linkEdit : t.linkAdd}</DialogTitle>
              <DialogDescription className="text-pretty">
                {editId
                  ? `${t.linksTableSlug}: /${form.accessLink}`
                  : t.formSlugHint}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[calc(min(92vh,44rem)-7.25rem)] overflow-y-auto px-6 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`${idBase}-name`}>{t.formNameLabel}</Label>
                  <Input
                    id={`${idBase}-name`}
                    value={form.name}
                    required
                    onChange={(e) =>
                      setForm((s) => ({ ...s, name: e.target.value }))
                    }
                  />
                </div>
              <div className="grid gap-2">
                <Label htmlFor={`${idBase}-dst`}>{t.formDestinationLabel}</Label>
                <Input
                  id={`${idBase}-dst`}
                  type="url"
                  required
                  placeholder="https://"
                  value={form.externalLink}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      externalLink: e.target.value,
                    }))
                  }
                />
              </div>

              {!editId && (
                <div className="grid gap-2">
                  <Label htmlFor={`${idBase}-slug`}>
                    {t.formSlugOptional}
                  </Label>
                  <Input
                    id={`${idBase}-slug`}
                    placeholder="sale"
                    autoCorrect="off"
                    autoCapitalize="off"
                    value={form.accessLink}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        accessLink: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.formSlugHint}
                  </p>
                </div>
              )}

              {editId && (
                <div className="grid gap-2">
                  <Label>{t.linksTableSlug}</Label>
                  <Input
                    disabled
                    value={`/${form.accessLink}`}
                    className="font-mono opacity-70"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label>{t.formImageUploadLabel}</Label>
                <p className="text-xs text-muted-foreground">
                  {t.formImageUploadHint}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {hasExistingThumb || hasPendingThumb
                      ? t.linkReplaceImage
                      : t.linkPickImage}
                  </Button>
                  {hasPendingThumb && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={clearPendingImage}
                    >
                      {t.linkClearNewImage}
                    </Button>
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                    onChange={(ev) =>
                      handleImagePick(ev.target.files?.[0] ?? null)
                    }
                  />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t.formThumbnailPreviewLabel}
                </p>
                <div className="relative mx-auto mt-1 aspect-video w-full max-w-xs overflow-hidden rounded-xl border bg-muted shadow-inner ring-1 ring-border/50">
                  <img
                    src={imagePreviewSrc}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 size-full object-cover"
                    onError={() => setImagePreviewBroken(true)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                <Label htmlFor={`${idBase}-pub`} className="block">
                  {t.formVisibleLabel}
                </Label>
                <Switch
                  id={`${idBase}-pub`}
                  checked={form.isPublic}
                  onCheckedChange={(v) =>
                    setForm((s) => ({ ...s, isPublic: v }))
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                <Label htmlFor={`${idBase}-active`} className="block">
                  {t.formActiveLabel}
                </Label>
                <Switch
                  id={`${idBase}-active`}
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((s) => ({ ...s, isActive: v }))
                  }
                />
              </div>
              </div>
            </div>

            <DialogFooter className="shrink-0 gap-3 border-t border-border/80 bg-background px-6 pt-4 pb-6">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={saving}>
                  {t.dialogCancel}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={saving}>
                {editId ? t.dialogSave : t.dialogCreate}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LinkThumbnailCropDialog
        open={cropOpen}
        file={cropSourceFile}
        onOpenChange={setCropOpen}
        onConfirm={handleCropConfirm}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && !saving && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.linkDeleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-pretty">
              {t.linkDeleteConfirmBody}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>
              {t.dialogCancel}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              type="button"
              disabled={saving}
              onClick={confirmDelete}
            >
              {t.linkDelete}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
