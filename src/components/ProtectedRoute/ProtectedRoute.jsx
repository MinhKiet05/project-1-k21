import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import LoginRequiredDialog from '../loginRequiredDialog/LoginRequiredDialog';

const ProtectedRoute = ({ children, message = "Bạn cần đăng nhập để truy cập trang này" }) => {
  const { isSignedIn } = useUser();
  const [showLoginDialog, setShowLoginDialog] = useState(!isSignedIn);

  const handleCloseDialog = () => {
    setShowLoginDialog(false);
    // Redirect về home page nếu user không đăng nhập
    window.location.href = '/home';
  };

  if (!isSignedIn) {
    return (
      <LoginRequiredDialog
        isOpen={showLoginDialog}
        onClose={handleCloseDialog}
        message={message}
      />
    );
  }

  return children;
};

export default ProtectedRoute;