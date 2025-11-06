import { useState } from "react";
import "./ChatPage.css";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState("Sinh Viên Nghèo");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const allUsers = [
    {
      id: 1,
      name: "Sinh Viên Nghèo",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      lastMessage: "Ban: oke",
      time: "21 phút",
      unread: false,
      isGroup: false,
    },
    {
      id: 2,
      name: "Nguyễn Minh Hiếu",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      lastMessage: "oke oek",
      time: "1 giờ",
      unread: false,
      isGroup: false,
    },
    {
      id: 3,
      name: "Nghĩa Trong",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      lastMessage: "Ban đã gửi một ảnh",
      time: "1 giờ",
      unread: false,
      isGroup: false,
    },
    {
      id: 4,
      name: "Lê Trường Khả Vy",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      lastMessage: "đi hàng đợi điên bên đó á",
      time: "1 giờ",
      unread: true,
      isGroup: false,
    },
    {
      id: 5,
      name: "Mỹ Linhh",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      lastMessage: "Ban đã gửi một nhãn dán",
      time: "3 giờ",
      unread: false,
      isGroup: false,
    },
    {
      id: 6,
      name: "hưng nói",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      lastMessage: "T thay luon r=))))",
      time: "7 giờ",
      unread: false,
      isGroup: false,
    },
  ];

  // Filter users based on search term and active tab
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (activeTab === "unread") {
      return matchesSearch && user.unread;
    }
    if (activeTab === "groups") {
      return matchesSearch && user.isGroup;
    }
    return matchesSearch; // "all" tab
  });

  const messages = [
    { id: 1, text: "Làm xong ngay cho tôi", sender: "other", time: "10:30" },
    { id: 2, text: "tại sao tôi phải làm?", sender: "me", time: "10:31" },
    { id: 3, text: "anh làm gì được tôi??", sender: "me", time: "10:32" },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle send message logic here
      setMessage("");
    }
  };

  return (
    <div className="chat-page">
      <aside className="sidebar">
        <header className="sidebar-header">
          <h2 className="sidebar-title">Đoạn chat</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm trong Messenger"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="chat-tabs">
            <button
              className={`tab ${activeTab === "all" ? "tab--active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả
            </button>
            <button
              className={`tab ${activeTab === "unread" ? "tab--active" : ""}`}
              onClick={() => setActiveTab("unread")}
            >
              Chưa đọc
            </button>
            <button
              className={`tab ${activeTab === "groups" ? "tab--active" : ""}`}
              onClick={() => setActiveTab("groups")}
            >
              Nhóm
            </button>
          </div>
        </header>

        <div className="user-list">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`user-item ${
                selectedChat === user.name ? "user-item--active" : ""
              }`}
              onClick={() => setSelectedChat(user.name)}
            >
              <img src={user.avatar} alt={user.name} className="user-avatar" />
              <div className="user-info">
                <div className="user-name-row">
                  <span className="user-name">{user.name}</span>
                  <span className="message-time">{user.time}</span>
                </div>
                <div className="last-message-row">
                  <span className="last-message">{user.lastMessage}</span>
                  {user.unread && <div className="unread-indicator"></div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-area">
        <header className="chat-header">
          <div className="chat-info">
            <img
              src={
                allUsers.find((user) => user.name === selectedChat)?.avatar ||
                "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
              }
              alt={selectedChat}
              className="chat-avatar"
            />
            <span className="chat-name">{selectedChat}</span>
          </div>
        </header>

        <div className="messages-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.sender === "me" ? "message--me" : "message--other"
              }`}
            >
              <div className="message-bubble">
                {msg.text}
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Aa"
            className="message-input"
          />
          <button type="submit" className="send-button">
            ➤
          </button>
        </form>
      </main>
    </div>
  );
}
