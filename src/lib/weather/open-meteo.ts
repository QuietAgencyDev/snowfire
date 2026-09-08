import { weatherCodeLabel } from "@/lib/weather/codes";
import type {
  LocalWeatherReport,
  WeatherService,
  WeatherSnapshot,
} from "@/lib/weather/types";

type OpenMeteoResponse = {
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    snowfall?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    weather_code?: number[];
    snowfall?: number[];
    precipitation?: number[];
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    snowfall_sum?: number[];
    precipitation_sum?: number[];
  };
};

export class OpenMeteoWeatherService implements WeatherService {
  async getObservedSnowfall(
    latitude: number,
    longitude: number,
  ): Promise<WeatherSnapshot | null> {
    const report = await getLocalWeatherReport(latitude, longitude);

    if (!report) {
      return null;
    }

    return {
      observedAt: report.observedAt,
      snowfallCm: report.snowfallCm,
      source: report.source,
    };
  }
}

export async function getLocalWeatherReport(
  latitude: number,
  longitude: number,
): Promise<LocalWeatherReport | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude.toFixed(4));
  url.searchParams.set("longitude", longitude.toFixed(4));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,snowfall,weather_code,wind_speed_10m",
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,weather_code,snowfall,precipitation",
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_sum",
  );
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as OpenMeteoResponse;
  const current = payload.current;

  if (!current || current.temperature_2m == null || current.weather_code == null) {
    return null;
  }

  const dailyTimes = payload.daily?.time ?? [];
  const hourlyTimes = payload.hourly?.time ?? [];
  const now = Date.now();
  const hourly = hourlyTimes
    .map((time, index) => ({
      time,
      temperatureC: payload.hourly?.temperature_2m?.[index] ?? current.temperature_2m ?? 0,
      weatherCode: payload.hourly?.weather_code?.[index] ?? current.weather_code ?? 0,
      snowfallCm: payload.hourly?.snowfall?.[index] ?? null,
      precipitationMm: payload.hourly?.precipitation?.[index] ?? null,
    }))
    .filter((hour) => new Date(hour.time).getTime() >= now - 60 * 60 * 1000)
    .slice(0, 18);

  return {
    observedAt: current.time ?? new Date().toISOString(),
    timezone: payload.timezone ?? "local",
    temperatureC: current.temperature_2m,
    apparentTemperatureC: current.apparent_temperature ?? null,
    humidityPct: current.relative_humidity_2m ?? null,
    windKmh: current.wind_speed_10m ?? null,
    precipitationMm: current.precipitation ?? null,
    snowfallCm: current.snowfall ?? null,
    weatherCode: current.weather_code,
    summary: weatherCodeLabel(current.weather_code),
    source: "Open-Meteo",
    hourly,
    daily: dailyTimes.map((date, index) => {
      const weatherCode = payload.daily?.weather_code?.[index] ?? current.weather_code ?? 0;

      return {
        date,
        weatherCode,
        summary: weatherCodeLabel(weatherCode),
        highC: payload.daily?.temperature_2m_max?.[index] ?? current.temperature_2m ?? 0,
        lowC: payload.daily?.temperature_2m_min?.[index] ?? current.temperature_2m ?? 0,
        snowfallCm: payload.daily?.snowfall_sum?.[index] ?? null,
        precipitationMm: payload.daily?.precipitation_sum?.[index] ?? null,
      };
    }),
  };
}
