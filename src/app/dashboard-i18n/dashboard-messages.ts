export type DashboardLocale = "en" | "id";

export const DASHBOARD_LOCALE_STORAGE_KEY = "punyalink_dashboard_locale";

export function readDashboardLocale(): DashboardLocale {
  try {
    const raw = localStorage.getItem(DASHBOARD_LOCALE_STORAGE_KEY);
    if (raw === "id" || raw === "en") return raw;
  } catch {
    /* ignore */
  }
  return "en";
}

export function writeDashboardLocale(locale: DashboardLocale): void {
  try {
    localStorage.setItem(DASHBOARD_LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export type DashboardStrings = {
  storeOverview: string;
  dashboardTitle: string;
  taglineDesktop: string;
  publicPage: string;
  logOut: string;
  langEn: string;
  langId: string;
  langSwitchAria: string;
  statLinksTitle: string;
  statLinksSubtitle: (activeCount: number) => string;
  statViewsTitle: string;
  statViewsSubtitle: string;
  statClicksTitle: string;
  statClicksSubtitle: string;
  statCtrTitle: string;
  statCtrEmptySubtitle: string;
  statCtrSubtitle: string;
  engagementTitle: string;
  engagementDescription: string;
  chartViewsLabel: string;
  chartClicksLabel: string;
  visibilityTitle: string;
  visibilityDescription: string;
  visibilityPubLive: string;
  visibilityPrivLive: string;
  visibilityInactive: string;
  visibilityEmpty: string;
  summaryStorefront: string;
  summaryActiveAny: string;
  summaryHiddenOnly: string;
  pieTooltipSuffix: string;
  yourLinksTitle: string;
  yourLinksDescription: string;
  emptyLinksBody: string;
  previewStorefront: string;
  badgePrivate: string;
  badgeInactive: string;
  clickThroughLine: (pct: number) => string;
  clicksViewsLine: (clicks: number, views: number) => string;
  copyUrl: string;
  openButton: string;
  failedLoadLinks: string;
  toastCopiedTitle: string;
  toastCopiedDescriptionSuffix: string;
  emptyChartsHint: string;
  tooltipViewsWord: string;
  tooltipClicksWord: string;
  dashboardNavAria: string;
  navOverview: string;
  navProfile: string;
  navLinks: string;
  profilePageTitle: string;
  profilePageDescription: string;
  fieldStoreTitle: string;
  fieldStoreDescription: string;
  fieldProfilePicture: string;
  fieldBanner: string;
  uploadPickImage: string;
  profilePictureUrlPlaceholder: string;
  bannerUrlPlaceholder: string;
  avatarPreviewAlt: string;
  bannerPreviewAlt: string;
  profileClearPicture: string;
  profileClearBanner: string;
  profileSave: string;
  profileSaving: string;
  profileToastSaved: string;
  profileToastSavedLocally: string;
  profileToastSaveFailed: string;
  profileUploadTooLarge: (maxKb: number) => string;
  linksPageTitle: string;
  linksPageDescription: string;
  linksTableSlug: string;
  linksTableDestination: string;
  linksTableEngagement: string;
  linksTableStatus: string;
  linkAdd: string;
  linkEdit: string;
  linkDelete: string;
  linkDeleteConfirmTitle: string;
  linkDeleteConfirmBody: string;
  dialogCancel: string;
  dialogCreate: string;
  dialogSave: string;
  formNameLabel: string;
  formDestinationLabel: string;
  formSlugOptional: string;
  formSlugHint: string;
  formImageUrlLabel: string;
  formThumbnailPreviewLabel: string;
  formVisibleLabel: string;
  formActiveLabel: string;
  linksEmptyPrompt: string;
  slugInvalid: string;
  slugReserved: string;
  linkToastCreated: string;
  linkToastUpdated: string;
  linkToastDeleted: string;
  linkToastSaveFailed: string;
  navCollections: string;
  collectionsPageTitle: string;
  collectionsPageDescription: string;
  collectionAddNew: string;
  collectionEdit: string;
  collectionCopyShareUrl: string;
  collectionOpenPublic: string;
  collectionDelete: string;
  collectionDeleteConfirmTitle: string;
  collectionDeleteConfirmBody: string;
  collectionNameLabel: string;
  collectionSlugOptional: string;
  collectionSelectLinksHeading: string;
  collectionSelectLinksHelp: string;
  collectionMinTwoLinks: string;
  collectionNoActiveLinks: string;
  collectionInactiveLinksExcluded: string;
  collectionLinksLabel: (n: number) => string;
  collectionExpiresShort: string;
  collectionToastCreated: string;
  collectionToastUpdated: string;
  collectionToastDeleted: string;
  collectionToastFailed: string;
  collectionsEmpty: string;
  failedLoadCollections: string;
  collectionSlugLengthHint: string;
};

export const dashboardLocales: Record<DashboardLocale, DashboardStrings> = {
  en: {
    storeOverview: "Store overview",
    dashboardTitle: "Dashboard",
    taglineDesktop: "Track impressions, taps, and what visitors see.",
    publicPage: "Public page",
    logOut: "Log out",
    langEn: "EN",
    langId: "ID",
    langSwitchAria: "Dashboard language",
    statLinksTitle: "Links",
    statLinksSubtitle: (n) => `${n} active`,
    statViewsTitle: "Total views",
    statViewsSubtitle: "Across all links",
    statClicksTitle: "Total clicks",
    statClicksSubtitle: "Redirects / visits",
    statCtrTitle: "Click-through",
    statCtrEmptySubtitle: "Add links to measure",
    statCtrSubtitle: "clicks ÷ views (cap 100%)",
    engagementTitle: "Engagement by link",
    engagementDescription:
      "Views vs clicks · tap chart for full link name",
    chartViewsLabel: "Views",
    chartClicksLabel: "Clicks",
    visibilityTitle: "Visibility mix",
    visibilityDescription:
      "Public vs private · what’s visible on your page",
    visibilityPubLive: "Public · live",
    visibilityPrivLive: "Private · live",
    visibilityInactive: "Inactive",
    visibilityEmpty: "No links yet",
    summaryStorefront: "Shown on storefront",
    summaryActiveAny: "Active (any)",
    summaryHiddenOnly: "Hidden from list only",
    pieTooltipSuffix: "Links",
    yourLinksTitle: "Your links",
    yourLinksDescription:
      "Short paths under your subdomain · tap copy for the share URL",
    emptyLinksBody:
      "No links yet. When you create some in your API backend, they will appear here with engagement breakdowns.",
    previewStorefront: "Preview public storefront",
    badgePrivate: "Private",
    badgeInactive: "Inactive",
    clickThroughLine: (pct) => `Click-through (${pct}%)`,
    clicksViewsLine: (clicks, views) =>
      `${clicks} clicks · ${views} views`,
    copyUrl: "Copy URL",
    openButton: "Open",
    failedLoadLinks: "Failed to load links",
    toastCopiedTitle: "Short URL copied",
    toastCopiedDescriptionSuffix: "",
    emptyChartsHint: "Add links to see charts",
    tooltipViewsWord: "views",
    tooltipClicksWord: "clicks",
    dashboardNavAria: "Dashboard sections",
    navOverview: "Overview",
    navProfile: "Profile",
    navLinks: "Links",
    profilePageTitle: "Store profile",
    profilePageDescription:
      "Set your public page title, description, avatar, and banner image. Saves to your storefront when APIs are available and always mirrors locally in your browser for instant preview.",
    fieldStoreTitle: "Store title",
    fieldStoreDescription: "Store description",
    fieldProfilePicture: "Profile picture",
    fieldBanner: "Banner",
    uploadPickImage: "Choose image",
    profilePictureUrlPlaceholder: "Or paste image URL (https://…)",
    bannerUrlPlaceholder: "Or paste banner URL (https://…)",
    avatarPreviewAlt: "Avatar preview",
    bannerPreviewAlt: "Banner preview",
    profileClearPicture: "Clear picture",
    profileClearBanner: "Clear banner",
    profileSave: "Save storefront",
    profileSaving: "Saving…",
    profileToastSaved: "Storefront settings saved",
    profileToastSavedLocally:
      "Saved locally in this browser. Connect a store PATCH API for server sync.",
    profileToastSaveFailed: "Could not save storefront settings",
    profileUploadTooLarge: (maxKb) =>
      `File is too large (max ~${maxKb} KB). Use a smaller image or paste a URL.`,
    linksPageTitle: "Manage links",
    linksPageDescription:
      "Create short paths on your subdomain, point them to destinations, and control storefront visibility.",
    linksTableSlug: "Slug",
    linksTableDestination: "Destination",
    linksTableEngagement: "Views / clicks",
    linksTableStatus: "Status",
    linkAdd: "Add link",
    linkEdit: "Edit link",
    linkDelete: "Delete",
    linkDeleteConfirmTitle: "Delete link?",
    linkDeleteConfirmBody:
      "Visitors will lose this short URL. Stats for this row are discarded on the server.",
    dialogCancel: "Cancel",
    dialogCreate: "Create",
    dialogSave: "Save changes",
    formNameLabel: "Display name",
    formDestinationLabel: "Destination URL",
    formSlugOptional: "Slug (optional)",
    formSlugHint: "Lowercase letters, numbers, and hyphens — leave blank to auto-generate.",
    formImageUrlLabel: "Thumbnail URL (optional)",
    formThumbnailPreviewLabel: "Thumbnail preview",
    formVisibleLabel: "Show on public storefront",
    formActiveLabel: "Active",
    linksEmptyPrompt: "No links yet. Add one to get started.",
    slugInvalid: "Slug may only contain a–z, 0–9, and hyphen.",
    slugReserved:
      "This slug is reserved. Pick another slug for your branded path.",
    linkToastCreated: "Link created",
    linkToastUpdated: "Link updated",
    linkToastDeleted: "Link deleted",
    linkToastSaveFailed: "Could not save link",
    navCollections: "Collections",
    collectionsPageTitle: "Link collections",
    collectionsPageDescription:
      "Group active links into a shareable bundle. Visitors open it at /collection/your-slug (30‑day expiry on the API).",
    collectionAddNew: "New collection",
    collectionEdit: "Edit collection",
    collectionCopyShareUrl: "Copy share URL",
    collectionOpenPublic: "Open public page",
    collectionDelete: "Delete",
    collectionDeleteConfirmTitle: "Delete this collection?",
    collectionDeleteConfirmBody:
      "The share URL stops working for visitors and the bundle is removed from your dashboard.",
    collectionNameLabel: "Collection name",
    collectionSlugOptional: "URL slug (optional)",
    collectionSelectLinksHeading: "Include links",
    collectionSelectLinksHelp:
      "Choose at least two active links from your store.",
    collectionMinTwoLinks: "Pick at least two links for a collection.",
    collectionNoActiveLinks:
      "You need at least two active links before you can create a collection.",
    collectionInactiveLinksExcluded:
      "Inactive links are hidden here because the API only allows active links in bundles.",
    collectionLinksLabel: (n) => `${n} link${n === 1 ? "" : "s"}`,
    collectionExpiresShort: "Expires",
    collectionToastCreated: "Collection created",
    collectionToastUpdated: "Collection saved",
    collectionToastDeleted: "Collection removed",
    collectionToastFailed: "Something went wrong with collections",
    collectionsEmpty:
      "No collections yet. Create one to share a bundle of links with a single URL.",
    failedLoadCollections: "Failed to load collections",
    collectionSlugLengthHint:
      "If you set a custom slug it must be 3–120 characters (a–z, 0–9, hyphen).",
  },
  id: {
    storeOverview: "Ringkasan toko",
    dashboardTitle: "Dasbor",
    taglineDesktop:
      "Pantau tayangan, ketukan, dan apa yang dilihat pengunjung.",
    publicPage: "Halaman publik",
    logOut: "Keluar",
    langEn: "EN",
    langId: "ID",
    langSwitchAria: "Bahasa dasbor",
    statLinksTitle: "Tautan",
    statLinksSubtitle: (n) => `${n} aktif`,
    statViewsTitle: "Total tayangan",
    statViewsSubtitle: "Semua tautan gabungan",
    statClicksTitle: "Total klik",
    statClicksSubtitle: "Redirect / kunjungan",
    statCtrTitle: "CTR",
    statCtrEmptySubtitle: "Tambah tautan untuk mengukur",
    statCtrSubtitle: "klik ÷ tayangan (maks 100%)",
    engagementTitle: "Keterlibatan per tautan",
    engagementDescription:
      "Tayangan vs klik · ketuk grafik untuk nama lengkap",
    chartViewsLabel: "Tayangan",
    chartClicksLabel: "Klik",
    visibilityTitle: "Komposisi visibilitas",
    visibilityDescription:
      "Publik vs privat · apa yang terlihat di halaman Anda",
    visibilityPubLive: "Publik · aktif",
    visibilityPrivLive: "Privat · aktif",
    visibilityInactive: "Nonaktif",
    visibilityEmpty: "Belum ada tautan",
    summaryStorefront: "Tampil di halaman toko",
    summaryActiveAny: "Aktif (semua)",
    summaryHiddenOnly: "Tersembunyi dari daftar saja",
    pieTooltipSuffix: "Tautan",
    yourLinksTitle: "Tautan Anda",
    yourLinksDescription:
      "Path pendek di subdomain Anda · ketuk salin untuk URL berbagi",
    emptyLinksBody:
      "Belum ada tautan. Setelah Anda membuatnya di backend API, tautan akan muncul di sini dengan rincian keterlibatan.",
    previewStorefront: "Lihat halaman toko publik",
    badgePrivate: "Privat",
    badgeInactive: "Nonaktif",
    clickThroughLine: (pct) => `CTR (${pct}%)`,
    clicksViewsLine: (clicks, views) =>
      `${clicks} klik · ${views} tayangan`,
    copyUrl: "Salin URL",
    openButton: "Buka",
    failedLoadLinks: "Gagal memuat tautan",
    toastCopiedTitle: "URL pendek disalin",
    toastCopiedDescriptionSuffix: "",
    emptyChartsHint: "Tambah tautan untuk melihat grafik",
    tooltipViewsWord: "tayangan",
    tooltipClicksWord: "klik",
    dashboardNavAria: "Bagian dasbor",
    navOverview: "Ringkasan",
    navProfile: "Profil",
    navLinks: "Tautan",
    profilePageTitle: "Profil toko",
    profilePageDescription:
      "Atur judul halaman publik, deskripsi, avatar, dan banner. Disimpan di server jika API tersedia, dan dicerminkan lokal di browser untuk pratinjau cepat.",
    fieldStoreTitle: "Judul toko",
    fieldStoreDescription: "Deskripsi toko",
    fieldProfilePicture: "Foto profil",
    fieldBanner: "Banner",
    uploadPickImage: "Pilih gambar",
    profilePictureUrlPlaceholder: "Atau tempel URL gambar (https://…)",
    bannerUrlPlaceholder: "Atau tempel URL banner (https://…)",
    avatarPreviewAlt: "Pratinjau avatar",
    bannerPreviewAlt: "Pratinjau banner",
    profileClearPicture: "Hapus foto",
    profileClearBanner: "Hapus banner",
    profileSave: "Simpan vitrin",
    profileSaving: "Menyimpan…",
    profileToastSaved: "Pengaturan vitrin disimpan",
    profileToastSavedLocally:
      "Disimpan lokal di browser ini. Tambahkan PATCH store pada API untuk sinkron server.",
    profileToastSaveFailed: "Tidak dapat menyimpan pengaturan vitrin",
    profileUploadTooLarge: (maxKb) =>
      `Berkas terlalu besar (maks ~${maxKb} KB). Pakai gambar lebih kecil atau tempel URL.`,
    linksPageTitle: "Kelola tautan",
    linksPageDescription:
      "Buat path pendek di subdomain Anda, arahkan ke tujuan, dan atur visibilitas di halaman toko publik.",
    linksTableSlug: "Slug",
    linksTableDestination: "Tujuan",
    linksTableEngagement: "Tayangan / klik",
    linksTableStatus: "Status",
    linkAdd: "Tambah tautan",
    linkEdit: "Edit tautan",
    linkDelete: "Hapus",
    linkDeleteConfirmTitle: "Hapus tautan?",
    linkDeleteConfirmBody:
      "Pengunjung kehilangan URL pendek ini. Statistik baris dibuang di server.",
    dialogCancel: "Batal",
    dialogCreate: "Buat",
    dialogSave: "Simpan",
    formNameLabel: "Nama tampilan",
    formDestinationLabel: "URL tujuan",
    formSlugOptional: "Slug (opsional)",
    formSlugHint:
      "Huruf kecil, angka, dan tanda hubung — kosongkan untuk pembuatan otomatis.",
    formImageUrlLabel: "URL gambar thumbnail (opsional)",
    formThumbnailPreviewLabel: "Pratinjau thumbnail",
    formVisibleLabel: "Tampil di vitrin publik",
    formActiveLabel: "Aktif",
    linksEmptyPrompt: "Belum ada tautan. Tambahkan untuk memulai.",
    slugInvalid: "Slug hanya boleh a–z, 0–9, dan hubung (-).",
    slugReserved:
      "Slug ini dipesan sistem. Pakai slug lain untuk path bermerek Anda.",
    linkToastCreated: "Tautan dibuat",
    linkToastUpdated: "Tautan diperbarui",
    linkToastDeleted: "Tautan dihapus",
    linkToastSaveFailed: "Tidak dapat menyimpan tautan",
    navCollections: "Koleksi",
    collectionsPageTitle: "Koleksi tautan",
    collectionsPageDescription:
      "Gabungkan tautan aktif jadi satu bundel dibagikan. Pengunjung membuka di /collection/slug-anda (kadaluarsa 30 hari di API).",
    collectionAddNew: "Koleksi baru",
    collectionEdit: "Edit koleksi",
    collectionCopyShareUrl: "Salin URL berbagi",
    collectionOpenPublic: "Buka halaman publik",
    collectionDelete: "Hapus",
    collectionDeleteConfirmTitle: "Hapus koleksi ini?",
    collectionDeleteConfirmBody:
      "URL berbagi berhenti bekerja dan bundel hilang dari dasbor Anda.",
    collectionNameLabel: "Nama koleksi",
    collectionSlugOptional: "Slug URL (opsional)",
    collectionSelectLinksHeading: "Masukkan tautan",
    collectionSelectLinksHelp:
      "Pilih minimal dua tautan aktif dari toko Anda.",
    collectionMinTwoLinks: "Pilih minimal dua tautan untuk koleksi.",
    collectionNoActiveLinks:
      "Anda perlu minimal dua tautan aktif sebelum bisa membuat koleksi.",
    collectionInactiveLinksExcluded:
      "Tautan nonaktif disembunyikan karena API hanya mengizinkan tautan aktif dalam bundel.",
    collectionLinksLabel: (n) => `${n} tautan`,
    collectionExpiresShort: "Berakhir",
    collectionToastCreated: "Koleksi dibuat",
    collectionToastUpdated: "Koleksi disimpan",
    collectionToastDeleted: "Koleksi dihapus",
    collectionToastFailed: "Ada masalah dengan koleksi",
    collectionsEmpty:
      "Belum ada koleksi. Buat untuk membagi kumpulan tautan lewat satu URL.",
    failedLoadCollections: "Gagal memuat koleksi",
    collectionSlugLengthHint:
      "Slug kustom minimal 3–120 karakter (a–z, 0–9, hubung).",
  },
};
