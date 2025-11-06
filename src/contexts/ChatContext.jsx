import React, { createContext, useContext, useState } from 'react';

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
      openChatPopup,
      closeChatPopup,
      openChatWithConversation,
      setShowChatPopup,
      setPendingConversationId
    }}>
      {children}
    </ChatContext.Provider>
  );
};