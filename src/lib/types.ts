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

export type CollectionDetail = {
  id: string;
  name: string;
  accessLink: string;
  expiredAt: string;
  links: Link[];
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

/** `GET /users/me` */
export type UserMe = {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string | null;
};

/** `PATCH /users/me` */
export type PatchUserMePayload = {
  name?: string;
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
