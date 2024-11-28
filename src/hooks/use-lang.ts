"use client";

import { useState, useEffect } from "react";

export function useLang() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    // Get browser language, defaulting to 'en' if not available
    const browserLang =
      typeof window !== "undefined" ? navigator.language.split("-")[0] : "en";

    setLang(browserLang);
  }, []);

  return lang;
}
