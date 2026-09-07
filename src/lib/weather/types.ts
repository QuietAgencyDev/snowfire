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
