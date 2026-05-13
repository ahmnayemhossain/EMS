// Internationalization (i18n) configuration
// This file provides a basic structure for multi-language support

export type Locale = "en" | "bn"; // English, Bengali

export interface TranslationKeys {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
  };
  // Navigation
  nav: {
    dashboard: string;
    audits: string;
    incidents: string;
    complaints: string;
    documents: string;
    training: string;
    chemicals: string;
    waste: string;
    wastewater: string;
    settings: string;
  };
  // Report Box
  reportBox: {
    workerReport: string;
    voiceReport: string;
    photoReport: string;
  };
}

const en: TranslationKeys = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    confirm: "Confirm",
  },
  nav: {
    dashboard: "Dashboard",
    audits: "Audits",
    incidents: "Incidents",
    complaints: "Complaints",
    documents: "Documents",
    training: "Training",
    chemicals: "Chemicals",
    waste: "Waste",
    wastewater: "Wastewater",
    settings: "Settings",
  },
  reportBox: {
    workerReport: "Worker Report",
    voiceReport: "Voice Report",
    photoReport: "Photo Report",
  },
};

const bn: TranslationKeys = {
  common: {
    save: "Ã Â¦Â¸Ã Â¦â€šÃ Â¦Â°Ã Â¦â€¢Ã Â§ÂÃ Â¦Â·Ã Â¦Â£",
    cancel: "Ã Â¦Â¬Ã Â¦Â¾Ã Â¦Â¤Ã Â¦Â¿Ã Â¦Â²",
    delete: "Ã Â¦Â®Ã Â§ÂÃ Â¦â€ºÃ Â§ÂÃ Â¦Â¨",
    edit: "Ã Â¦Â¸Ã Â¦Â®Ã Â§ÂÃ Â¦ÂªÃ Â¦Â¾Ã Â¦Â¦Ã Â¦Â¨Ã Â¦Â¾",
    create: "Ã Â¦Â¤Ã Â§Ë†Ã Â¦Â°Ã Â¦Â¿",
    search: "Ã Â¦â€¦Ã Â¦Â¨Ã Â§ÂÃ Â¦Â¸Ã Â¦Â¨Ã Â§ÂÃ Â¦Â§Ã Â¦Â¾Ã Â¦Â¨",
    loading: "Ã Â¦Â²Ã Â§â€¹Ã Â¦Â¡ Ã Â¦Â¹Ã Â¦Å¡Ã Â§ÂÃ Â¦â€ºÃ Â§â€¡...",
    error: "Ã Â¦Â¤Ã Â§ÂÃ Â¦Â°Ã Â§ÂÃ Â¦Å¸Ã Â¦Â¿",
    success: "Ã Â¦Â¸Ã Â¦Â«Ã Â¦Â²",
    confirm: "Ã Â¦Â¨Ã Â¦Â¿Ã Â¦Â¶Ã Â§ÂÃ Â¦Å¡Ã Â¦Â¿Ã Â¦Â¤",
  },
  nav: {
    dashboard: "Ã Â¦Â¡Ã Â§ÂÃ Â¦Â¯Ã Â¦Â¾Ã Â¦Â¶Ã Â¦Â¬Ã Â§â€¹Ã Â¦Â°Ã Â§ÂÃ Â¦Â¡",
    audits: "Ã Â¦â€¦Ã Â¦Â¡Ã Â¦Â¿Ã Â¦Å¸",
    incidents: "Ã Â¦ËœÃ Â¦Å¸Ã Â¦Â¨Ã Â¦Â¾",
    complaints: "Ã Â¦â€¦Ã Â¦Â­Ã Â¦Â¿Ã Â¦Â¯Ã Â§â€¹Ã Â¦â€”",
    documents: "Ã Â¦Â¨Ã Â¦Â¥Ã Â¦Â¿",
    training: "Ã Â¦ÂªÃ Â§ÂÃ Â¦Â°Ã Â¦Â¶Ã Â¦Â¿Ã Â¦â€¢Ã Â§ÂÃ Â¦Â·Ã Â¦Â£",
    chemicals: "Ã Â¦Â°Ã Â¦Â¾Ã Â¦Â¸Ã Â¦Â¾Ã Â¦Â¯Ã Â¦Â¼Ã Â¦Â¨Ã Â¦Â¿Ã Â¦â€¢",
    waste: "Ã Â¦Â¬Ã Â¦Â°Ã Â§ÂÃ Â¦Å“Ã Â§ÂÃ Â¦Â¯",
    wastewater: "Ã Â¦Â¬Ã Â¦Â°Ã Â§ÂÃ Â¦Å“Ã Â§ÂÃ Â¦Â¯ Ã Â¦ÂªÃ Â¦Â¾Ã Â¦Â¨Ã Â¦Â¿",
    settings: "Ã Â¦Â¸Ã Â§â€¡Ã Â¦Å¸Ã Â¦Â¿Ã Â¦â€šÃ Â¦Â¸",
  },
  reportBox: {
    workerReport: "Ã Â¦â€¢Ã Â¦Â°Ã Â§ÂÃ Â¦Â®Ã Â§â‚¬ Ã Â¦Â°Ã Â¦Â¿Ã Â¦ÂªÃ Â§â€¹Ã Â¦Â°Ã Â§ÂÃ Â¦Å¸",
    voiceReport: "Ã Â¦Â­Ã Â¦Â¯Ã Â¦Â¼Ã Â§â€¡Ã Â¦Â¸ Ã Â¦Â°Ã Â¦Â¿Ã Â¦ÂªÃ Â§â€¹Ã Â¦Â°Ã Â§ÂÃ Â¦Å¸",
    photoReport: "Ã Â¦â€ºÃ Â¦Â¬Ã Â¦Â¿ Ã Â¦Â°Ã Â¦Â¿Ã Â¦ÂªÃ Â§â€¹Ã Â¦Â°Ã Â§ÂÃ Â¦Å¸",
  },
};

const translations: Record<Locale, TranslationKeys> = { en, bn };

let currentLocale: Locale = "en";

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t<K extends keyof TranslationKeys>(
  section: K
): TranslationKeys[K] {
  return translations[currentLocale][section];
}

export { translations, en, bn };
export default translations;