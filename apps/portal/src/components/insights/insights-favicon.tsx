import {
  Globe02Icon,
  HelpCircleIcon,
  Link01Icon,
  Mail01Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@hezaerd/ui/lib/utils";
import { useState } from "react";

export function faviconUrl(domain: string, size = 32) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

function hostFromUrlOrHost(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`).hostname;
  } catch {
    return trimmed.replace(/^www\./i, "");
  }
}

type FaviconImageProps = {
  domain: string;
  size?: number;
  className?: string;
  fallbackIcon: typeof Globe02Icon;
};

function FaviconImage({ domain, size = 16, className, fallbackIcon }: FaviconImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={cn(
          "bg-muted/50 text-muted-foreground inline-flex shrink-0 items-center justify-center rounded-md",
          className,
        )}
        style={{ width: size, height: size }}
      >
        <HugeiconsIcon icon={fallbackIcon} size={Math.max(size - 6, 10)} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "bg-muted/40 inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={faviconUrl(domain, 32)}
        alt=""
        width={size}
        height={size}
        className="size-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

type SiteFaviconProps = {
  siteHost: string;
  size?: number;
  className?: string;
};

export function SiteFavicon({ siteHost, size = 16, className }: SiteFaviconProps) {
  const host = hostFromUrlOrHost(siteHost);
  if (!host) {
    return (
      <span
        className={cn(
          "bg-muted/50 text-muted-foreground inline-flex shrink-0 items-center justify-center rounded-md",
          className,
        )}
        style={{ width: size, height: size }}
      >
        <HugeiconsIcon icon={Globe02Icon} size={Math.max(size - 6, 10)} />
      </span>
    );
  }

  return <FaviconImage domain={host} size={size} className={className} fallbackIcon={Globe02Icon} />;
}

export type SourceKindKey = "google" | "direct" | "social" | "referral" | "email" | "other";

const sourceFallbackIcon: Record<SourceKindKey, typeof Globe02Icon> = {
  google: Globe02Icon,
  direct: Globe02Icon,
  social: Share08Icon,
  referral: Link01Icon,
  email: Mail01Icon,
  other: HelpCircleIcon,
};

const sourceFaviconDomain: Partial<Record<SourceKindKey, string>> = {
  google: "google.com",
};

type SourceIconProps = {
  sourceKind: string;
  size?: number;
  className?: string;
};

export function SourceIcon({ sourceKind, size = 16, className }: SourceIconProps) {
  const kind = (sourceKind in sourceFallbackIcon ? sourceKind : "other") as SourceKindKey;
  const domain = sourceFaviconDomain[kind];

  if (domain) {
    return (
      <FaviconImage
        domain={domain}
        size={size}
        className={className}
        fallbackIcon={sourceFallbackIcon[kind]}
      />
    );
  }

  return (
    <span
      className={cn(
        "bg-muted/50 text-muted-foreground inline-flex shrink-0 items-center justify-center rounded-md",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <HugeiconsIcon icon={sourceFallbackIcon[kind]} size={Math.max(size - 6, 10)} />
    </span>
  );
}
