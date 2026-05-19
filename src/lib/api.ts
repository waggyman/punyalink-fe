import type {
  CollectionDetail,
  CollectionListItem,
  CreateLinkCollectionPayload,
  PatchLinkCollectionPayload,
  CreateLinkPayload,
  Link,
  LoginResponse,
  PatchLinkPayload,
  PatchStoreMePayload,
  PatchUserMePayload,
  PublicStoreCard,
  RegisterResponse,
  StoreMe,
  SubdomainAvailabilityResponse,
  UserMe,
} from "./types";

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const TENANT_HEADER = "x-tenant-subdomain";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function formatErrorMessage(body: unknown, status: number): string {
  if (typeof body === "string") return body;
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (Array.isArray(record.message)) {
      return record.message.join(", ");
    }
    if (typeof record.message === "string") {
      return record.message;
    }
  }
  return `Request failed (${status})`;
}

export async function api<T>(
  path: string,
  opts: RequestInit & { tenant?: string; token?: string } = {},
): Promise<T> {
  const headers = new Headers(opts.headers);
  const isFormData =
    typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type") && opts.body) {
    headers.set("Content-Type", "application/json");
  }
  if (opts.tenant) {
    headers.set(TENANT_HEADER, opts.tenant);
  }
  if (opts.token) {
    headers.set("Authorization", `Bearer ${opts.token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiError(formatErrorMessage(body, res.status), res.status, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function login(
  tenant: string,
  email: string,
  password: string,
): Promise<LoginResponse> {
  return api<LoginResponse>("/users/login", {
    method: "POST",
    tenant,
    body: JSON.stringify({ email, password }),
  });
}

/** Apex-only: no tenant header. */
export function fetchSubdomainAvailability(
  subdomain: string,
): Promise<SubdomainAvailabilityResponse> {
  const encoded = encodeURIComponent(subdomain.trim().toLowerCase());
  return api<SubdomainAvailabilityResponse>(
    `/stores/subdomain/${encoded}/availability`,
    { method: "GET" },
  );
}

/** Apex-only: no tenant header. */
export function registerUser(body: {
  email: string;
  name: string;
  subdomain: string;
}): Promise<RegisterResponse> {
  return api<RegisterResponse>("/users/register", {
    method: "POST",
    body: JSON.stringify({
      email: body.email.trim().toLowerCase(),
      name: body.name.trim(),
      subdomain: body.subdomain.trim().toLowerCase(),
    }),
  });
}

/** Apex-only: no tenant header. */
export function confirmEmailOtp(body: {
  target: string;
  value: string;
  password: string;
}): Promise<void> {
  return api<void>("/otp/email-confirm", {
    method: "POST",
    body: JSON.stringify({
      target: body.target.trim().toLowerCase(),
      value: body.value.trim(),
      password: body.password,
    }),
  });
}

/** Apex-only: no tenant header. */
export function resendEmailOtp(target: string): Promise<void> {
  return api<void>("/otp/email-resend", {
    method: "POST",
    body: JSON.stringify({ target: target.trim().toLowerCase() }),
  });
}

export function fetchLinks(
  tenant: string,
  token?: string,
): Promise<Link[]> {
  return api<Link[]>("/links", { tenant, token });
}

export function visitLink(
  tenant: string,
  accessLink: string,
  token?: string,
): Promise<{ externalLink: string }> {
  return api<{ externalLink: string }>(
    `/links/access/${encodeURIComponent(accessLink)}/visit`,
    { method: "POST", tenant, token },
  );
}

export function fetchCollectionBySlug(
  tenant: string,
  accessLink: string,
  token?: string,
): Promise<CollectionDetail> {
  return api<CollectionDetail>(
    `/link-collections/access/${encodeURIComponent(accessLink)}`,
    { tenant, token },
  );
}

export function fetchLinkCollections(
  tenant: string,
  token: string,
): Promise<CollectionListItem[]> {
  return api<CollectionListItem[]>("/link-collections", { tenant, token });
}

export function createLinkCollection(
  tenant: string,
  token: string,
  body: CreateLinkCollectionPayload,
): Promise<CollectionDetail> {
  const payload: Record<string, unknown> = {
    name: body.name,
    linkIds: [...new Set(body.linkIds)],
  };
  const slug = body.accessLink?.trim();
  if (slug) payload.accessLink = slug.toLowerCase();
  return api<CollectionDetail>("/link-collections", {
    method: "POST",
    tenant,
    token,
    body: JSON.stringify(payload),
  });
}

export function fetchLinkCollectionById(
  tenant: string,
  id: string,
  token: string,
): Promise<CollectionDetail> {
  return api<CollectionDetail>(`/link-collections/${id}`, {
    tenant,
    token,
  });
}

export function patchLinkCollection(
  tenant: string,
  id: string,
  token: string,
  body: PatchLinkCollectionPayload,
): Promise<CollectionDetail> {
  const payload: Record<string, unknown> = {};
  if (body.name !== undefined) payload.name = body.name;
  if (body.accessLink !== undefined) payload.accessLink = body.accessLink;
  if (
    Array.isArray(body.addLinkIds) &&
    body.addLinkIds.length > 0
  ) {
    payload.addLinkIds = [...new Set(body.addLinkIds)];
  }
  if (
    Array.isArray(body.removeLinkIds) &&
    body.removeLinkIds.length > 0
  ) {
    payload.removeLinkIds = [...new Set(body.removeLinkIds)];
  }
  return api<CollectionDetail>(`/link-collections/${id}`, {
    method: "PATCH",
    tenant,
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteLinkCollection(
  tenant: string,
  id: string,
  token: string,
): Promise<void> {
  return api<void>(`/link-collections/${id}`, {
    method: "DELETE",
    tenant,
    token,
  });
}

export function deleteLink(
  tenant: string,
  id: string,
  token: string,
): Promise<void> {
  return api<void>(`/links/${id}`, {
    method: "DELETE",
    tenant,
    token,
  });
}

export function createLink(
  tenant: string,
  token: string,
  body: CreateLinkPayload,
): Promise<Link> {
  const payload: Record<string, unknown> = {
    name: body.name,
    externalLink: body.externalLink,
    image: body.image ?? null,
    source: body.source ?? null,
    isPublic: body.isPublic ?? true,
    isActive: body.isActive ?? true,
  };
  const slug = body.accessLink?.trim();
  if (slug) payload.accessLink = slug;
  return api<Link>("/links", {
    method: "POST",
    tenant,
    token,
    body: JSON.stringify(payload),
  });
}

export function patchLink(
  tenant: string,
  id: string,
  token: string,
  body: PatchLinkPayload,
): Promise<Link> {
  return api<Link>(`/links/${id}`, {
    method: "PATCH",
    tenant,
    token,
    body: JSON.stringify(body),
  });
}

/** Absolute URL for API-hosted media paths. */
export function resolveApiMediaUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  if (
    u.startsWith("http://") ||
    u.startsWith("https://") ||
    u.startsWith("data:")
  ) {
    return u;
  }
  const base = API_BASE.replace(/\/$/, "");
  return u.startsWith("/") ? `${base}${u}` : `${base}/${u}`;
}

export function fetchUserMe(tenant: string, token: string): Promise<UserMe> {
  return api<UserMe>("/users/me", { tenant, token });
}

export function patchUserMe(
  tenant: string,
  token: string,
  body: PatchUserMePayload,
): Promise<UserMe> {
  const payload: PatchUserMePayload = {};
  if (body.name !== undefined) payload.name = body.name.trim();
  return api<UserMe>("/users/me", {
    method: "PATCH",
    tenant,
    token,
    body: JSON.stringify(payload),
  });
}

export function uploadUserProfileImage(
  tenant: string,
  token: string,
  file: File,
): Promise<UserMe> {
  const formData = new FormData();
  formData.append("file", file);
  return api<UserMe>("/users/me/profile-image", {
    method: "POST",
    tenant,
    token,
    body: formData,
  });
}

export function fetchStoreMe(tenant: string, token: string): Promise<StoreMe> {
  return api<StoreMe>("/stores/me", { tenant, token });
}

export function patchStoreMe(
  tenant: string,
  token: string,
  body: PatchStoreMePayload,
): Promise<StoreMe> {
  const payload: PatchStoreMePayload = {};
  if (body.title !== undefined) payload.title = body.title;
  if (body.description !== undefined) payload.description = body.description;
  return api<StoreMe>("/stores/me", {
    method: "PATCH",
    tenant,
    token,
    body: JSON.stringify(payload),
  });
}

export function uploadStoreBackgroundImage(
  tenant: string,
  token: string,
  file: File,
): Promise<StoreMe> {
  const formData = new FormData();
  formData.append("file", file);
  return api<StoreMe>("/stores/me/background-image", {
    method: "POST",
    tenant,
    token,
    body: formData,
  });
}

/** Public storefront card; no JWT. */
export function fetchPublicStore(tenant: string): Promise<PublicStoreCard> {
  return api<PublicStoreCard>("/stores/public", { tenant });
}
