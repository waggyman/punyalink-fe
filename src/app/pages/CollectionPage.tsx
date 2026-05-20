import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Copy, Layers } from "lucide-react";
import { ApiError, fetchCollectionBySlug } from "@/lib/api";
import type { CollectionDetail } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { LinkCard } from "../components/LinkCard";

type CollectionPageProps = {
  tenant: string;
};

/** Public collection bundle page — readable copy (no dashboard i18n). */
export function CollectionPage({ tenant }: CollectionPageProps) {
  const { accessLink: slugParam } = useParams();
  const { token } = useAuth();

  const accessLink = useMemo(() => {
    const raw = slugParam?.trim();
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [slugParam]);

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!accessLink) {
      setError("Missing collection slug.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCollectionBySlug(tenant, accessLink, token ?? undefined)
      .then((data) => {
        if (!cancelled) setCollection(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "This collection is unavailable or expired.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenant, accessLink, token]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/collection/${encodeURIComponent(accessLink)}`
      : "";

  function copyShare() {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  const expiredLabel = collection
    ? new Date(collection.expiredAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 via-background to-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <p className="mb-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← Back to store
          </Link>
        </p>

        {loading && (
          <p className="text-center text-muted-foreground">Loading bundle…</p>
        )}
        {!loading && error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-10 text-center text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        {!loading && !error && collection && (
          <>
            <Card className="mb-8 overflow-hidden border-border/70 shadow-md">
              <CardContent className="space-y-4 p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Layers className="size-6 text-primary" aria-hidden />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <h1 className="text-balance text-2xl font-bold tracking-tight">
                        {collection.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="font-normal">
                          {collection.links.length === 1
                            ? "1 link"
                            : `${collection.links.length} links`}
                        </Badge>
                        <span aria-hidden className="text-border">
                          ·
                        </span>
                        <time dateTime={collection.expiredAt}>
                          Expires {expiredLabel}
                        </time>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-2"
                    onClick={copyShare}
                    disabled={!shareUrl}
                  >
                    <Copy className="size-3.5" />
                    {copied ? "Copied!" : "Copy page URL"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Separator className="mb-8" />

            {collection.links.length === 0 ? (
              <p className="py-14 text-center text-sm text-muted-foreground">
                This bundle has no links to show yet.
              </p>
            ) : (
              <section aria-labelledby="bundle-links-heading" className="space-y-6">
                <h2 id="bundle-links-heading" className="text-lg font-semibold">
                  Links in this bundle
                </h2>
                <div className="space-y-6">
                  {collection.links.map((link) => (
                    <LinkCard
                      key={link.id}
                      title={link.name}
                      image={link.imageUrl}
                      url={`/${link.accessLink}`}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
