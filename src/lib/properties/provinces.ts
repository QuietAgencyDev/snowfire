export const PROVINCE_CODES = [
  "ON",
  "QC",
  "NS",
  "NB",
  "MB",
  "BC",
  "PE",
  "SK",
  "AB",
  "NL",
  "NT",
  "YT",
  "NU",
] as const;

export const CANADIAN_PROVINCES: ReadonlyArray<{
  value: (typeof PROVINCE_CODES)[number];
  label: string;
}> = [
  { value: "ON", label: "Ontario" },
  { value: "QC", label: "Quebec" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NB", label: "New Brunswick" },
  { value: "MB", label: "Manitoba" },
  { value: "BC", label: "British Columbia" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "SK", label: "Saskatchewan" },
  { value: "AB", label: "Alberta" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NT", label: "Northwest Territories" },
  { value: "YT", label: "Yukon" },
  { value: "NU", label: "Nunavut" },
];

export type ProvinceCode = (typeof PROVINCE_CODES)[number];

export function isProvinceCode(value: string): value is ProvinceCode {
  return (PROVINCE_CODES as readonly string[]).includes(value);
}
