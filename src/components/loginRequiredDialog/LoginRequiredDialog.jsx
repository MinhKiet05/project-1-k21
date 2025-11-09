import React from 'react';
import './LoginRequiredDialog.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket, faTimes } from '@fortawesome/free-solid-svg-icons';
import { SignInButton } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';

const LoginRequiredDialog = ({ isOpen, onClose, message }) => {
  const { t } = useTranslation(['loginDialog', 'common']);
  
  if (!isOpen) return null;
  
  const displayMessage = message || t('defaultMessage');

  return (
    <div className="login-dialog-overlay" onClick={onClose}>
      <div className="login-dialog-content" onClick={(e) => e.stopPropagation()}>
        <button className="login-dialog-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className="login-dialog-body">
          <div className="login-dialog-icon">
            <FontAwesomeIcon icon={faRightToBracket} />
          </div>
          
          <h3 className="login-dialog-title">{t('title')}</h3>
          
          <p className="login-dialog-message">{displayMessage}</p>
          
          <div className="login-dialog-actions">
            <button className="login-dialog-cancel" onClick={onClose}>
              {t('common:cancel')}
            </button>
            
            <SignInButton mode="modal">
              <div className="login-dialog-signin">
                <FontAwesomeIcon
                  icon={faRightToBracket}
                  className="login-icon"
                />
                {t('login')}
              </div>
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredDialog;