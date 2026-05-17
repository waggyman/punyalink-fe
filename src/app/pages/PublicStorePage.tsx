import { useEffect, useMemo, useState } from "react";
import { ProfileHeader } from "../components/ProfileHeader";
import { LinkCard } from "../components/LinkCard";
import { SearchInput } from "../components/SearchInput";
import { Pagination } from "../components/Pagination";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { OwnerToolbar } from "../components/OwnerToolbar";
import { readStoreBranding } from "@/lib/store-branding-local";
import { ApiError, fetchLinks } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Link } from "@/lib/types";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchLinks(tenant, token ?? undefined)
      .then((data) => {
        if (!cancelled) setLinks(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load links",
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

  const branding = useMemo(() => readStoreBranding(tenant), [tenant]);

  const storeTitle =
    branding.title.trim() ||
    tenant.charAt(0).toUpperCase() + tenant.slice(1);

  const bio =
    branding.description.trim() ||
    `Links from ${tenant}.punyalink.id`;

  const avatarSrc = branding.profilePicture?.trim() || DEFAULT_AVATAR;
  const bannerSrc = branding.banner?.trim() || DEFAULT_BANNER_BG;

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <img
          src={bannerSrc}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 relative">
        <OwnerToolbar />
        <ProfileHeader
          name={storeTitle}
          bio={bio}
          avatar={avatarSrc}
          tags={isAuthenticated ? ["Owner preview"] : undefined}
        />
        <Separator className="my-10" />
        <div className="mb-8">
          <SearchInput value={searchQuery} onChange={handleSearchChange} />
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Featured Links</h2>
            <span className="text-sm text-muted-foreground">
              {filteredLinks.length}{" "}
              {filteredLinks.length === 1 ? "link" : "links"}
            </span>
          </div>
          {loading && (
            <p className="text-center text-muted-foreground py-12">Loading links…</p>
          )}
          {error && !loading && (
            <p className="text-center text-destructive py-12">{error}</p>
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
                    image={link.image}
                    url={`/${link.accessLink}`}
                  />
                </div>
              ))}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
          {!loading && !error && currentLinks.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              {searchQuery
                ? `No links found matching "${searchQuery}"`
                : "No links to show yet."}
            </p>
          )}
        </div>
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {storeTitle}</p>
        </footer>
      </div>
    </div>
  );
}
