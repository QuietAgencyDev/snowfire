import Image from "next/image";
import letteringArt from "../../../public/brand/snowfire-lettering.png";
import mascotArt from "../../../public/brand/snowfire-mascot.png";
import shovelingArt from "../../../public/brand/snowfire-shoveling.png";
import wordmarkArt from "../../../public/brand/snowfire-wordmark.png";
import { cn } from "@/lib/utils";

// Imported rather than pointed at by path, so the build fingerprints each file.
// Re-cutting an asset then publishes it under a fresh URL instead of leaving
// browsers on a cached copy, and its true size comes from the file itself —
// only the widths we lay out at are written down here.
const variants = {
  mascot: {
    art: mascotArt,
    widths: { sm: 72, md: 220, lg: 440 },
  },
  // Two name-only marks, and they are not interchangeable. The pale gradients on
  // `wordmark` measure about 1.2:1 against our light surfaces and vanish there,
  // so it belongs on dark; `lettering` is the heavy cut from the full logo and
  // holds up over both.
  wordmark: {
    art: wordmarkArt,
    widths: { sm: 168, md: 280, lg: 420 },
  },
  lettering: {
    art: letteringArt,
    widths: { sm: 168, md: 280, lg: 420 },
  },
  shoveling: {
    art: shovelingArt,
    widths: { sm: 96, md: 240, lg: 420 },
  },
} as const;

const ALT: Record<keyof typeof variants, string> = {
  mascot: "SnowFire.ca",
  wordmark: "SnowFire.ca",
  lettering: "SnowFire.ca",
  shoveling: "The SnowFire king clearing a driveway",
};

type BrandLogoProps = {
  variant?: keyof typeof variants;
  size?: keyof (typeof variants)["mascot"]["widths"];
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  variant = "mascot",
  size = "md",
  className,
  priority = false,
}: BrandLogoProps) {
  const asset = variants[variant];
  const width = asset.widths[size];

  return (
    <Image
      src={asset.art}
      alt={ALT[variant]}
      width={width}
      height={Math.round((width * asset.art.height) / asset.art.width)}
      priority={priority}
      unoptimized
      className={cn("h-auto w-full object-contain", className)}
    />
  );
}
