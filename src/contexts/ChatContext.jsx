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

  return (
    <ChatContext.Provider value={{
      showChatPopup,
      pendingConversationId,
      openConversationId,
      openChatPopup,
      closeChatPopup,
      openChatWithConversation,
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