import {
  Anchor,
  Bath,
  Bluetooth,
  Check,
  Fuel,
  Goggles,
  Music,
  ShowerHead,
  Snowflake,
  Sparkles,
  Sun,
  Umbrella,
  UserRoundCheck,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const MAP: { match: string; icon: LucideIcon }[] = [
  { match: "captain", icon: UserRoundCheck },
  { match: "crew", icon: Sparkles },
  { match: "bluetooth", icon: Bluetooth },
  { match: "audio", icon: Music },
  { match: "fuel", icon: Fuel },
  { match: "snorkel", icon: Goggles },
  { match: "paddle", icon: Waves },
  { match: "wakeboard", icon: Waves },
  { match: "cooler", icon: Snowflake },
  { match: "shower", icon: ShowerHead },
  { match: "swim", icon: Anchor },
  { match: "bimini", icon: Umbrella },
  { match: "shade", icon: Sun },
  { match: "air condition", icon: Snowflake },
  { match: "restroom", icon: Bath },
];

export function AmenityIcon({ name, className }: { name: string; className?: string }) {
  const lower = name.toLowerCase();
  const found = MAP.find((entry) => lower.includes(entry.match));
  const Icon = found?.icon ?? Check;
  return <Icon className={className} />;
}
