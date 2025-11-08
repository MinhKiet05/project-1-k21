import React, { createContext, useContext, useState } from 'react';
import { useConversations } from '../hooks/useConversations';

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [pendingConversationId, setPendingConversationId] = useState(null);
  const [openConversationId, setOpenConversationId] = useState(null);
  const [directChatUser, setDirectChatUser] = useState(null); // For direct ChatWindow
  
  // Centralized conversations state
  const conversationsHook = useConversations(openConversationId);

  const openChatPopup = () => {
    setShowChatPopup(true);
  };

  const closeChatPopup = () => {
    setShowChatPopup(false);
    setPendingConversationId(null);
  };

  const openChatWithConversation = (conversationId) => {
    setPendingConversationId(conversationId);
    setShowChatPopup(true);
  };

  const openDirectChat = (conversationId, userInfo) => {
    // Open ChatWindow directly without showing ChatPopup
    const chatUser = {
      conversationId: conversationId,
      ...userInfo
    };
    setDirectChatUser(chatUser);
    setShowChatPopup(false); // Ensure ChatPopup is closed
  };

  const closeDirectChat = () => {
    setDirectChatUser(null);
  };

  return (
    <ChatContext.Provider value={{
      showChatPopup,
      pendingConversationId,
      openConversationId,
      directChatUser,
      openChatPopup,
      closeChatPopup,
      openChatWithConversation,
      openDirectChat,
      closeDirectChat,
      setShowChatPopup,
      setPendingConversationId,
      setOpenConversationId,
      // Expose conversations from centralized hook
      ...conversationsHook
    }}>
      {children}
    </ChatContext.Provider>
  );
};