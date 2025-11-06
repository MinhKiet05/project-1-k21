import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";

export default function ChatWindow({ user, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "user",
      text: "câm ơi c An nha",
      time: "15:14 28 Tháng 10, 2025",
      status: "seen",
    },
    {
      id: 2,
      from: "me",
      text: "ức",
      time: "20:48",
      status: "delivered",
    },
    {
      id: 3,
      from: "user",
      text: "Cuộc gọi thoại",
      time: "20:48",
      isCall: true,
      callType: "incoming",
      callDuration: "2 phút",
    },
    {
      id: 4,
      from: "user",
      text: "Gọi lại",
      time: "20:49",
      isCallAction: true,
    },
  ]);
  const [newMsg, setNewMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const messagesRef = useRef(null);

  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👋",
    "🤚",
    "🖐",
    "✋",
    "🖖",
    "👏",
    "🙌",
    "🤲",
    "🤝",
    "🙏",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
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

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    const newMessage = {
      id: messages.length + 1,
      from: "me",
      text: newMsg,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sending",
    };
    setMessages([...messages, newMessage]);
    setNewMsg("");

    // Scroll to bottom without smooth animation
    setTimeout(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    }, 0);
  };

  const addEmoji = (emoji) => {
    setNewMsg((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

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
        <div className="message-date">Hôm nay</div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-container ${
              msg.from === "me" ? "message-me" : "message-user"
            }`}
          >
            {msg.from === "user" && (
              <div className="message-avatar">
                <img src={user.avatar} alt={user.name} />
              </div>
            )}

            <div className="message-content">
              {msg.isCall ? (
                <div className={`call-message ${msg.callType}`}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{msg.text}</span>
                  {msg.callDuration && (
                    <span className="call-duration">{msg.callDuration}</span>
                  )}
                </div>
              ) : msg.isCallAction ? (
                <div className="call-action">
                  <button className="call-back-btn">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {msg.text}
                  </button>
                </div>
              ) : (
                <div className="chat-bubble">
                  <span className="message-text">{msg.text}</span>
                </div>
              )}

              <div className="message-meta">
                <span className="message-time">{msg.time}</span>
                {msg.from === "me" && msg.status && (
                  <div className={`message-status ${msg.status}`}>
                    {msg.status === "delivered" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                      </svg>
                    )}
                    {msg.status === "seen" && (
                      <img
                        src={user.avatar}
                        alt="Seen"
                        className="seen-avatar"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <div className="input-icon" onClick={toggleEmojiPicker}>
          😊
        </div>

        {showEmojiPicker && (
          <div className="emoji-picker" ref={emojiPickerRef}>
            <div className="emoji-grid">
              {emojis.map((emoji, index) => (
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
}
