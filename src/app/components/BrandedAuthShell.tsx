import type { ReactNode } from "react";
import { Link2 } from "lucide-react";
import { Link } from "react-router";
import { getBaseDomain } from "@/lib/tenant";

type BrandedAuthShellProps = {
  children: ReactNode;
  footerLink?: ReactNode;
};

/**
 * Shared violet/sky backdrop + logo strip for apex register + tenant login
 * so auth surfaces match the marketing landing aesthetic.
 */
export function BrandedAuthShell({ children, footerLink }: BrandedAuthShellProps) {
  const baseDomain = getBaseDomain();

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-background to-sky-50">
      <div className="pointer-events-none absolute -top-24 right-[-10%] size-[28rem] rounded-full bg-violet-300/50 mix-blend-multiply blur-3xl opacity-70 animate-blob" />
      <div className="pointer-events-none absolute -bottom-28 left-[-5%] size-[26rem] rounded-full bg-sky-300/45 mix-blend-multiply blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <header className="relative z-10 border-b border-border/60 bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-4 sm:max-w-xl">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-sky-500 shadow-md shadow-violet-500/25">
              <Link2 className="size-[18px] text-white" aria-hidden />
            </span>
            <span className="font-semibold tracking-tight text-foreground">
              Punyalink
            </span>
          </Link>
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            {baseDomain}
          </span>
        </div>
      </header>
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
        {children}
      </div>
      {footerLink != null ? (
        <footer className="relative z-10 border-t border-border/50 bg-background/40 py-4 text-center text-sm text-muted-foreground backdrop-blur-sm">
          {footerLink}
        </footer>
      ) : null}
    </div>
  );
}
