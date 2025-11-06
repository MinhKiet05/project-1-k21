import React from "react";
import "./UserChatItem.css";

export default function UserChatItem({ user, onClick }) {
  return (
    <div className="user-chat-item" onClick={() => onClick(user)}>
      <div className="user-avatar-container">
        <img src={user.avatar} alt={user.name} className="user-avatar" />
        {user.isOnline && <div className="online-status"></div>}
      </div>
      <div className="user-info-chat">
        <div className="user-name-row">
          <div className="user-name">{user.name}</div>
          <div className="user-time">{user.time}</div>
        </div>
        <div className="user-message-row">
          <div className="user-last-message">{user.lastMessage}</div>
          {user.unread && <div className="unread-dot"></div>}
        </div>
      </div>
    </div>
  );
}
