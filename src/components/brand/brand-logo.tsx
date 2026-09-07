import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { width: 140, height: 140 },
  md: { width: 220, height: 220 },
  lg: { width: 360, height: 360 },
} as const;

type BrandLogoProps = {
  size?: keyof typeof sizes;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  size = "md",
  className,
  priority = false,
}: BrandLogoProps) {
  const dimensions = sizes[size];

  return (
    <Image
      src="/brand/snowfire-logo.png"
      alt="SnowFire Online"
      width={dimensions.width}
      height={dimensions.height}
      priority={priority}
      className={cn("h-auto w-full object-contain", className)}
    />
  );
}
