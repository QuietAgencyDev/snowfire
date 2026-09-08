import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Snowflake,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { isSnowWeather } from "./codes";

export type WeatherTone = "ice" | "storm" | "sun" | "rain";

export function weatherIcon(code: number | null | undefined): LucideIcon {
  if (code == null) {
    return Cloud;
  }

  if ([0, 1].includes(code)) {
    return Sun;
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return code >= 75 ? Snowflake : CloudSnow;
  }

  if ([45, 48].includes(code)) {
    return CloudFog;
  }

  if ([95, 96, 99].includes(code)) {
    return CloudLightning;
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return CloudRain;
  }

  return Cloud;
}

export function weatherTone(code: number | null | undefined, snowfallCm = 0): WeatherTone {
  if (isSnowWeather(code) || snowfallCm > 0) {
    return "ice";
  }

  if (code != null && [95, 96, 99, 66, 67].includes(code)) {
    return "storm";
  }

  if (code != null && [51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(code)) {
    return "rain";
  }

  return "sun";
}

export function weatherToneClasses(tone: WeatherTone) {
  switch (tone) {
    case "ice":
      return "from-sky-600 via-blue-700 to-indigo-900 text-white";
    case "storm":
      return "from-slate-700 via-indigo-900 to-slate-950 text-white";
    case "rain":
      return "from-cyan-700 via-sky-800 to-slate-900 text-white";
    case "sun":
      return "from-amber-400 via-orange-500 to-rose-600 text-white";
  }
}
