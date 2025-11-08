import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useUser } from '@clerk/clerk-react';
import { useChatContext } from "../../contexts/ChatContext";
import UserChatItem from "./UserChatItem";
import "./ChatPopUp.css";

const ChatPopup = React.memo(() => {
  const { user } = useUser();
  const { 
    conversations, 
    loading, 
    loadingMore, 
    hasMore, 
    loadMore, 
    markConversationAsSeen,
    pendingConversationId, 
    setPendingConversationId, 
    closeChatPopup,
    openDirectChat
  } = useChatContext();
  const [searchQuery, setSearchQuery] = useState("");

  const formatTime = useCallback((dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) {
      return 'Vừa xong';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} phút`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} ngày`;
    } else {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  }, []);

  // Auto-open conversation if pendingConversationId is set
  useEffect(() => {
    if (pendingConversationId && conversations.length > 0) {
      const targetConversation = conversations.find(conv => conv.id === pendingConversationId);
      if (targetConversation) {
        const isPostAuthor = targetConversation.posts?.author_id === user?.id;
        const displayName = isPostAuthor 
          ? targetConversation.otherParticipant?.full_name || 'Người dùng'
          : targetConversation.otherParticipant?.full_name || 'Người bán';

        const userItem = {
          id: targetConversation.id,
          name: displayName,
          avatar: targetConversation.otherParticipant?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
          lastMessage: targetConversation.last_message_content || 'Chưa có tin nhắn',
          time: formatTime(targetConversation.last_message_at),
          unread: targetConversation.is_seen === false,
          isOnline: false,
          conversationId: targetConversation.id,
          otherParticipant: targetConversation.otherParticipant,
          postInfo: targetConversation.posts
        };

        setSelectedUser(userItem);
        setPendingConversationId(null);
      }
    }
  }, [pendingConversationId, conversations.length, formatTime, setPendingConversationId, user?.id]);

  // Convert conversations to user format for UserChatItem - Memoized
  const users = useMemo(() => {
    return conversations.map(conversation => {
      const isPostAuthor = conversation.posts?.author_id === user?.id;
      const displayName = isPostAuthor 
        ? conversation.otherParticipant?.full_name || 'Người dùng'
        : conversation.otherParticipant?.full_name || 'Người bán';

      return {
        id: conversation.id,
        name: displayName,
        avatar: conversation.otherParticipant?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        lastMessage: conversation.last_message_content || 'Chưa có tin nhắn',
        time: formatTime(conversation.last_message_at),
        unread: conversation.is_seen === false, // Unread if is_seen is false
        isOnline: false,
        conversationId: conversation.id,
        otherParticipant: conversation.otherParticipant,
        postInfo: conversation.posts
      };
    });
  }, [conversations, user?.id, formatTime]);

  // Filter users based on search query - Memoized
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleUserClick = useCallback((userItem) => {
    // Mark conversation as seen when user clicks on it
    if (userItem.conversationId && userItem.unread) {
      markConversationAsSeen(userItem.conversationId);
    }
    
    // Prepare user info for direct chat
    const userInfo = {
      id: userItem.id,
      name: userItem.name,
      avatar: userItem.avatar
    };
    
    // Open direct chat and close popup
    openDirectChat(userItem.conversationId, userInfo);
  }, [markConversationAsSeen, openDirectChat]);

  if (loading) {
    return (
      <div className="chat-popup">
        <div className="chat-popup-header">
          <h3 className="chat-popup-title">Đoạn chat</h3>
        </div>
        <div className="chat-popup-list">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px 20px',
            gap: '16px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #3a3b3c',
              borderTop: '3px solid #4fc3f7',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#b0b3b8', margin: 0 }}>Đang tải cuộc trò chuyện...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="chat-popup">
        <div className="chat-popup-header">
          <h3 className="chat-popup-title">Đoạn chat ({filteredUsers.length})</h3>
          <button 
            className="chat-close-btn" 
            onClick={closeChatPopup}
            aria-label="Đóng chat"
          >
            ×
          </button>
        </div>

        <div className="chat-search">
          <div className="search-input-container">
            <svg
              className="search-icon-popup"
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

        <div 
          className="chat-popup-list"
          onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.target;
            // Load more when scrolled to bottom
            if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !loadingMore) {
              loadMore();
            }
          }}
        >
          {filteredUsers.length === 0 ? (
            <div className="no-results">
              {searchQuery ? (
                <p>Không tìm thấy kết quả cho "{searchQuery}"</p>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                  <h3 style={{ color: '#e4e6ea', margin: '0 0 8px 0' }}>Chưa có cuộc trò chuyện</h3>
                  <p style={{ color: '#b0b3b8', margin: 0, fontSize: '14px' }}>
                    Bắt đầu chat với người khác về sản phẩm để thấy cuộc trò chuyện ở đây.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {filteredUsers.map((user) => (
                <UserChatItem
                  key={user.id}
                  user={user}
                  onClick={handleUserClick}
                />
              ))}
              {loadingMore && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  padding: '16px',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #3a3b3c',
                    borderTop: '2px solid #4fc3f7',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span style={{ color: '#b0b3b8', fontSize: '14px' }}>Đang tải thêm...</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
});

ChatPopup.displayName = 'ChatPopup';

export default ChatPopup;
