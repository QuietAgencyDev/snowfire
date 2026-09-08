import { isSnowWeather } from "./codes";
import type { LocalWeatherReport } from "./types";

export type WeatherAdvice = {
  title: string;
  detail: string;
  tone: "ice" | "fire" | "forest";
};

export function weatherAdvice(report: LocalWeatherReport): WeatherAdvice {
  const upcomingSnow = report.daily
    .slice(0, 2)
    .reduce((sum, day) => sum + (day.snowfallCm ?? 0), 0);
  const nowSnow = report.snowfallCm ?? 0;
  const cold = report.temperatureC <= -10;
  const nearFreeze = report.temperatureC > -4 && report.temperatureC < 2;
  const iceStorm = [56, 57, 66, 67].includes(report.weatherCode);

  if (iceStorm) {
    return {
      title: "Ice is the story",
      detail: "Freezing rain or drizzle is in the mix. Ice melt or calcium beats rock salt alone.",
      tone: "fire",
    };
  }

  if (isSnowWeather(report.weatherCode) || nowSnow >= 1 || upcomingSnow >= 5) {
    if (cold) {
      return {
        title: "Deep cold snow",
        detail: "Salt slows down below -10°C. Ask for sand or calcium if you want grip tonight.",
        tone: "ice",
      };
    }

    return {
      title: "Snow is on this pin",
      detail: "This is your driveway’s forecast, not a city average. Salted or unsalted — lock it in below.",
      tone: "ice",
    };
  }

  if (nearFreeze) {
    return {
      title: "Watch the freeze line",
      detail: "Temps are hugging zero. A light melt or unsalted grit can stop the morning glaze.",
      tone: "forest",
    };
  }

  return {
    title: "Quiet skies for now",
    detail: "No active snow on this address. Your treatment choices still stay on the property for the next storm.",
    tone: "forest",
  };
}
