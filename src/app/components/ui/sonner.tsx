"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-background !text-foreground !border-border shadow-lg",
          title: "font-semibold !text-foreground",
          description: "!text-foreground/85 !opacity-100",
          error:
            "!border-destructive/45 [&_[data-title]]:!text-destructive [&_[data-description]]:!text-foreground/90",
          success:
            "!border-emerald-500/35 [&_[data-title]]:!text-emerald-700 dark:[&_[data-title]]:!text-emerald-400",
        },
      }}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
