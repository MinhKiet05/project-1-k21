import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useUser } from '@clerk/clerk-react';
import { useMessages } from "../../hooks/useMessages";
import "./ChatWindow.css";

const ChatWindow = React.memo(({ user, conversationId, onClose }) => {
  const { user: currentUser } = useUser();
  const { messages, loading, sendMessage: sendMessageToSupabase } = useMessages(conversationId);
  const [newMsg, setNewMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const messagesRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

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
    
    try {
      await sendMessageToSupabase(newMsg);
      setNewMsg("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [newMsg, sendMessageToSupabase]);

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
            <span className="user-status">Đang hoạt động</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div className="chat-messages" ref={messagesRef}>
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
            <p style={{ color: '#b0b3b8', margin: 0 }}>Đang tải tin nhắn...</p>
          </div>
        ) : (
          <>
            <div className="message-date">Hôm nay</div>

            {messages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: '#b0b3b8' 
              }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>💬</div>
                <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            ) : (
              messages.map((msg) => (
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
                    <div className="chat-bubble">
                      <span className="message-text">{msg.content}</span>
                    </div>

                    <div className="message-meta">
                      <span className="message-time">
                        {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
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
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Aa"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
        </div>

        <button className="send-btn" onClick={sendMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;