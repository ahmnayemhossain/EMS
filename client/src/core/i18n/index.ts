export type Locale = "en" | "bn";

export interface TranslationKeys {
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
  nav: {
    audits: string;
    incidents: string;
    documents: string;
    training: string;
    chemicals: string;
    waste: string;
    wastewater: string;
    settings: string;
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
    audits: "Audits",
    incidents: "Incidents",
    documents: "Documents",
    training: "Training",
    chemicals: "Chemicals",
    waste: "Waste",
    wastewater: "Wastewater",
    settings: "Settings",
  },
};

const bn: TranslationKeys = {
  common: {
    save: "???????",
    cancel: "?????",
    delete: "?????",
    edit: "????????",
    create: "????",
    search: "?????????",
    loading: "??? ?????...",
    error: "??????",
    success: "???",
    confirm: "???????",
  },
  nav: {
    audits: "????",
    incidents: "????",
    documents: "???",
    training: "?????????",
    chemicals: "?????????",
    waste: "??????",
    wastewater: "?????? ????",
    settings: "??????",
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

export function t<K extends keyof TranslationKeys>(section: K): TranslationKeys[K] {
  return translations[currentLocale][section];
}

export { translations, en, bn };
export default translations;
