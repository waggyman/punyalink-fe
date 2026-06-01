export type Link = {
  id: string;
  imageUrl: string | null;
  name: string;
  externalLink: string;
  accessLink: string;
  view: number;
  click: number;
  source: string | null;
  isPublic: boolean;
  isActive: boolean;
  storeId: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  accessToken: string;
  expired_at: string;
  tokenType: "Bearer";
  store: { id: string; subdomain: string };
};

/** `GET /links` list envelope (paginated). */
export type LinksListResponse = {
  total: number;
  page?: number;
  limit?: number;
  items: Link[];
};

export type FetchLinksQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

export type CollectionDetail = {
  id: string;
  name: string;
  accessLink: string;
  expiredAt: string;
  links: Link[];
};

/** `GET /link-collections` list envelope. */
export type LinkCollectionsListResponse = {
  total: number;
  allowed: number;
  items: CollectionListItem[];
};

/** Owner list row from `GET /link-collections`. */
export type CollectionListItem = {
  id: string;
  name: string;
  accessLink: string;
  storeId: string;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
  linkCount: number;
};

export type CreateLinkCollectionPayload = {
  name: string;
  accessLink?: string | null;
  linkIds: string[];
};

/** `PATCH /link-collections/:id` */
export type PatchLinkCollectionPayload = {
  name?: string;
  accessLink?: string;
  addLinkIds?: string[];
  removeLinkIds?: string[];
};

export type AuthSession = LoginResponse;

/** Body for `POST /links` and multipart `file` uploads. */
export type CreateLinkPayload = {
  name: string;
  externalLink: string;
  imageUrl?: string | null;
  /** Multipart field `file` — preferred over `imageUrl` when set. */
  file?: File | null;
  accessLink?: string | null;
  source?: string | null;
  isPublic?: boolean;
  isActive?: boolean;
};

/** `PATCH /links/:id`; `accessLink` cannot change on server. */
export type PatchLinkPayload = Partial<Omit<CreateLinkPayload, "accessLink">>;

import type { SocialLinks } from "./social-links";

export type { SocialLinks, SocialPlatform } from "./social-links";

/** `GET /users/me` */
export type UserMe = {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string | null;
  socialLinks?: SocialLinks | null;
};

/** `PATCH /users/me` */
export type PatchUserMePayload = {
  name?: string;
  socialLinks?: SocialLinks;
};

/** `GET /stores/me` */
export type StoreMe = {
  id: string;
  subdomain: string;
  title: string | null;
  description: string | null;
  backgroundImageUrl: string | null;
};

/** `PATCH /stores/me` */
export type PatchStoreMePayload = {
  title?: string | null;
  description?: string | null;
};

/** Owner snippet on `GET /stores/public`. */
export type PublicStoreOwner = {
  name: string;
  profileImageUrl: string | null;
  socialLinks?: SocialLinks | null;
};

/** `GET /stores/public` (tenant header, no JWT) */
export type PublicStoreCard = {
  id?: string;
  subdomain?: string;
  title: string | null;
  description: string | null;
  backgroundImageUrl: string | null;
  owner?: PublicStoreOwner | null;
};

/** `GET /stores/subdomain/:subdomain/availability` */
export type SubdomainAvailabilityResponse = {
  subdomain: string;
  available: boolean;
};

/** `POST /users/register` */
export type RegisterResponse = {
  message: string;
  email: string;
  subdomain: string;
  otp_expired_at: string;
};

export type MembershipLimitValue = number | "unlimited";

export type MembershipPlanLimits = {
  limitCollection: MembershipLimitValue;
  limitCollectionLink: MembershipLimitValue;
  canCustomLink: boolean;
  canCustomLinkCollection: boolean;
};

/** Row from `GET /memberships` or nested in membership responses. */
export type MembershipPlan = {
  code: string;
  name: string;
  priceIdr: number | null;
  durationDays: number | null;
  graceRenewalDays: number | null;
  limits: MembershipPlanLimits;
};

/** Pending Plus payment on `GET /memberships/me`. */
export type PendingPlusPurchase = {
  id: string;
  invoiceAmount: number;
  bankAccountNumber: string;
  bankAccountName: string;
  status: string;
  createdAt: string;
};

/** `POST /memberships/purchase-plus` */
export type PlusPurchaseResponse = {
  purchaseId: string;
  invoiceAmount: number;
  bankAccountNumber: string;
  bankAccountName: string;
  message: string;
};

/** `POST /memberships/confirm-plus` */
export type ConfirmPlusResponse = {
  purchaseId: string;
  status: string;
  message: string;
};

/** `GET /memberships/me` and `DashboardResponse.membership`. */
export type MembershipMe = {
  effectiveCode: string;
  plan: MembershipPlan;
  plusExpiredAt: string | null;
  showWarningAfter: string | null;
  showRenewalWarning: boolean;
  pendingPurchase: PendingPlusPurchase | null;
};

export type DailyCount = {
  date: string;
  count: number;
};

export type DashboardTopClickedLink = {
  id: string;
  name: string;
  accessLink: string;
  imageUrl: string | null;
  view: number;
  click: number;
  externalLink?: string;
  isPublic?: boolean;
  isActive?: boolean;
};

export type DashboardStats = {
  totalLinks: number;
  totalActiveLinks: number;
  viewsPerDay: DailyCount[];
  clicksPerDay: DailyCount[];
  topClickedLinks: DashboardTopClickedLink[];
  collections: {
    total: number;
    allowed: number | "unlimited";
  };
};

export type ProfileBannerItems = {
  profileImage: boolean;
  storeTitle: boolean;
  storeDescription: boolean;
  storeBackground: boolean;
};

export type ProfileBanner = {
  completed: number;
  total: number;
  percent: number;
  items: ProfileBannerItems;
  isComplete: boolean;
};

/** `GET /dashboard` */
export type DashboardResponse = {
  stats: DashboardStats;
  profileBanner: ProfileBanner;
  membership: MembershipMe;
  user: UserMe;
  store: StoreMe;
};

/** `POST /admin/login` */
export type AdminLoginResponse = {
  accessToken: string;
  expired_at: string;
  tokenType: "Bearer";
};

export type AdminSession = AdminLoginResponse;

export type AdminStoreSummary = {
  id: string;
  subdomain: string;
  title: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserSummary = {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
};

export type AdminStoreListItem = {
  store: AdminStoreSummary;
  users: AdminUserSummary[];
  membership: MembershipMe;
};

export type AdminStoresListResponse = {
  items: AdminStoreListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AdminStoreDetailUser = {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string | null;
  socialLinks: SocialLinks;
};

export type AdminStoreDetail = {
  store: AdminStoreSummary & {
    description: string | null;
    backgroundImageUrl: string | null;
  };
  users: AdminStoreDetailUser[];
  membership: MembershipMe;
  stats: {
    linkCount: number;
    collectionCount: number;
  };
};

export type AdminPurchaseStatus =
  | "pending"
  | "approved"
  | "receipt_submitted";

export type AdminPurchaseSummary = {
  id: string;
  invoiceAmount: number;
  status: string;
  hasReceipt: boolean;
  createdAt: string;
  updatedAt: string;
  store: { id: string; subdomain: string; title: string };
  user: { id: string; name: string; email: string };
};

export type AdminPurchasesListResponse = {
  items: AdminPurchaseSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AdminPurchaseDetail = AdminPurchaseSummary & {
  bankAccountNumber?: string;
  bankAccountName?: string;
  receiptImageUrl?: string | null;
};

export type AddMembershipPayload = {
  userId: string;
  storeId: string;
};

export type FetchAdminStoresQuery = {
  page?: number;
  limit?: number;
};

export type FetchAdminPurchasesQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminPurchaseStatus | "";
};
