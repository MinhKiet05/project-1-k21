import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import "./TourGuideButton.css";

const TourGuideButton = () => {
  const { t } = useTranslation(['common']);

  const handleClick = () => {
    // Dispatch custom event to start tour
    document.dispatchEvent(new CustomEvent("start-fullsite-tour"));
  };

  const buttonText = t('common:tourGuide', 'Guide me');
  const buttonTitle = t('common:tourGuideTitle', 'Show me how to use this page');

  return (
    <button
      className="tour-guide-button"
      onClick={handleClick}
      title={buttonTitle}
    >
      <FontAwesomeIcon icon={faQuestionCircle} />
      <span>{buttonText}</span>
    </button>
  );
};

export default TourGuideButton;
