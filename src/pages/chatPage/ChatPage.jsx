import { useState } from "react";
import "./ChatPage.css";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState("Minh Kiệt");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const allUsers = [
    {
      id: 1,
      name: "Minh Kiệt",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Mai Nhi",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Phương Quỳnh",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 4,
      name: "Ngọc Hiền",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 5,
      name: "Dương Lễ",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 6,
      name: "Hưu Khang",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    },
  ];

  // Filter users based on search term
  const filteredUsers = allUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Page Header */}
      <header className="page-header">
        <h1 className="page-title-title">Chats</h1>
      </header>

      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="search-section">
            <div className="search-wrapper">
              <svg
                className="search-icon"
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                  stroke="#65676b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search"
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="users-list">
            {filteredUsers.map((chat) => (
              <div
                key={chat.id}
                className={`user-item ${
                  selectedChat === chat.name ? "user-item--active" : ""
                }`}
                onClick={() => setSelectedChat(chat.name)}
              >
                <div className="user-avatar">
                  <img src={chat.avatar} alt={chat.name} />
                </div>
                <div className="user-info">
                  <span className="user-name">{chat.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Current User Profile */}
          <div className="current-user">
            <div className="current-user__avatar">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                alt="Jerry (Gia Huy)"
              />
            </div>
            <div className="current-user__info">
              <span className="current-user__name">Jerry ( Gia Huy )</span>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="chat-area">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header__top">
              <h2 className="chat-header__title">Chat with</h2>
            </div>

            <div className="chat-header__user">
              <div className="chat-header__user-info">
                <div className="chat-header__avatar">
                  <img
                    src={
                      allUsers.find((user) => user.name === selectedChat)
                        ?.avatar ||
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                    }
                    alt={selectedChat}
                  />
                </div>
                <span className="chat-header__username">{selectedChat}</span>
              </div>
            </div>
          </div>

          <div className="messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message message--${msg.sender}`}>
                {msg.sender === "other" && (
                  <div className="message__avatar">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                      alt="User"
                    />
                  </div>
                )}
                <div className="message__bubble">{msg.text}</div>
                {msg.sender === "me" && (
                  <div className="message__avatar message__avatar--right">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                      alt="Me"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="message-input">
            <form onSubmit={handleSendMessage} className="message-input__form">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập tin nhắn"
                className="message-input__field"
              />
              <button type="submit" className="message-input__button">
                Gửi
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
