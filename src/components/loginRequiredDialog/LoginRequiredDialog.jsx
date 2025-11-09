import React from 'react';
import './LoginRequiredDialog.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket, faTimes } from '@fortawesome/free-solid-svg-icons';
import { SignInButton } from '@clerk/clerk-react';

const LoginRequiredDialog = ({ isOpen, onClose, message = "Bạn cần đăng nhập để thực hiện chức năng này" }) => {
  if (!isOpen) return null;

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
          
          <h3 className="login-dialog-title">Yêu cầu đăng nhập</h3>
          
          <p className="login-dialog-message">{message}</p>
          
          <div className="login-dialog-actions">
            <button className="login-dialog-cancel" onClick={onClose}>
              Hủy
            </button>
            
            <SignInButton mode="modal">
              <div className="login-dialog-signin">
                <FontAwesomeIcon
                  icon={faRightToBracket}
                  className="login-icon"
                />
                Đăng nhập
              </div>
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredDialog;