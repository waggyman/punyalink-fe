import { useEffect, useState } from "react";
import { ExternalLink, Link2 } from "lucide-react";
import { Card } from "./ui/card";

/** Neutral cover when link has no image or the thumbnail fails to load */
const DEFAULT_LINK_CARD_IMAGE =
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=400&fit=crop";

interface LinkCardProps {
  title: string;
  /** Omit, null, or empty string uses `fallbackImage` next. */
  image?: string | null;
  fallbackImage?: string;
  url: string;
  description?: string;
}

type ImageStage = "primary" | "fallback" | "solid";

export function LinkCard({
  title,
  image,
  fallbackImage = DEFAULT_LINK_CARD_IMAGE,
  url,
  description,
}: LinkCardProps) {
  const trimmed =
    typeof image === "string" ? image.trim() : "";

  const [stage, setStage] = useState<ImageStage>(() =>
    trimmed.length > 0 ? "primary" : "fallback",
  );

  useEffect(() => {
    setStage(trimmed.length > 0 ? "primary" : "fallback");
  }, [trimmed]);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary">
        <div className="relative h-48 overflow-hidden bg-muted">
          {stage === "solid" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted via-muted to-muted/40">
              <Link2
                strokeWidth={1.25}
                className="size-14 text-muted-foreground/35"
                aria-hidden
              />
            </div>
          ) : (
            <img
              src={
                stage === "primary" ? trimmed : fallbackImage
              }
              alt={stage === "primary" ? title : ""}
              aria-hidden={stage === "primary" ? undefined : true}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => {
                setStage((prev) =>
                  prev === "primary"
                    ? "fallback"
                    : prev === "fallback"
                      ? "solid"
                      : "solid",
                );
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ExternalLink className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </Card>
    </a>
  );
}
