import { useEffect, useMemo, useState } from "react";
import { ProfileHeader } from "../components/ProfileHeader";
import { LinkCard } from "../components/LinkCard";
import { SearchInput } from "../components/SearchInput";
import { Pagination } from "../components/Pagination";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { OwnerToolbar } from "../components/OwnerToolbar";
import { StorefrontThemeProvider } from "../storefront/StorefrontThemeContext";
import {
  ApiError,
  fetchLinks,
  fetchPublicStore,
  resolveApiMediaUrl,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Link, PublicStoreCard } from "@/lib/types";
import { getBaseDomain } from "@/lib/tenant";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop";
const DEFAULT_BANNER_BG =
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop";
const LINKS_PER_PAGE = 6;

type PublicStorePageProps = {
  tenant: string;
};

export function PublicStorePage({ tenant }: PublicStorePageProps) {
  const { token, isAuthenticated } = useAuth();
  const baseDomain = getBaseDomain();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [links, setLinks] = useState<Link[]>([]);
  const [storeCard, setStoreCard] = useState<PublicStoreCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchLinks(tenant, token ?? undefined),
      fetchPublicStore(tenant).catch(() => null),
    ])
      .then(([linkData, publicStore]) => {
        if (cancelled) return;
        setLinks(linkData);
        setStoreCard(publicStore);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load store",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenant, token]);

  const displayLinks = useMemo(() => {
    if (isAuthenticated) return links;
    return links.filter((l: Link) => l.isPublic && l.isActive);
  }, [links, isAuthenticated]);

  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim()) return displayLinks;
    const q = searchQuery.toLowerCase();
    return displayLinks.filter((link: Link) =>
      link.name.toLowerCase().includes(q),
    );
  }, [displayLinks, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLinks.length / LINKS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * LINKS_PER_PAGE;
  const currentLinks = filteredLinks.slice(
    startIndex,
    startIndex + LINKS_PER_PAGE,
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const storeTitle =
    storeCard?.title?.trim() ||
    tenant.charAt(0).toUpperCase() + tenant.slice(1);

  const bio =
    storeCard?.description?.trim() ||
    `Links from ${tenant}.${baseDomain}`;

  const avatarSrc =
    resolveApiMediaUrl(storeCard?.owner?.profileImageUrl) || DEFAULT_AVATAR;
  const bannerSrc =
    resolveApiMediaUrl(storeCard?.backgroundImageUrl) || DEFAULT_BANNER_BG;

  return (
    <StorefrontThemeProvider tenant={tenant}>
      <PublicStoreContent
        tenant={tenant}
        storeTitle={storeTitle}
        bio={bio}
        avatarSrc={avatarSrc}
        bannerSrc={bannerSrc}
        storeCard={storeCard}
        isAuthenticated={isAuthenticated}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filteredLinks={filteredLinks}
        currentLinks={currentLinks}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </StorefrontThemeProvider>
  );
}

function PublicStoreContent({
  tenant,
  storeTitle,
  bio,
  avatarSrc,
  bannerSrc,
  storeCard,
  isAuthenticated,
  loading,
  error,
  searchQuery,
  onSearchChange,
  filteredLinks,
  currentLinks,
  currentPage,
  totalPages,
  onPageChange,
}: {
  tenant: string;
  storeTitle: string;
  bio: string;
  avatarSrc: string;
  bannerSrc: string;
  storeCard: PublicStoreCard | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filteredLinks: Link[];
  currentLinks: Link[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <img src={bannerSrc} alt="" className="h-full w-full object-cover" />
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ background: "var(--store-page-overlay)" }}
        />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <OwnerToolbar tenant={tenant} />
        <ProfileHeader
          name={storeTitle}
          bio={bio}
          avatar={avatarSrc}
          banner={bannerSrc}
          socialLinks={storeCard?.owner?.socialLinks}
          tags={isAuthenticated ? ["Owner preview"] : undefined}
        />
        <Separator className="my-10" />
        <div className="mb-8">
          <SearchInput value={searchQuery} onChange={onSearchChange} />
        </div>
        <div className="space-y-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Featured Links</h2>
            <span className="text-sm text-muted-foreground">
              {filteredLinks.length}{" "}
              {filteredLinks.length === 1 ? "link" : "links"}
            </span>
          </div>
          {loading && (
            <p className="py-12 text-center text-muted-foreground">
              Loading…
            </p>
          )}
          {error && !loading && (
            <p className="py-12 text-center text-destructive">{error}</p>
          )}
          {!loading && !error && currentLinks.length > 0 && (
            <>
              {currentLinks.map((link: Link) => (
                <div key={link.id} className="relative">
                  {isAuthenticated && (!link.isPublic || !link.isActive) && (
                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                      {!link.isPublic && (
                        <Badge variant="secondary">Private</Badge>
                      )}
                      {!link.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  )}
                  <LinkCard
                    title={link.name}
                    image={resolveApiMediaUrl(link.imageUrl)}
                    url={`/${link.accessLink}`}
                  />
                </div>
              ))}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </>
          )}
          {!loading && !error && currentLinks.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              {searchQuery
                ? `No links found matching "${searchQuery}"`
                : "No links to show yet."}
            </p>
          )}
        </div>
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {storeTitle}
          </p>
        </footer>
      </div>
    </div>
  );
}
