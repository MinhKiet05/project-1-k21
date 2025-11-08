import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import vi from "./locales/vi/translation.json";

// Get saved language from localStorage or default to Vietnamese
const savedLanguage = localStorage.getItem("preferred-language") || "vi";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: savedLanguage, // Use saved language or default
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },

  // Debug mode for development
  debug: false,

  // Detection options
  detection: {
    order: ["localStorage", "navigator", "htmlTag"],
    caches: ["localStorage"],
  },
});

export default i18n;
