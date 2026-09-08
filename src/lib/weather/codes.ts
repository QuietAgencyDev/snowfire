const WEATHER_CODES: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Icy fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm with hail",
};

export function weatherCodeLabel(code: number | null | undefined): string {
  if (code == null || !Number.isFinite(code)) {
    return "Unknown conditions";
  }

  return WEATHER_CODES[code] ?? "Mixed conditions";
}

export function isSnowWeather(code: number | null | undefined): boolean {
  if (code == null) {
    return false;
  }

  return [71, 73, 75, 77, 85, 86].includes(code);
}
