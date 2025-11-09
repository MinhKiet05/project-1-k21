import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { useMessages } from "../../hooks/useMessages";
import { useChatContext } from "../../contexts/ChatContext";
import { toast } from 'react-toastify';
import CardProductsOfInterest from '../cardProductsOfInterest/CardProductsOfInterest';
import "./ChatWindow.css";

const ChatWindow = React.memo(({ user, conversationId, onClose }) => {
  const { user: currentUser } = useUser();
  const { t, i18n } = useTranslation(['chat', 'common']);
  const { messages, loading, loadingMore, hasMore, sendMessage: sendMessageToSupabase, loadMore } = useMessages(conversationId);
  const { markConversationAsSeen, setOpenConversationId } = useChatContext();
  const [newMsg, setNewMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const emojiPickerRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const lastSendTimeRef = useRef(0);

  // Auto scroll to bottom only for new messages or initial load
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [justSentMessage, setJustSentMessage] = useState(false);

  // Auto scroll function
  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      const container = messagesRef.current;
      // Use smooth scrolling for better UX
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Force scroll to bottom
  const forceScrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      const container = messagesRef.current;
      // Force immediate scroll without animation
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Mark conversation as seen when ChatWindow opens
  useEffect(() => {
    if (conversationId) {
      setOpenConversationId(conversationId);
      markConversationAsSeen(conversationId);
      
      return () => {
        setOpenConversationId(null);
      };
    }
  }, [conversationId, markConversationAsSeen, setOpenConversationId]);

  // Focus input and scroll to bottom when ChatWindow opens
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Focus on input for immediate typing
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
      // Force scroll to bottom to show latest content (including product inquiry)
      forceScrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [conversationId, forceScrollToBottom]);

  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      // Initial load completed - scroll to bottom
      setTimeout(() => {
        forceScrollToBottom();
        setInitialLoadComplete(true);
      }, 100);
    } else if (initialLoadComplete && messagesRef.current) {
      const container = messagesRef.current;
      
      if (justSentMessage) {
        // Always scroll when just sent a message
        setTimeout(() => {
          forceScrollToBottom();
          setJustSentMessage(false);
        }, 50);
      } else {
        // Check if user is at bottom before auto scrolling for incoming messages
        setTimeout(() => {
          if (messagesRef.current) {
            const container = messagesRef.current;
            const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
            if (isAtBottom) {
              forceScrollToBottom();
            }
          }
        }, 100);
      }
    }
  }, [messages, loading, initialLoadComplete, justSentMessage, forceScrollToBottom]);

  // Scroll to bottom when product inquiry message is detected
  useEffect(() => {
    if (messages.length > 0) {
      const hasProductInquiry = messages.some(msg => 
        msg.content && msg.content.startsWith('PRODUCT_INQUIRY:')
      );
      
      if (hasProductInquiry) {
        // Longer delay to ensure CardProductsOfInterest is rendered
        setTimeout(() => {
          forceScrollToBottom();
        }, 200);
      }
    }
  }, [messages, forceScrollToBottom]);

  // Handle click outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const sendMessage = useCallback(async () => {
    if (!newMsg.trim()) return;
    if (isSending) return;
    
    const now = Date.now();
    const timeSinceLastSend = now - lastSendTimeRef.current;
    
    // Check if less than 2 seconds since last send
    if (timeSinceLastSend < 2000) {
      const remainingTime = Math.ceil((2000 - timeSinceLastSend) / 1000);
      toast.warning(t('chat:waitMessage', { seconds: remainingTime }), {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
      });
      return;
    }
    
    try {
      setIsSending(true);
      await sendMessageToSupabase(newMsg);
      setNewMsg("");
      setJustSentMessage(true); // Flag để auto scroll sau khi gửi
      lastSendTimeRef.current = now;
    } catch (error) {
      console.error("Error sending message:", error);
      // Even on error, try to scroll if message was added to UI
      setJustSentMessage(true);
    } finally {
      setIsSending(false);
    }
  }, [newMsg, sendMessageToSupabase, isSending]);

  const addEmoji = useCallback((emoji) => {
    setNewMsg((prev) => prev + emoji);
    setShowEmojiPicker(false);
  }, []);

  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker(!showEmojiPicker);
  }, [showEmojiPicker]);

  // Memoize emojis array to prevent recreation
  const emojiList = useMemo(() => [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", 
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", 
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", 
    "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", 
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", 
    "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", 
    "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐", "✋", "🖖", "👏", 
    "🙌", "🤲", "🤝", "🙏", "❤️", "🧡", "💛", "💚", "💙", "💜"
  ], []);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="user-info-header">
          <div className="user-avatar-container">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            {user.isOnline && <div className="online-indicator"></div>}
          </div>
          <div className="user-details">
            <span className="user-name">{user.name}</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div 
        className="chat-messages" 
        ref={messagesRef}
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.target;
          
          // Load more when scrolled to top
          if (scrollTop <= 50 && hasMore && !loadingMore && initialLoadComplete) {
            const prevScrollHeight = scrollHeight;
            loadMore();
            // Maintain scroll position after loading more messages
            setTimeout(() => {
              if (messagesRef.current) {
                const newScrollHeight = messagesRef.current.scrollHeight;
                messagesRef.current.scrollTop = newScrollHeight - prevScrollHeight;
              }
            }, 200);
          }
          
          // Check if user is at bottom for auto-scroll behavior
          const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
          setShouldAutoScroll(isAtBottom);
        }}
      >
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid rgba(255,255,255,0.2)',
              borderTop: '3px solid #4fc3f7',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#b0b3b8', margin: 0 }}>{t('chat:loadingMessages')}</p>
          </div>
        ) : (
          <>
            {loadingMore && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                padding: '12px',
                gap: '8px',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderTop: '2px solid #4fc3f7',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{ color: '#b0b3b8', fontSize: '12px' }}>{t('chat:loadingOldMessages')}</span>
              </div>
            )}
            
            <div className="message-date">{t('chat:today')}</div>

            {messages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: '#b0b3b8' 
              }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>💬</div>
                <p>{t('chat:noMessagesStart')}</p>
              </div>
            ) : (
              messages.map((msg) => {
                // Handle product inquiry message as centered card
                if (msg.content && msg.content.startsWith('PRODUCT_INQUIRY:')) {
                  const productDataStr = msg.content.substring('PRODUCT_INQUIRY:'.length);
                  const productData = JSON.parse(productDataStr);
                  return (
                    <div key={msg.id} className="message-container product-inquiry-message">
                      <div className="product-inquiry-content">
                        <CardProductsOfInterest product={productData} />
                      </div>
                      <div className="message-time-center">
                        {new Date(msg.created_at).toLocaleTimeString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  );
                }

                // Handle regular messages
                return (
                  <div
                    key={msg.id}
                    className={`message-container ${
                      msg.sender_id === currentUser?.id ? "message-me" : "message-user"
                    }`}
                  >
                    {msg.sender_id !== currentUser?.id && (
                      <div className="message-avatar">
                        <img 
                          src={msg.profiles?.avatar_url || user.avatar} 
                          alt={msg.profiles?.full_name || user.name} 
                        />
                      </div>
                    )}

                    <div className="message-content">
                      <div className={`chat-bubble ${msg.message_type === 'product' ? 'product-message' : ''}`}>
                        {msg.message_type === 'product' ? (
                          <div className="product-message-content">
                            <div className="product-icon">🛍️</div>
                            <div className="product-text">
                              {msg.content.split('\n').map((line, index) => (
                                <div key={index} className={`product-line ${index === 0 ? 'product-title' : ''}`}>
                                  {line}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="message-text">{msg.content}</span>
                        )}
                      </div>

                      <div className="message-meta">
                        <span className="message-time">
                          {new Date(msg.created_at).toLocaleTimeString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      <div className="chat-input-container">
        <div className="input-icon" onClick={toggleEmojiPicker}>
          😊
        </div>

        {showEmojiPicker && (
          <div className="emoji-picker" ref={emojiPickerRef}>
            <div className="emoji-grid">
              {emojiList.map((emoji, index) => (
                <button
                  key={index}
                  className="emoji-btn"
                  onClick={() => addEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="chat-input">
          <input
            ref={inputRef}
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder={t('chat:messagePlaceholder')}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
        </div>

        <button 
          className="send-btn" 
          onClick={sendMessage}
          disabled={isSending}
          style={{ opacity: isSending ? 0.6 : 1 }}
        >
          {isSending ? (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;