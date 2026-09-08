export type WeatherSnapshot = {
  observedAt: string;
  snowfallCm: number | null;
  source: string;
};

export interface WeatherService {
  getObservedSnowfall(
    latitude: number,
    longitude: number,
    at: Date,
  ): Promise<WeatherSnapshot | null>;
}

export type DailyWeather = {
  date: string;
  weatherCode: number;
  summary: string;
  highC: number;
  lowC: number;
  snowfallCm: number | null;
  precipitationMm: number | null;
};

export type HourlyWeather = {
  time: string;
  temperatureC: number;
  weatherCode: number;
  snowfallCm: number | null;
  precipitationMm: number | null;
};

export type LocalWeatherReport = {
  observedAt: string;
  timezone: string;
  temperatureC: number;
  apparentTemperatureC: number | null;
  humidityPct: number | null;
  windKmh: number | null;
  precipitationMm: number | null;
  snowfallCm: number | null;
  weatherCode: number;
  summary: string;
  source: string;
  daily: DailyWeather[];
  hourly: HourlyWeather[];
};
