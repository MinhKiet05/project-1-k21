import React from "react";
import { useTranslations } from "../../hooks/useTranslations";
import "./LanguageSwitcher.css";

const LanguageSwitcher = ({ variant = "flags" }) => {
  const { changeLanguage, getCurrentLanguage, isVietnamese, isEnglish } =
    useTranslations();

  const handleLanguageChange = (language) => {
    changeLanguage(language);
  };

  if (variant === "flags") {
    return (
      <div className="language-switcher">
        <button
          onClick={() => handleLanguageChange("vi")}
          className={`flag-btn ${isVietnamese() ? "active" : ""}`}
          title="Tiếng Việt"
          aria-label="Switch to Vietnamese"
        >
          🇻🇳
        </button>
        <button
          onClick={() => handleLanguageChange("en")}
          className={`flag-btn ${isEnglish() ? "active" : ""}`}
          title="English"
          aria-label="Switch to English"
        >
          🇺🇸
        </button>
      </div>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className="language-dropdown">
        <select
          value={getCurrentLanguage()}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="language-select"
        >
          <option value="vi">🇻🇳 Tiếng Việt</option>
          <option value="en">🇺🇸 English</option>
        </select>
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className="language-text-switcher">
        <button
          onClick={() => handleLanguageChange("vi")}
          className={`lang-text-btn ${isVietnamese() ? "active" : ""}`}
        >
          VI
        </button>
        <span className="lang-separator">|</span>
        <button
          onClick={() => handleLanguageChange("en")}
          className={`lang-text-btn ${isEnglish() ? "active" : ""}`}
        >
          EN
        </button>
      </div>
    );
  }

  return null;
};

export default LanguageSwitcher;
