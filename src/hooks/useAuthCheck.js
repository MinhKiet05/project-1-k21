import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';

export const useAuthCheck = () => {
  const { isSignedIn } = useUser();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const checkAuthAndExecute = (callback, message) => {
    if (isSignedIn) {
      callback();
    } else {
      setShowLoginDialog(true);
    }
  };

  const closeLoginDialog = () => {
    setShowLoginDialog(false);
  };

  return {
    isSignedIn,
    showLoginDialog,
    checkAuthAndExecute,
    closeLoginDialog
  };
};