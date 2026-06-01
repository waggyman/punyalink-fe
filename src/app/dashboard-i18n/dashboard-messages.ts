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
  emptyChartsNoLinks: string;
  emptyChartsNoActivity: string;
  emptyTopLinksNoLinks: string;
  emptyTopLinksNoActivity: string;
  tooltipViewsWord: string;
  tooltipClicksWord: string;
  dashboardNavAria: string;
  navOverview: string;
  navProfile: string;
  navLinks: string;
  profilePageTitle: string;
  profilePageDescription: string;
  profileSectionOwner: string;
  profileSectionOwnerHint: string;
  profileSectionSocialLinks: string;
  profileSectionSocialLinksHint: string;
  profileSocialAddLabel: string;
  profileSocialAddPlaceholder: string;
  profileSocialAllAdded: string;
  profileSocialEmpty: string;
  profileSocialRemove: string;
  profileSocialUsernameHint: string;
  profileSocialLinkInvalid: (platform: string) => string;
  profileSectionStore: string;
  profileSectionStoreHint: string;
  profileSectionStorefrontTheme: string;
  profileSectionStorefrontThemeHint: string;
  fieldOwnerName: string;
  fieldOwnerEmail: string;
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
  profileUploading: string;
  profileToastSaved: string;
  profileToastSavedLocally: string;
  profileToastSaveFailed: string;
  profileToastLoadFailed: string;
  profileToastImageUploaded: string;
  profileOwnerNameTooShort: string;
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
  formImageUploadLabel: string;
  formImageUploadHint: string;
  formThumbnailPreviewLabel: string;
  linkPickImage: string;
  linkReplaceImage: string;
  linkClearNewImage: string;
  linkCropTitle: string;
  linkCropDescription: string;
  linkCropHint: string;
  linkCropApply: string;
  linkCropApplying: string;
  linkCropZoomAria: string;
  linkCropFrameAria: string;
  linkImageInvalidType: string;
  linkImageTooLarge: (maxMb: number) => string;
  linkImageTooSmall: (minPx: number) => string;
  linkImageCropFailed: string;
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
  collectionPickerSearchPlaceholder: string;
  collectionPickerEmpty: string;
  collectionPickerSelectedCount: (selected: number, total: number) => string;
  collectionLinksLabel: (n: number) => string;
  collectionExpiresShort: string;
  collectionToastCreated: string;
  collectionToastUpdated: string;
  collectionToastDeleted: string;
  collectionToastFailed: string;
  collectionsEmpty: string;
  failedLoadCollections: string;
  collectionSlugLengthHint: string;
  failedLoadDashboard: string;
  profileBannerTitle: string;
  profileBannerDescription: (completed: number, total: number) => string;
  profileBannerProgress: string;
  profileBannerCta: string;
  profileBannerItem: (
    key: "profileImage" | "storeTitle" | "storeDescription" | "storeBackground",
  ) => string;
  membershipTitle: string;
  membershipDescription: string;
  membershipRenewalWarning: string;
  membershipExpiresOn: (date: string) => string;
  membershipLimitCollections: string;
  membershipLimitLinksPerCollection: string;
  membershipUnlimited: string;
  membershipCollectionsQuota: (used: number, allowed: number) => string;
  membershipFeatureCustomLink: string;
  membershipFeatureCustomLinkHint: string;
  membershipFeatureCustomCollection: string;
  membershipFeatureCustomCollectionHint: string;
  membershipFeatureIncluded: string;
  membershipFeatureDisabled: string;
  membershipUpgradeTeaser: (planName: string) => string;
  membershipUpgradePrice: (price: string, days: number) => string;
  membershipUpgradeButton: string;
  membershipPendingPurchase: string;
  plusUpgradeDialogTitle: (planName: string) => string;
  plusUpgradeDialogTitleReceipt: string;
  plusUpgradeReceiptPendingHint: string;
  plusUpgradeLoading: string;
  plusUpgradeInvoiceAmount: string;
  plusUpgradeBank: string;
  plusUpgradeAccountNumber: string;
  plusUpgradeReceiptLabel: string;
  plusUpgradeReceiptHint: string;
  plusUpgradePickReceipt: string;
  plusUpgradeSubmitReceipt: string;
  plusUpgradeSubmitting: string;
  plusUpgradeSuccessTitle: string;
  plusUpgradeSuccessBody: string;
  plusUpgradeFailed: string;
  plusUpgradeNoPendingPurchase: string;
  plusUpgradeCopyAccount: string;
  plusUpgradeCopied: string;
  plusUpgradeClose: string;
  trendsTitle: string;
  trendsDescription: string;
  topLinksTitle: string;
  topLinksDescription: string;
  statViewsSubtitlePeriod: string;
  statClicksSubtitlePeriod: string;
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
    emptyChartsNoLinks: "Add links to see activity charts here",
    emptyChartsNoActivity:
      "No views or clicks in the last 30 days yet. Share your links to start tracking.",
    emptyTopLinksNoLinks: "Add links to see which ones get the most clicks",
    emptyTopLinksNoActivity:
      "No clicks yet. Your most-clicked links will show up here.",
    tooltipViewsWord: "views",
    tooltipClicksWord: "clicks",
    dashboardNavAria: "Dashboard sections",
    navOverview: "Overview",
    navProfile: "Profile",
    navLinks: "Links",
    profilePageTitle: "Store profile",
    profilePageDescription:
      "Update your owner account and public storefront. Images upload immediately; text fields save together.",
    profileSectionOwner: "Owner account",
    profileSectionOwnerHint:
      "Your display name and avatar appear on the public storefront.",
    profileSectionSocialLinks: "Social links",
    profileSectionSocialLinksHint:
      "Pick a network and enter your username — we build the correct profile link for you.",
    profileSocialAddLabel: "Add network",
    profileSocialAddPlaceholder: "Choose a social network…",
    profileSocialAllAdded: "All networks added",
    profileSocialEmpty: "No social links yet. Choose one from the list above.",
    profileSocialRemove: "Remove",
    profileSocialUsernameHint:
      "Enter only your username (or phone for WhatsApp, domain for Website). No other sites.",
    profileSocialLinkInvalid: (platform) =>
      `${platform}: enter a valid username for this network`,
    profileSectionStore: "Public storefront",
    profileSectionStoreHint:
      "Title, description, and background shown on your store homepage.",
    profileSectionStorefrontTheme: "Storefront theme",
    profileSectionStorefrontThemeHint:
      "How your public page looks to visitors. Two free themes; Plus unlocks premium styles. Saved in a cookie until API sync.",
    fieldOwnerName: "Display name",
    fieldOwnerEmail: "Email",
    fieldStoreTitle: "Store title",
    fieldStoreDescription: "Store description",
    fieldProfilePicture: "Profile picture",
    fieldBanner: "Background image",
    uploadPickImage: "Choose image",
    profilePictureUrlPlaceholder: "Or paste image URL (https://…)",
    bannerUrlPlaceholder: "Or paste banner URL (https://…)",
    avatarPreviewAlt: "Avatar preview",
    bannerPreviewAlt: "Banner preview",
    profileClearPicture: "Clear picture",
    profileClearBanner: "Clear banner",
    profileSave: "Save text fields",
    profileSaving: "Saving…",
    profileUploading: "Uploading…",
    profileToastSaved: "Profile saved",
    profileToastSavedLocally:
      "Saved locally in this browser. Connect a store PATCH API for server sync.",
    profileToastSaveFailed: "Could not save profile",
    profileToastLoadFailed: "Could not load profile",
    profileToastImageUploaded: "Image uploaded",
    profileOwnerNameTooShort: "Display name must be at least 2 characters.",
    profileUploadTooLarge: (maxKb) =>
      `File is too large (max ~${maxKb} KB). Choose a smaller image.`,
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
    formImageUploadLabel: "Card thumbnail",
    formImageUploadHint:
      "16:9 landscape, max 2 MB. Drag to reposition and use the slider to zoom before saving.",
    formThumbnailPreviewLabel: "Thumbnail preview",
    linkPickImage: "Upload image",
    linkReplaceImage: "Replace image",
    linkClearNewImage: "Discard new image",
    linkCropTitle: "Crop thumbnail",
    linkCropDescription:
      "Frame your image for the link card. The visible area is saved as a 16:9 JPEG.",
    linkCropHint: "Drag the image to reposition · use the slider to zoom",
    linkCropApply: "Use this crop",
    linkCropApplying: "Processing…",
    linkCropZoomAria: "Zoom",
    linkCropFrameAria: "Crop preview frame",
    linkImageInvalidType: "Please choose a JPEG, PNG, or WebP image.",
    linkImageTooLarge: (maxMb) => `Image must be ${maxMb} MB or smaller.`,
    linkImageTooSmall: (minPx) =>
      `Image is too small — shortest side should be at least ${minPx}px.`,
    linkImageCropFailed: "Could not prepare the image. Try another file.",
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
    collectionPickerSearchPlaceholder: "Search links…",
    collectionPickerEmpty: "No links match your search.",
    collectionPickerSelectedCount: (selected, total) =>
      `${selected} selected · ${total} link${total === 1 ? "" : "s"}`,
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
    failedLoadDashboard: "Failed to load dashboard",
    profileBannerTitle: "Complete your storefront profile",
    profileBannerDescription: (completed, total) =>
      `${completed} of ${total} profile steps done — finish the rest so visitors trust your page.`,
    profileBannerProgress: "Profile completion",
    profileBannerCta: "Finish profile",
    profileBannerItem: (key) =>
      ({
        profileImage: "Profile photo",
        storeTitle: "Store title",
        storeDescription: "Store description",
        storeBackground: "Background image",
      })[key],
    membershipTitle: "Membership",
    membershipDescription: "Your plan limits and features for this store.",
    membershipRenewalWarning:
      "Your Plus plan is ending soon. Renew to keep unlimited collections and custom slugs.",
    membershipExpiresOn: (date) => `Expires ${date}`,
    membershipLimitCollections: "Collections",
    membershipLimitLinksPerCollection: "Links per collection",
    membershipUnlimited: "Unlimited",
    membershipCollectionsQuota: (used, allowed) =>
      `${used} of ${allowed} collection slots used on this plan`,
    membershipFeatureCustomLink: "Custom link paths",
    membershipFeatureCustomLinkHint:
      "Choose your own short URL when creating a link (e.g. /summer-sale).",
    membershipFeatureCustomCollection: "Custom collection paths",
    membershipFeatureCustomCollectionHint:
      "Choose your own short URL when creating a link collection.",
    membershipFeatureIncluded: "Included",
    membershipFeatureDisabled: "Disabled",
    membershipUpgradeTeaser: (planName) => `Upgrade to ${planName} for more`,
    membershipUpgradePrice: (price, days) => `${price} / ${days} days`,
    membershipUpgradeButton: "Upgrade to Plus",
    membershipPendingPurchase:
      "Plus payment pending — upload your transfer receipt or wait for admin verification.",
    plusUpgradeDialogTitle: (planName) => `Upgrade to ${planName}`,
    plusUpgradeDialogTitleReceipt: "Submit Plus payment",
    plusUpgradeReceiptPendingHint:
      "Transfer the exact amount below, then upload your receipt.",
    plusUpgradeLoading: "Preparing payment details…",
    plusUpgradeInvoiceAmount: "Transfer amount (exact)",
    plusUpgradeBank: "Bank",
    plusUpgradeAccountNumber: "Account number",
    plusUpgradeReceiptLabel: "Transfer receipt",
    plusUpgradeReceiptHint: "Upload a screenshot or PDF of your bank transfer.",
    plusUpgradePickReceipt: "Choose file",
    plusUpgradeSubmitReceipt: "Submit receipt",
    plusUpgradeSubmitting: "Uploading…",
    plusUpgradeSuccessTitle: "Receipt submitted",
    plusUpgradeSuccessBody:
      "We received your receipt. Plus activates after admin verification.",
    plusUpgradeFailed: "Could not complete Plus purchase",
    plusUpgradeNoPendingPurchase: "No pending Plus payment found.",
    plusUpgradeCopyAccount: "Copy account number",
    plusUpgradeCopied: "Account number copied",
    plusUpgradeClose: "Close",
    trendsTitle: "Views & clicks over time",
    trendsDescription: "Daily totals for the last 30 days",
    topLinksTitle: "Top clicked links",
    topLinksDescription: "Links with the most clicks in your store",
    statViewsSubtitlePeriod: "Last 30 days",
    statClicksSubtitlePeriod: "Last 30 days",
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
    emptyChartsNoLinks: "Tambah tautan untuk melihat grafik aktivitas di sini",
    emptyChartsNoActivity:
      "Belum ada tayangan atau klik dalam 30 hari terakhir. Bagikan tautan Anda untuk mulai melacak.",
    emptyTopLinksNoLinks:
      "Tambah tautan untuk melihat tautan dengan klik terbanyak",
    emptyTopLinksNoActivity:
      "Belum ada klik. Tautan paling sering diklik akan muncul di sini.",
    tooltipViewsWord: "tayangan",
    tooltipClicksWord: "klik",
    dashboardNavAria: "Bagian dasbor",
    navOverview: "Ringkasan",
    navProfile: "Profil",
    navLinks: "Tautan",
    profilePageTitle: "Profil toko",
    profilePageDescription:
      "Perbarui akun pemilik dan vitrin publik. Gambar diunggah langsung; teks disimpan bersama.",
    profileSectionOwner: "Akun pemilik",
    profileSectionOwnerHint:
      "Nama tampilan dan avatar Anda muncul di halaman toko publik.",
    profileSectionSocialLinks: "Tautan sosial",
    profileSectionSocialLinksHint:
      "Pilih jaringan lalu isi username — kami yang menyusun tautan profil yang benar.",
    profileSocialAddLabel: "Tambah jaringan",
    profileSocialAddPlaceholder: "Pilih jaringan sosial…",
    profileSocialAllAdded: "Semua jaringan sudah ditambahkan",
    profileSocialEmpty:
      "Belum ada tautan sosial. Pilih dari daftar di atas.",
    profileSocialRemove: "Hapus",
    profileSocialUsernameHint:
      "Isi username saja (atau nomor untuk WhatsApp, domain untuk Website). Bukan situs lain.",
    profileSocialLinkInvalid: (platform) =>
      `${platform}: masukkan username yang valid untuk jaringan ini`,
    profileSectionStore: "Vitrin publik",
    profileSectionStoreHint:
      "Judul, deskripsi, dan latar belakang di halaman utama toko.",
    profileSectionStorefrontTheme: "Tema etalase",
    profileSectionStorefrontThemeHint:
      "Tampilan halaman publik untuk pengunjung. Dua tema gratis; Plus membuka tema premium. Disimpan di cookie sampai API tersedia.",
    fieldOwnerName: "Nama tampilan",
    fieldOwnerEmail: "Email",
    fieldStoreTitle: "Judul toko",
    fieldStoreDescription: "Deskripsi toko",
    fieldProfilePicture: "Foto profil",
    fieldBanner: "Gambar latar",
    uploadPickImage: "Pilih gambar",
    profilePictureUrlPlaceholder: "Atau tempel URL gambar (https://…)",
    bannerUrlPlaceholder: "Atau tempel URL banner (https://…)",
    avatarPreviewAlt: "Pratinjau avatar",
    bannerPreviewAlt: "Pratinjau banner",
    profileClearPicture: "Hapus foto",
    profileClearBanner: "Hapus banner",
    profileSave: "Simpan teks",
    profileSaving: "Menyimpan…",
    profileUploading: "Mengunggah…",
    profileToastSaved: "Profil disimpan",
    profileToastSavedLocally:
      "Disimpan lokal di browser ini. Tambahkan PATCH store pada API untuk sinkron server.",
    profileToastSaveFailed: "Tidak dapat menyimpan profil",
    profileToastLoadFailed: "Tidak dapat memuat profil",
    profileToastImageUploaded: "Gambar diunggah",
    profileOwnerNameTooShort: "Nama tampilan minimal 2 karakter.",
    profileUploadTooLarge: (maxKb) =>
      `Berkas terlalu besar (maks ~${maxKb} KB). Pilih gambar lebih kecil.`,
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
    formImageUploadLabel: "Gambar kartu",
    formImageUploadHint:
      "Landscape 16:9, maks 2 MB. Seret untuk posisi dan geser slider untuk zoom sebelum simpan.",
    formThumbnailPreviewLabel: "Pratinjau thumbnail",
    linkPickImage: "Unggah gambar",
    linkReplaceImage: "Ganti gambar",
    linkClearNewImage: "Buang gambar baru",
    linkCropTitle: "Potong thumbnail",
    linkCropDescription:
      "Sesuaikan bingkai untuk kartu tautan. Area terlihat disimpan sebagai JPEG 16:9.",
    linkCropHint: "Seret gambar untuk posisi · gunakan slider untuk zoom",
    linkCropApply: "Pakai potongan ini",
    linkCropApplying: "Memproses…",
    linkCropZoomAria: "Zoom",
    linkCropFrameAria: "Bingkai pratinjau potong",
    linkImageInvalidType: "Pilih gambar JPEG, PNG, atau WebP.",
    linkImageTooLarge: (maxMb) => `Gambar maksimal ${maxMb} MB.`,
    linkImageTooSmall: (minPx) =>
      `Gambar terlalu kecil — sisi terpendek minimal ${minPx}px.`,
    linkImageCropFailed: "Gagal menyiapkan gambar. Coba berkas lain.",
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
    collectionPickerSearchPlaceholder: "Cari tautan…",
    collectionPickerEmpty: "Tidak ada tautan yang cocok.",
    collectionPickerSelectedCount: (selected, total) =>
      `${selected} dipilih · ${total} tautan`,
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
    failedLoadDashboard: "Gagal memuat dasbor",
    profileBannerTitle: "Lengkapi profil toko Anda",
    profileBannerDescription: (completed, total) =>
      `${completed} dari ${total} langkah profil selesai — lengkapi agar pengunjung percaya.`,
    profileBannerProgress: "Kelengkapan profil",
    profileBannerCta: "Lengkapi profil",
    profileBannerItem: (key) =>
      ({
        profileImage: "Foto profil",
        storeTitle: "Judul toko",
        storeDescription: "Deskripsi toko",
        storeBackground: "Gambar latar",
      })[key],
    membershipTitle: "Keanggotaan",
    membershipDescription: "Batas dan fitur paket untuk toko ini.",
    membershipRenewalWarning:
      "Paket Plus segera berakhir. Perpanjang untuk tetap unlimited dan slug kustom.",
    membershipExpiresOn: (date) => `Berakhir ${date}`,
    membershipLimitCollections: "Koleksi",
    membershipLimitLinksPerCollection: "Tautan per koleksi",
    membershipUnlimited: "Tak terbatas",
    membershipCollectionsQuota: (used, allowed) =>
      `${used} dari ${allowed} slot koleksi terpakai`,
    membershipFeatureCustomLink: "Path tautan kustom",
    membershipFeatureCustomLinkHint:
      "Pilih URL pendek sendiri saat membuat tautan (mis. /promo-liburan).",
    membershipFeatureCustomCollection: "Path koleksi kustom",
    membershipFeatureCustomCollectionHint:
      "Pilih URL pendek sendiri saat membuat koleksi tautan.",
    membershipFeatureIncluded: "Termasuk",
    membershipFeatureDisabled: "Nonaktif",
    membershipUpgradeTeaser: (planName) => `Upgrade ke ${planName} untuk lebih`,
    membershipUpgradePrice: (price, days) => `${price} / ${days} hari`,
    membershipUpgradeButton: "Upgrade ke Plus",
    membershipPendingPurchase:
      "Pembayaran Plus menunggu — unggah bukti transfer atau tunggu verifikasi admin.",
    plusUpgradeDialogTitle: (planName) => `Upgrade ke ${planName}`,
    plusUpgradeDialogTitleReceipt: "Kirim pembayaran Plus",
    plusUpgradeReceiptPendingHint:
      "Transfer sesuai jumlah di bawah, lalu unggah bukti transfer.",
    plusUpgradeLoading: "Menyiapkan detail pembayaran…",
    plusUpgradeInvoiceAmount: "Jumlah transfer (tepat)",
    plusUpgradeBank: "Bank",
    plusUpgradeAccountNumber: "Nomor rekening",
    plusUpgradeReceiptLabel: "Bukti transfer",
    plusUpgradeReceiptHint: "Unggah tangkapan layar atau PDF bukti transfer.",
    plusUpgradePickReceipt: "Pilih berkas",
    plusUpgradeSubmitReceipt: "Kirim bukti",
    plusUpgradeSubmitting: "Mengunggah…",
    plusUpgradeSuccessTitle: "Bukti terkirim",
    plusUpgradeSuccessBody:
      "Bukti diterima. Plus aktif setelah verifikasi admin.",
    plusUpgradeFailed: "Tidak dapat menyelesaikan pembelian Plus",
    plusUpgradeNoPendingPurchase: "Tidak ada pembayaran Plus yang menunggu.",
    plusUpgradeCopyAccount: "Salin nomor rekening",
    plusUpgradeCopied: "Nomor rekening disalin",
    plusUpgradeClose: "Tutup",
    trendsTitle: "Tayangan & klik over time",
    trendsDescription: "Total harian 30 hari terakhir",
    topLinksTitle: "Tautan paling diklik",
    topLinksDescription: "Tautan dengan klik terbanyak di toko Anda",
    statViewsSubtitlePeriod: "30 hari terakhir",
    statClicksSubtitlePeriod: "30 hari terakhir",
  },
};
