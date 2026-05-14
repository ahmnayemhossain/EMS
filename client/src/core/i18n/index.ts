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
  reportBox: {
    workerReport: string;
    voiceReport: string;
    photoReport: string;
  };
}

const en: TranslationKeys = {
  common: { save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", create: "Create", search: "Search", loading: "Loading...", error: "Error", success: "Success", confirm: "Confirm" },
  nav: { dashboard: "Dashboard", audits: "Audits", incidents: "Incidents", complaints: "Complaints", documents: "Documents", training: "Training", chemicals: "Chemicals", waste: "Waste", wastewater: "Wastewater", settings: "Settings" },
  reportBox: { workerReport: "Worker Report", voiceReport: "Voice Report", photoReport: "Photo Report" },
};

const bn: TranslationKeys = {
  common: { save: "সংরক্ষণ", cancel: "বাতিল", delete: "মুছুন", edit: "সম্পাদনা", create: "তৈরি", search: "অনুসন্ধান", loading: "লোড হচ্ছে...", error: "ত্রুটি", success: "সফল", confirm: "নিশ্চিত" },
  nav: { dashboard: "ড্যাশবোর্ড", audits: "অডিট", incidents: "ঘটনা", complaints: "অভিযোগ", documents: "নথি", training: "প্রশিক্ষণ", chemicals: "রাসায়নিক", waste: "বর্জ্য", wastewater: "বর্জ্য পানি", settings: "সেটিংস" },
  reportBox: { workerReport: "কর্মী রিপোর্ট", voiceReport: "ভয়েস রিপোর্ট", photoReport: "ছবি রিপোর্ট" },
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
