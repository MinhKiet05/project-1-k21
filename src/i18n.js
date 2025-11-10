import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Vietnamese translations
import viCommon from "./locales/vi/common.json";
import viHeader from "./locales/vi/header.json";
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

// Chinese translations
import chCommon from "./locales/ch/common.json";
import chHeader from "./locales/ch/header.json";
import chHomepage from "./locales/ch/homepage.json";
import chSearch from "./locales/ch/search.json";
import chUpload from "./locales/ch/upload.json";
import chManagement from "./locales/ch/management.json";
import chDashboard from "./locales/ch/dashboard.json";
import chPostDetail from "./locales/ch/postDetail.json";
import chDetailProduct from "./locales/ch/detailProduct.json";
import chAbout from "./locales/ch/about.json";
import chNotifications from "./locales/ch/notifications.json";
import chChat from "./locales/ch/chat.json";
import chLoginDialog from "./locales/ch/loginDialog.json";
import chCardProductsOfInterest from "./locales/ch/cardProductsOfInterest.json";

// Korean translations
import koCommon from "./locales/ko/common.json";
import koHeader from "./locales/ko/header.json";
import koHomepage from "./locales/ko/homepage.json";
import koSearch from "./locales/ko/search.json";
import koUpload from "./locales/ko/upload.json";
import koManagement from "./locales/ko/management.json";
import koDashboard from "./locales/ko/dashboard.json";
import koPostDetail from "./locales/ko/postDetail.json";
import koDetailProduct from "./locales/ko/detailProduct.json";
import koAbout from "./locales/ko/about.json";
import koNotifications from "./locales/ko/notifications.json";
import koChat from "./locales/ko/chat.json";
import koLoginDialog from "./locales/ko/loginDialog.json";
import koCardProductsOfInterest from "./locales/ko/cardProductsOfInterest.json";

const resources = {
  vi: {
    common: viCommon,
    header: viHeader,
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
  ch: {
    common: chCommon,
    header: chHeader,
    homepage: chHomepage,
    search: chSearch,
    upload: chUpload,
    management: chManagement,
    dashboard: chDashboard,
    postDetail: chPostDetail,
    detailProduct: chDetailProduct,
    about: chAbout,
    notifications: chNotifications,
    chat: chChat,
    loginDialog: chLoginDialog,
    cardProductsOfInterest: chCardProductsOfInterest,
  },
  ko: {
    common: koCommon,
    header: koHeader,
    homepage: koHomepage,
    search: koSearch,
    upload: koUpload,
    management: koManagement,
    dashboard: koDashboard,
    postDetail: koPostDetail,
    detailProduct: koDetailProduct,
    about: koAbout,
    notifications: koNotifications,
    chat: koChat,
    loginDialog: koLoginDialog,
    cardProductsOfInterest: koCardProductsOfInterest,
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
