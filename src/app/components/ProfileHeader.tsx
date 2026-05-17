import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface ProfileHeaderProps {
  name: string;
  bio: string;
  avatar: string;
  tags?: string[];
}

export function ProfileHeader({ name, bio, avatar, tags }: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Custom Banner Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop"
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
      </div>

      <div className="relative text-center py-8 px-4">
        {/* Avatar with ring */}
        <div className="inline-block relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-md opacity-50 animate-pulse" />
          <Avatar className="w-24 h-24 relative border-4 border-background shadow-xl">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        {/* Name */}
        <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">
          {name}
        </h1>

        {/* Bio */}
        <p className="text-white/90 max-w-md mx-auto mb-4 leading-relaxed drop-shadow">
          {bio}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
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
