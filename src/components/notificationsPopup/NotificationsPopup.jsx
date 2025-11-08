import React, { useState, useEffect, useCallback } from "react";
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../../lib/supabase';
import "./NotificationsPopup.css";

const NotificationsPopup = React.memo(({ onClose }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format time similar to chat
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

  // Get notification title based on type
  const getNotificationTitle = useCallback((type) => {
    switch (type) {
      case 'post_approved':
        return 'Bài viết đã được duyệt';
      case 'post_rejected':
        return 'Bài viết không được duyệt';
      case 'post_expired':
        return 'Bài viết đã hết hạn';
      default:
        return 'Thông báo';
    }
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case 'post_approved':
        return '✅';
      case 'post_rejected':
        return '❌';
      case 'post_expired':
        return '⏰';
      default:
        return '📢';
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Handle notification click
  const handleNotificationClick = useCallback(async (notification) => {
    try {
      // Mark as read if not already
      if (!notification.is_read) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notification.id);

        if (error) throw error;

        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id 
              ? { ...n, is_read: true }
              : n
          )
        );
      }

      // Navigate to link if available
      if (notification.link) {
        navigate(notification.link);
        onClose();
      }
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  }, [navigate, onClose]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to real-time notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev => 
            prev.map(n => 
              n.id === payload.new.id ? payload.new : n
            )
          );
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchNotifications, user?.id]);

  // Parse post data from content (if it's JSON)
  const parsePostData = useCallback((content) => {
    try {
      if (content && content.startsWith('{')) {
        return JSON.parse(content);
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  return (
    <div className="notifications-popup">
      <div className="notifications-header">
        <div className="notifications-title">
          <h3>Thông báo</h3>
          <span className="notifications-count">
            {notifications.filter(n => !n.is_read).length}
          </span>
        </div>
        <div className="notifications-actions">
          <button 
            className="mark-all-read-btn"
            onClick={markAllAsRead}
            title="Đánh dấu tất cả đã đọc"
          >
            ✓
          </button>
          <button 
            className="close-notifications-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {loading ? (
          <div className="notifications-loading">
            <div className="loading-spinner"></div>
            <span>Đang tải thông báo...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="empty-icon"><FontAwesomeIcon icon={faBell} /></div>
            <p>Chưa có thông báo nào</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const postData = parsePostData(notification.content);
            const postImage = postData?.image_urls?.[0] || postData?.images?.[0] || postData?.image_url;

            return (
              <div
                key={notification.id}
                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-image">
                  {postImage ? (
                    <img src={postImage} alt="Post" />
                  ) : (
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title-text">
                      {getNotificationTitle(notification.type)}
                    </h4>
                    <span className="notification-time">
                      {formatTime(notification.created_at)}
                    </span>
                  </div>
                  
                  <p className="notification-description">
                    {postData?.title || notification.title || 'Tên bài viết'}
                  </p>

                  {!notification.is_read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

export default NotificationsPopup;
