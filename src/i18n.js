import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Vietnamese translations
import viCommon from "./locales/vi/common.json";
import viHeader from "./locales/vi/header.json";
import viFooter from "./locales/vi/footer.json";
import viHomepage from "./locales/vi/homepage.json";
import viSearch from "./locales/vi/search.json";
import viUpload from "./locales/vi/upload.json";
import viManagement from "./locales/vi/management.json";
import viDashboard from "./locales/vi/dashboard.json";
import viPostDetail from "./locales/vi/postDetail.json";
import viDetailProduct from "./locales/vi/detailProduct.json";
import viAbout from "./locales/vi/about.json";
import viNotifications from "./locales/vi/notifications.json";
import viChat from "./locales/vi/chat.json";
import viLoginDialog from "./locales/vi/loginDialog.json";
import viCardProductsOfInterest from "./locales/vi/cardProductsOfInterest.json";

// English translations
import enCommon from "./locales/en/common.json";
import enHeader from "./locales/en/header.json";
import enFooter from "./locales/en/footer.json";
import enHomepage from "./locales/en/homepage.json";
import enSearch from "./locales/en/search.json";
import enUpload from "./locales/en/upload.json";
import enManagement from "./locales/en/management.json";
import enDashboard from "./locales/en/dashboard.json";
import enPostDetail from "./locales/en/postDetail.json";
import enDetailProduct from "./locales/en/detailProduct.json";
import enAbout from "./locales/en/about.json";
import enNotifications from "./locales/en/notifications.json";
import enChat from "./locales/en/chat.json";
import enLoginDialog from "./locales/en/loginDialog.json";
import enCardProductsOfInterest from "./locales/en/cardProductsOfInterest.json";

const resources = {
  vi: {
    common: viCommon,
    header: viHeader,
    footer: viFooter,
    homepage: viHomepage,
    search: viSearch,
    upload: viUpload,
    management: viManagement,
    dashboard: viDashboard,
    postDetail: viPostDetail,
    detailProduct: viDetailProduct,
    about: viAbout,
    notifications: viNotifications,
    chat: viChat,
    loginDialog: viLoginDialog,
    cardProductsOfInterest: viCardProductsOfInterest,
  },
  en: {
    common: enCommon,
    header: enHeader,
    footer: enFooter,
    homepage: enHomepage,
    search: enSearch,
    upload: enUpload,
    management: enManagement,
    dashboard: enDashboard,
    postDetail: enPostDetail,
    detailProduct: enDetailProduct,
    about: enAbout,
    notifications: enNotifications,
    chat: enChat,
    loginDialog: enLoginDialog,
    cardProductsOfInterest: enCardProductsOfInterest,
  },
  
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "vi", // default language
    fallbackLng: "vi", // fallback language if key not found

    interpolation: {
      escapeValue: false, // react already does escaping
    },

    // Save language preference to localStorage
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },

    // Configure namespaces
    ns: [
      "common",
      "header",
      "footer",
      "homepage",
      "search",
      "upload",
      "management",
      "dashboard",
      "postDetail",
      "detailProduct",
      "about",
      "notifications",
      "chat",
      "loginDialog",
      "cardProductsOfInterest",
    ],
    defaultNS: "common",
  });

export default i18n;
