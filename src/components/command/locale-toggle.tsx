"use client";

import { useEffect, useState } from "react";
import type { AppLocale } from "@/lib/i18n/command";

type LocaleToggleProps = {
  value?: AppLocale;
  onChange?: (locale: AppLocale) => void;
};

export function LocaleToggle({ value, onChange }: LocaleToggleProps) {
  const [locale, setLocale] = useState<AppLocale>(value ?? "en");

  useEffect(() => {
    const stored = window.localStorage.getItem("snowfire-locale");
    if (stored === "fr" || stored === "en") {
      setLocale(stored);
      onChange?.(stored);
    }
  }, [onChange]);

  function choose(next: AppLocale) {
    setLocale(next);
    window.localStorage.setItem("snowfire-locale", next);
    document.documentElement.lang = next === "fr" ? "fr-CA" : "en-CA";
    onChange?.(next);
  }

  return (
    <div className="inline-flex overflow-hidden rounded-full border-2 border-white/40 bg-white/10 text-xs font-black">
      <button
        type="button"
        onClick={() => choose("en")}
        className={`px-3 py-1 ${locale === "en" ? "bg-white text-sky-800" : "text-white"}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => choose("fr")}
        className={`px-3 py-1 ${locale === "fr" ? "bg-white text-sky-800" : "text-white"}`}
      >
        FR
      </button>
    </div>
  );
}
