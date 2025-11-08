import { useTranslation } from "react-i18next";

export const useTranslations = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    // Save language preference to localStorage
    localStorage.setItem("preferred-language", language);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const isVietnamese = () => {
    return i18n.language === "vi";
  };

  const isEnglish = () => {
    return i18n.language === "en";
  };

  // Helper functions for common translations
  const translate = {
    header: (key) => t(`header.${key}`),
    post: (key) => t(`post.${key}`),
    search: (key) => t(`search.${key}`),
    management: (key) => t(`management.${key}`),
    dashboard: (key) => t(`dashboard.${key}`),
    about: (key) => t(`about.${key}`),
    chat: (key) => t(`chat.${key}`),
    common: (key) => t(`common.${key}`),
    time: (key) => t(`time.${key}`),
    notifications: (key) => t(`notifications.${key}`),
    errors: (key) => t(`errors.${key}`),
    validation: (key) => t(`validation.${key}`),
  };

  return {
    t,
    i18n,
    changeLanguage,
    getCurrentLanguage,
    isVietnamese,
    isEnglish,
    translate,
  };
};

export default useTranslations;
