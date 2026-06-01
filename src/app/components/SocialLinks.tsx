import type { SocialLinks as SocialLinksMap } from "@/lib/types";
import { getActiveSocialLinks } from "@/lib/social-links";
import { SOCIAL_PLATFORM_LABELS } from "@/lib/social-links";

import { Button } from "./ui/button";
import { SocialPlatformIcon } from "./SocialPlatformIcon";

type SocialLinksProps = {
  links: SocialLinksMap | null | undefined;
  className?: string;
};

export function SocialLinks({ links, className }: SocialLinksProps) {
  const active = getActiveSocialLinks(links);
  if (active.length === 0) return null;

  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className ?? ""}`}>
      {active.map(({ platform, url }) => (
        <Button
          key={platform}
          variant="outline"
          size="icon"
          className="size-11 rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm transition-transform hover:scale-110 hover:bg-white/20"
          asChild
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={SOCIAL_PLATFORM_LABELS[platform]}
          >
            <SocialPlatformIcon platform={platform} className="size-5" />
          </a>
        </Button>
      ))}
    </div>
  );
}
