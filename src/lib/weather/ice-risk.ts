import type { LocalWeatherReport } from "./types";

export type IceRiskLevel = "low" | "watch" | "high" | "severe";

export type IceRiskReport = {
  score: number;
  level: IceRiskLevel;
  label: string;
  detail: string;
  freezeThawCount: number;
  glazeHours: number;
  next48hSnowCm: number;
  iceDamWatch: boolean;
};

export function iceRisk(report: LocalWeatherReport): IceRiskReport {
  const hours = report.hourly.slice(0, 48);
  let freezeThawCount = 0;
  let glazeHours = 0;

  for (let index = 1; index < hours.length; index += 1) {
    const previous = hours[index - 1]?.temperatureC ?? 0;
    const current = hours[index]?.temperatureC ?? 0;
    if ((previous > 0 && current <= 0) || (previous <= 0 && current > 0)) {
      freezeThawCount += 1;
    }
  }

  for (const hour of hours) {
    const nearZero = hour.temperatureC > -2.5 && hour.temperatureC < 1.5;
    const wet = (hour.precipitationMm ?? 0) > 0 || (hour.snowfallCm ?? 0) > 0;
    if (nearZero && wet) {
      glazeHours += 1;
    }
  }

  const iceStormNow = [56, 57, 66, 67].includes(report.weatherCode);
  const next48hSnowCm = hours.reduce((sum, hour) => sum + (hour.snowfallCm ?? 0), 0);
  const dailySnow = report.daily
    .slice(0, 2)
    .reduce((sum, day) => sum + (day.snowfallCm ?? 0), 0);
  const snow = Math.max(next48hSnowCm, dailySnow);

  let score = 8;
  score += freezeThawCount * 12;
  score += glazeHours * 8;
  score += snow >= 10 ? 25 : snow >= 5 ? 16 : snow >= 2 ? 8 : 0;
  if (iceStormNow) {
    score += 40;
  }
  score = Math.min(100, score);

  const level: IceRiskLevel = iceStormNow || score >= 80
    ? "severe"
    : score >= 55
      ? "high"
      : score >= 30
        ? "watch"
        : "low";

  const labels = {
    low: "Low ice risk",
    watch: "Freeze-line watch",
    high: "High glaze risk",
    severe: "Severe ice risk",
  };

  const details = {
    low: "Temps stay off the line. Keep your salted / unsalted choice on file for the next storm.",
    watch: `${freezeThawCount} freeze-thaw swing${freezeThawCount === 1 ? "" : "s"} in the next hours. A thin glaze can form overnight.`,
    high: `${glazeHours} wet hour${glazeHours === 1 ? "" : "s"} near zero. Sand or melt may matter more than a deep plow.`,
    severe: "Freezing rain or a hard glaze setup. Calcium or ice melt beats rock salt alone.",
  };

  return {
    score,
    level,
    label: labels[level],
    detail: details[level],
    freezeThawCount,
    glazeHours,
    next48hSnowCm: Number(snow.toFixed(1)),
    iceDamWatch: freezeThawCount >= 2 && snow >= 1,
  };
}
