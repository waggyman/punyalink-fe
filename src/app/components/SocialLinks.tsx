import { Button } from "./ui/button";
import { Instagram, Twitter, Github, Linkedin, Mail, Globe } from "lucide-react";

interface SocialLink {
  type: "instagram" | "twitter" | "github" | "linkedin" | "email" | "website";
  url: string;
}

interface SocialLinksProps {
  links: SocialLink[];
}

const socialIcons = {
  instagram: Instagram,
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  website: Globe,
};

const socialLabels = {
  instagram: "Instagram",
  twitter: "Twitter",
  github: "GitHub",
  linkedin: "LinkedIn",
  email: "Email",
  website: "Website",
};

export function SocialLinks({ links }: SocialLinksProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {links.map((link, index) => {
        const Icon = socialIcons[link.type];
        return (
          <Button
            key={index}
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 hover:scale-110 transition-transform duration-200"
            asChild
          >
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={socialLabels[link.type]}
            >
              <Icon className="h-5 w-5" />
            </a>
          </Button>
        );
      })}
    </div>
  );
}
