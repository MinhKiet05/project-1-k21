import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import "./TourGuideButton.css";

const TourGuideButton = () => {
  const handleClick = () => {
    // Dispatch custom event to start tour
    document.dispatchEvent(new CustomEvent("start-fullsite-tour"));
  };

  return (
    <button
      className="tour-guide-button"
      onClick={handleClick}
      title="Hướng dẫn tôi"
    >
      <FontAwesomeIcon icon={faQuestionCircle} />
      <span>Hướng dẫn tôi</span>
    </button>
  );
};

export default TourGuideButton;
