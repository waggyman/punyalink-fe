import type { SocialLinks } from "@/lib/types";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { SocialLinks as SocialLinksBar } from "./SocialLinks";

interface ProfileHeaderProps {
  name: string;
  bio: string;
  avatar: string;
  banner?: string;
  tags?: string[];
  socialLinks?: SocialLinks | null;
}

export function ProfileHeader({
  name,
  bio,
  avatar,
  banner,
  tags,
  socialLinks,
}: ProfileHeaderProps) {
  const bannerSrc =
    banner?.trim() ||
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop";

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="absolute inset-0">
        <img src={bannerSrc} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
      </div>

      <div className="relative px-4 py-8 text-center">
        <div className="relative mb-4 inline-block">
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-primary to-[var(--store-header-glow)] opacity-50 blur-md" />
          <Avatar className="relative h-24 w-24 border-4 border-background shadow-xl">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-white drop-shadow-lg">
          {name}
        </h1>

        <p className="mx-auto mb-4 max-w-md leading-relaxed text-white/90 drop-shadow">
          {bio}
        </p>

        <SocialLinksBar links={socialLinks} className="mb-4" />

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
