import React, { useState } from "react";
import UserChatItem from "./UserChatItem";
import ChatWindow from "./ChatWindow";
import "./ChatPopup.css";

export default function ChatPopup() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const users = [
    {
      id: 1,
      name: "Dương Lễ",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
      lastMessage: "Ban đã gửi một ảnh",
      time: "1 phút",
      unread: false,
      isOnline: true,
    },
    {
      id: 2,
      name: "Minh Kiệt",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
      lastMessage: "ok",
      time: "9 phút",
      unread: true,
      isOnline: false,
    },
    {
      id: 3,
      name: "Chuột Gia Huy 🥺",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      lastMessage: "Cuộc gọi thoại đã kết thúc",
      time: "11 phút",
      unread: true,
      isOnline: true,
    },
    {
      id: 4,
      name: "Pưng Huỳnh",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face",
      lastMessage: "Ban: gì á",
      time: "15 phút",
      unread: false,
      isOnline: false,
    },
    {
      id: 5,
      name: "Sinh Viên Nghèo",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      lastMessage: "Ban: ok",
      time: "47 phút",
      unread: false,
      isOnline: false,
    },
    {
      id: 6,
      name: "Stve Jobs",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
      lastMessage: "ok  e oek",
      time: "1 giờ",
      unread: false,
      isOnline: false,
    },
    {
      id: 7,
      name: "Mai Quang Huy",
      avatar:
        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=50&h=50&fit=crop&crop=face",
      lastMessage: "Ban đã gửi một ảnh",
      time: "1 giờ",
      unread: false,
      isOnline: false,
    },
    {
      id: 8,
      name: "Hiền",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&h=50&fit=crop&crop=face",
      lastMessage: "đi hàng đợi điên bên đó á",
      time: "2 giờ",
      unread: false,
      isOnline: false,
    },
  ];

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <div className="chat-popup">
        <div className="chat-popup-header">
          <h3 className="chat-popup-title">Đoạn chat</h3>
        </div>

        <div className="chat-search">
          <div className="search-input-container">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm trong..."
              className="chat-search-input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="chat-popup-list">
          {filteredUsers.map((user) => (
            <UserChatItem
              key={user.id}
              user={user}
              onClick={(u) => setSelectedUser(u)}
            />
          ))}
          {filteredUsers.length === 0 && searchQuery && (
            <div className="no-results">
              <p>Không tìm thấy kết quả cho "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <ChatWindow user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </>
  );
}
