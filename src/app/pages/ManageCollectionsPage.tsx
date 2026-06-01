import {
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { Link as RouterLink } from "react-router";
import { Copy, Layers2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { useDashboardI18n } from "@/app/dashboard-i18n/use-dashboard-i18n";
import type { DashboardStrings } from "@/app/dashboard-i18n/dashboard-messages";
import {
  ApiError,
  createLinkCollection,
  deleteLinkCollection,
  fetchLinkCollectionById,
  fetchLinkCollections,
  fetchLinksList,
  patchLinkCollection,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  normalizeCollectionSlugInput,
  validateCollectionSlugForSubmit,
  validateCollectionSlugMandatory,
} from "@/lib/constants";
import type {
  CollectionListItem,
  Link as StoreLink,
  PatchLinkCollectionPayload,
} from "@/lib/types";
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
import { Checkbox } from "../components/ui/checkbox";
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
import { ScrollArea } from "../components/ui/scroll-area";
import { cn } from "../components/ui/utils";
import { Pagination } from "../components/Pagination";
import { SearchInput } from "../components/SearchInput";

type ManageCollectionsPageProps = {
  tenant: string;
};

type DetailBaseline = {
  name: string;
  accessLink: string;
  memberIds: string[];
};

const LINK_PICK_FALLBACK_IMG =
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=384&h=216&fit=crop";

const PICKER_PAGE_SIZE = 10;

function shortDestinationLabel(href: string, max = 52): string {
  const t = href.trim();
  if (!t) return "—";
  try {
    return new URL(t).hostname;
  } catch {
    return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
  }
}

function CollectionLinkPickCard({
  link,
  checked,
  disabled,
  inputId,
  onToggle,
  t,
}: {
  link: StoreLink;
  checked: boolean;
  disabled: boolean;
  inputId: string;
  onToggle: () => void;
  t: DashboardStrings;
}) {
  const [thumbBroken, setThumbBroken] = useState(false);
  useEffect(() => {
    setThumbBroken(false);
  }, [link.id, link.imageUrl]);

  const trimmedImg =
    typeof link.imageUrl === "string" ? link.imageUrl.trim() : "";
  const thumbSrc =
    trimmedImg && !thumbBroken ? trimmedImg : LINK_PICK_FALLBACK_IMG;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "block rounded-xl outline-none focus-within:ring-[3px] focus-within:ring-ring/55",
        disabled && "pointer-events-none opacity-60",
        !disabled && "cursor-pointer",
      )}
    >
      <Card
        className={cn(
          "overflow-hidden shadow-sm transition-all",
          checked
            ? "border-primary bg-primary/5 ring-2 ring-primary/25"
            : "border-border/80 hover:bg-muted/30",
        )}
      >
        <CardContent className="flex flex-row items-stretch gap-3 p-3 sm:gap-4 sm:p-4">
          <div className="flex shrink-0 items-start pt-0.5">
            <Checkbox
              id={inputId}
              checked={checked}
              disabled={disabled}
              onCheckedChange={() => onToggle()}
            />
          </div>
          <div className="relative h-[4.75rem] w-[6.75rem] shrink-0 overflow-hidden rounded-lg border bg-muted ring-1 ring-border/45 sm:h-[5rem] sm:w-[7.5rem]">
            <img
              src={thumbSrc}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full object-cover"
              onError={() => setThumbBroken(true)}
            />
          </div>
          <div className="min-w-0 flex flex-1 flex-col justify-center gap-1 py-0.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="min-w-0 truncate font-semibold text-sm leading-tight">
                {link.name}
              </span>
              {!link.isActive ? (
                <Badge variant="outline" className="text-[10px] font-normal">
                  {t.badgeInactive}
                </Badge>
              ) : null}
              {!link.isPublic ? (
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {t.badgePrivate}
                </Badge>
              ) : null}
            </div>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              /{link.accessLink}
            </p>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              <span className="font-medium text-muted-foreground/90">
                {t.linksTableDestination}
              </span>{" "}
              {shortDestinationLabel(link.externalLink)}
            </p>
          </div>
        </CardContent>
      </Card>
    </label>
  );
}

function shareUrl(coll: Pick<CollectionListItem, "accessLink">): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/collection/${coll.accessLink}`;
}

function toastSlugIssue(
  t: DashboardStrings,
  reason: "charset" | "length" | "reserved",
): void {
  if (reason === "charset") toast.error(t.slugInvalid);
  else if (reason === "reserved") toast.error(t.slugReserved);
  else toast.error(t.collectionSlugLengthHint);
}

export function ManageCollectionsPage({ tenant }: ManageCollectionsPageProps) {
  const { t } = useDashboardI18n();
  const { token } = useAuth();
  const idBase = useId();

  const [collections, setCollections] = useState<CollectionListItem[]>([]);
  const [activeLinksTotal, setActiveLinksTotal] = useState(0);
  const [loadCollErr, setLoadCollErr] = useState<string | null>(null);
  const [activeLinkCountErr, setActiveLinkCountErr] = useState<string | null>(
    null,
  );
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [activeLinkCountLoading, setActiveLinkCountLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<CollectionListItem | null>(
    null,
  );
  const [detailBaseline, setDetailBaseline] =
    useState<DetailBaseline | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [collectionName, setCollectionName] = useState("");
  const [slug, setSlug] = useState("");
  const [pickedIds, setPickedIds] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CollectionListItem | null>(
    null,
  );

  const [pickerSearchInput, setPickerSearchInput] = useState("");
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerPage, setPickerPage] = useState(1);
  const [pickerLinks, setPickerLinks] = useState<StoreLink[]>([]);
  const [pickerTotal, setPickerTotal] = useState(0);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerLoadErr, setPickerLoadErr] = useState<string | null>(null);

  const sortedCollections = useMemo(
    () =>
      [...collections].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [collections],
  );

  function reload() {
    if (!token) return;
    setLoadingCollections(true);
    setLoadCollErr(null);
    fetchLinkCollections(tenant, token)
      .then(setCollections)
      .catch((err) =>
        setLoadCollErr(
          err instanceof ApiError ? err.message : t.failedLoadCollections,
        ),
      )
      .finally(() => setLoadingCollections(false));

    setActiveLinkCountLoading(true);
    setActiveLinkCountErr(null);
    fetchLinksList(tenant, token, { page: 1, limit: 1 })
      .then((r) => setActiveLinksTotal(r.total))
      .catch((err) =>
        setActiveLinkCountErr(
          err instanceof ApiError ? err.message : t.failedLoadLinks,
        ),
      )
      .finally(() => setActiveLinkCountLoading(false));
  }

  useEffect(() => {
    if (!token) {
      setLoadingCollections(false);
      setActiveLinkCountLoading(false);
      return;
    }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [tenant, token]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setPickerSearch(pickerSearchInput.trim());
    }, 300);
    return () => window.clearTimeout(handle);
  }, [pickerSearchInput]);

  useEffect(() => {
    if (!dialogOpen || !token) return;
    if (editingRow && detailLoading) return;

    let cancelled = false;
    setPickerLoading(true);
    setPickerLoadErr(null);

    fetchLinksList(tenant, token, {
      page: pickerPage,
      limit: PICKER_PAGE_SIZE,
      search: pickerSearch || undefined,
    })
      .then((r) => {
        if (cancelled) return;
        setPickerLinks(r.items.filter((l) => l.isActive));
        setPickerTotal(r.total);
      })
      .catch((err) => {
        if (cancelled) return;
        setPickerLoadErr(
          err instanceof ApiError ? err.message : t.failedLoadLinks,
        );
      })
      .finally(() => {
        if (!cancelled) setPickerLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    dialogOpen,
    token,
    pickerPage,
    pickerSearch,
    tenant,
    editingRow,
    detailLoading,
    t.failedLoadLinks,
  ]);

  function onPickerSearchChange(value: string) {
    setPickerSearchInput(value);
    setPickerPage(1);
  }

  function clearDialogState() {
    setEditingRow(null);
    setDetailBaseline(null);
    setDetailLoading(false);
    setCollectionName("");
    setSlug("");
    setPickedIds(new Set());
    setPickerSearchInput("");
    setPickerSearch("");
    setPickerPage(1);
    setPickerLinks([]);
    setPickerTotal(0);
    setPickerLoadErr(null);
  }

  function openCreateDialog() {
    clearDialogState();
    setDialogOpen(true);
  }

  function openEditDialog(row: CollectionListItem) {
    if (!token) return;
    clearDialogState();
    setEditingRow(row);
    setDetailLoading(true);
    setDialogOpen(true);

    fetchLinkCollectionById(tenant, row.id, token)
      .then((detail) => {
        const snap: DetailBaseline = {
          name: detail.name,
          accessLink: normalizeCollectionSlugInput(detail.accessLink),
          memberIds: detail.links.map((l) => l.id),
        };
        setDetailBaseline(snap);
        setCollectionName(detail.name);
        setSlug(snap.accessLink);
        setPickedIds(new Set(snap.memberIds));
      })
      .catch((err) => {
        toast.error(t.collectionToastFailed, {
          description:
            err instanceof ApiError ? err.message : String(err),
        });
        clearDialogState();
        setDialogOpen(false);
      })
      .finally(() => setDetailLoading(false));
  }

  function togglePick(id: string) {
    setPickedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function copyShare(coll: CollectionListItem) {
    const url = shareUrl(coll);
    void navigator.clipboard.writeText(url);
    toast.success(t.toastCopiedTitle, { description: url });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || editingRow) return;
    const name = collectionName.trim();
    const ids = [...pickedIds];
    if (!name) return;
    if (ids.length < 2) {
      toast.error(t.collectionMinTwoLinks);
      return;
    }
    const slugErr = validateCollectionSlugForSubmit(slug);
    if (slugErr) {
      toastSlugIssue(t, slugErr);
      return;
    }
    const slugSend = normalizeCollectionSlugInput(slug);
    setSaving(true);
    try {
      await createLinkCollection(tenant, token, {
        name,
        linkIds: ids,
        accessLink: slugSend || undefined,
      });
      toast.success(t.collectionToastCreated);
      setDialogOpen(false);
      clearDialogState();
      reload();
    } catch (err) {
      toast.error(t.collectionToastFailed, {
        description:
          err instanceof ApiError ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !editingRow || !detailBaseline) return;
    const name = collectionName.trim();
    if (!name) return;
    if (pickedIds.size < 2) {
      toast.error(t.collectionMinTwoLinks);
      return;
    }

    const slugNorm = normalizeCollectionSlugInput(slug);
    const baselineSlugNorm = normalizeCollectionSlugInput(
      detailBaseline.accessLink,
    );
    const slugChanged = slugNorm !== baselineSlugNorm;

    if (slugChanged) {
      const errMandatory = validateCollectionSlugMandatory(slug);
      if (errMandatory) {
        toastSlugIssue(t, errMandatory);
        return;
      }
    }

    const baseMember = new Set(detailBaseline.memberIds);
    const addLinkIds = [...pickedIds].filter((id) => !baseMember.has(id));
    const removeLinkIds = [...baseMember].filter((id) => !pickedIds.has(id));

    const patch: PatchLinkCollectionPayload = {};
    if (name !== detailBaseline.name) patch.name = name;
    if (slugChanged) patch.accessLink = slugNorm;
    if (addLinkIds.length > 0) patch.addLinkIds = addLinkIds;
    if (removeLinkIds.length > 0) patch.removeLinkIds = removeLinkIds;

    const hasUpdates =
      typeof patch.name === "string" ||
      typeof patch.accessLink === "string" ||
      (patch.addLinkIds?.length ?? 0) > 0 ||
      (patch.removeLinkIds?.length ?? 0) > 0;

    if (!hasUpdates) {
      setDialogOpen(false);
      clearDialogState();
      return;
    }

    setSaving(true);
    try {
      await patchLinkCollection(tenant, editingRow.id, token, patch);
      toast.success(t.collectionToastUpdated);
      setDialogOpen(false);
      clearDialogState();
      reload();
    } catch (err) {
      toast.error(t.collectionToastFailed, {
        description:
          err instanceof ApiError ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!token || !deleteTarget) return;
    setSaving(true);
    try {
      await deleteLinkCollection(tenant, deleteTarget.id, token);
      toast.success(t.collectionToastDeleted);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast.error(t.collectionToastFailed, {
        description:
          err instanceof ApiError ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  }

  const canPickLinksCreate = activeLinksTotal >= 2;
  const hydrationLoading = loadingCollections || activeLinkCountLoading;
  const pickerTotalPages = Math.max(
    1,
    Math.ceil(pickerTotal / PICKER_PAGE_SIZE),
  );
  const isEditMode = editingRow !== null;
  const editorLocked =
    saving ||
    detailLoading ||
    (isEditMode && !detailBaseline) ||
    !token;

  const showEditor = !(isEditMode && detailLoading);

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 px-3 py-6 sm:px-4 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t.collectionsPageTitle}
          </h2>
          <p className="max-w-2xl text-pretty text-sm text-muted-foreground">
            {t.collectionsPageDescription}
          </p>
        </div>
        <Button
          type="button"
          disabled={!token || !canPickLinksCreate}
          className="shrink-0"
          onClick={openCreateDialog}
        >
          {t.collectionAddNew}
        </Button>
      </div>

      {!canPickLinksCreate &&
        !hydrationLoading &&
        !activeLinkCountErr && (
          <Card className="mb-6 border-dashed bg-muted/20">
            <CardContent className="flex flex-wrap items-start gap-3 py-4 text-sm text-muted-foreground">
              <Layers2
                className="mt-0.5 size-5 shrink-0 opacity-60"
                aria-hidden
              />
              <p>{t.collectionNoActiveLinks}</p>
              <Button variant="link" className="h-auto px-1 py-0" asChild>
                <RouterLink to="/dashboard/links">{t.navLinks}</RouterLink>
              </Button>
            </CardContent>
          </Card>
        )}

      {loadCollErr && (
        <Card className="mb-6 border-destructive/40 bg-destructive/5">
          <CardContent className="py-6 text-sm text-destructive">
            {loadCollErr}
          </CardContent>
        </Card>
      )}

      {hydrationLoading && (
        <p className="py-14 text-center text-muted-foreground">…</p>
      )}

      {!hydrationLoading && !loadCollErr && sortedCollections.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            {t.collectionsEmpty}
          </CardContent>
        </Card>
      )}

      {!hydrationLoading && sortedCollections.length > 0 && (
        <div className="grid gap-3">
          {sortedCollections.map((coll) => {
            const url = shareUrl(coll);
            return (
              <Card
                key={coll.id}
                className="overflow-hidden border-border/80 shadow-sm"
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">{coll.name}</p>
                      <Badge variant="secondary" className="font-normal">
                        {t.collectionLinksLabel(coll.linkCount)}
                      </Badge>
                    </div>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      /collection/{coll.accessLink}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.collectionExpiresShort}{" "}
                      <time dateTime={coll.expiredAt}>
                        {new Date(coll.expiredAt).toLocaleString()}
                      </time>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="gap-1.5"
                      disabled={!token}
                      onClick={() => copyShare(coll)}
                    >
                      <Copy className="size-3.5" />
                      {t.collectionCopyShareUrl}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {t.collectionOpenPublic}
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="gap-1.5"
                      disabled={!token}
                      onClick={() => openEditDialog(coll)}
                    >
                      <Pencil className="size-3.5" />
                      {t.collectionEdit}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={!token}
                      onClick={() => setDeleteTarget(coll)}
                    >
                      {t.collectionDelete}
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
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open && !saving) clearDialogState();
        }}
      >
        <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-6 sm:max-w-2xl">
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={isEditMode ? handleEditSave : handleCreate}
          >
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? t.collectionEdit : t.collectionAddNew}
              </DialogTitle>
              <DialogDescription className="text-pretty">
                {t.collectionSelectLinksHelp}
              </DialogDescription>
            </DialogHeader>

            {detailLoading && isEditMode ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                …
              </p>
            ) : showEditor ? (
              <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto py-4">
                <div className="grid gap-2">
                  <Label htmlFor={`${idBase}-cname`}>
                    {t.collectionNameLabel}
                  </Label>
                  <Input
                    id={`${idBase}-cname`}
                    required
                    disabled={editorLocked}
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    placeholder="Summer sale picks"
                    autoComplete="off"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`${idBase}-cslug`}>
                    {isEditMode ? t.linksTableSlug : t.collectionSlugOptional}
                  </Label>
                  <Input
                    id={`${idBase}-cslug`}
                    disabled={editorLocked}
                    placeholder={isEditMode ? undefined : "summer-2026"}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isEditMode
                      ? t.collectionSlugLengthHint
                      : t.formSlugHint}
                  </p>
                </div>
                <div className="grid min-h-[180px] flex-1 gap-2">
                  <Label>{t.collectionSelectLinksHeading}</Label>
                  <SearchInput
                    value={pickerSearchInput}
                    onChange={onPickerSearchChange}
                    placeholder={t.collectionPickerSearchPlaceholder}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.collectionPickerSelectedCount(
                      pickedIds.size,
                      pickerTotal,
                    )}{" "}
                    · {t.collectionMinTwoLinks}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400/90">
                    {t.collectionInactiveLinksExcluded}
                  </p>
                  {pickerLoadErr ? (
                    <p className="text-sm text-destructive">{pickerLoadErr}</p>
                  ) : (
                    <>
                      <ScrollArea className="h-[min(22rem,calc(100vh-22rem))] rounded-xl border bg-muted/15 px-3 py-3">
                        <div className="space-y-3 pr-4">
                          {pickerLoading && pickerLinks.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                              …
                            </p>
                          ) : pickerLinks.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                              {t.collectionPickerEmpty}
                            </p>
                          ) : (
                            pickerLinks.map((link) => {
                              const cid = `${idBase}-li-${link.id}`;
                              const checked = pickedIds.has(link.id);
                              return (
                                <CollectionLinkPickCard
                                  key={link.id}
                                  link={link}
                                  checked={checked}
                                  disabled={editorLocked}
                                  inputId={cid}
                                  onToggle={() => togglePick(link.id)}
                                  t={t}
                                />
                              );
                            })
                          )}
                        </div>
                      </ScrollArea>
                      <Pagination
                        currentPage={pickerPage}
                        totalPages={pickerTotalPages}
                        onPageChange={setPickerPage}
                        className="mt-2"
                      />
                    </>
                  )}
                </div>
              </div>
            ) : null}

            <DialogFooter className="gap-2 pt-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={saving}>
                  {t.dialogCancel}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={
                  editorLocked ||
                  pickedIds.size < 2 ||
                  !collectionName.trim() ||
                  detailLoading ||
                  (isEditMode && !detailBaseline)
                }
              >
                {isEditMode ? t.dialogSave : t.dialogCreate}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && !saving && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.collectionDeleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-pretty">
              {t.collectionDeleteConfirmBody}
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
              onClick={handleDeleteConfirmed}
            >
              {t.collectionDelete}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
