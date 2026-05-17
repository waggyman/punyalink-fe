const BASE_DOMAIN =
  import.meta.env.VITE_BASE_DOMAIN?.toLowerCase() ?? "punyalink.id";

const APEX_HOSTS = new Set(
  (import.meta.env.VITE_APEX_HOSTS ?? `punyalink.id,www.punyalink.id,localhost,127.0.0.1`)
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean),
);

/** Subdomain tenant from hostname, or dev tenant on localhost */
export function getTenantFromHost(
  hostname: string = window.location.hostname,
): string | null {
  const host = hostname.toLowerCase();

  if (host === "localhost" || host === "127.0.0.1") {
    const dev = import.meta.env.VITE_DEV_TENANT?.trim();
    return dev || null;
  }

  if (APEX_HOSTS.has(host)) {
    return null;
  }

  if (host.endsWith(`.${BASE_DOMAIN}`)) {
    const sub = host.slice(0, -(BASE_DOMAIN.length + 1));
    if (sub && !sub.includes(".")) {
      return sub;
    }
  }

  if (host.endsWith(".localhost")) {
    const sub = host.slice(0, -".localhost".length);
    if (sub && !sub.includes(".")) {
      return sub;
    }
  }

  return null;
}

export function isApexHost(hostname: string = window.location.hostname): boolean {
  return getTenantFromHost(hostname) === null;
}

export function getBaseDomain(): string {
  return BASE_DOMAIN;
}

export function buildStoreOrigin(subdomain: string): string {
  const { protocol, port } = window.location;
  const host =
    subdomain && !isApexHost()
      ? `${subdomain}.${getBaseDomain()}`
      : `${subdomain}.${getBaseDomain()}`;
  const portSuffix =
    port && port !== "80" && port !== "443" ? `:${port}` : "";
  return `${protocol}//${host}${portSuffix}`;
}

/**
 * Absolute URL for the store login page after signup.
 * On localhost uses `{subdomain}.localhost` so tenant routing matches `getTenantFromHost`.
 */
export function getStoreLoginUrl(subdomain: string): string {
  const { protocol, hostname, port } = window.location;
  const portSuffix =
    port && port !== "80" && port !== "443" ? `:${port}` : "";
  const hostLower = hostname.toLowerCase();

  if (hostLower === "localhost" || hostLower === "127.0.0.1") {
    return `${protocol}//${subdomain}.localhost${portSuffix}/login`;
  }

  const host = `${subdomain}.${getBaseDomain()}`;
  return `${protocol}//${host}${portSuffix}/login`;
}
