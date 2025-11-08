// Utility functions for notifications
import { supabase } from '../lib/supabase';

/**
 * Create notification for post status changes
 * @param {string} userId - User ID to notify
 * @param {string} type - Notification type: 'post_approved', 'post_rejected', 'post_expired'
 * @param {string} postId - Post ID
 * @param {object} postData - Post data including title, images, etc.
 * @returns {Promise}
 */
export const createPostNotification = async (userId, type, postId, postData) => {
  try {
    const titles = {
      post_approved: 'Bài viết đã được duyệt',
      post_rejected: 'Bài viết không được duyệt',
      post_expired: 'Bài viết đã hết hạn'
    };

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: type,
        title: titles[type],
        content: JSON.stringify({
          title: postData.title,
          image_urls: postData.image_urls,
          images: postData.images,
          image_url: postData.image_url
        }),
        link: `/management`,
        is_read: false
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
};

/**
 * Get unread notifications count for user
 * @param {string} userId - User ID
 * @returns {Promise<number>}
 */
export const getUnreadNotificationsCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * Create sample notification for testing
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const createSampleNotification = async (userId) => {
  const samplePostData = {
    title: 'Sách Giáo Dục Thể Chất',
    image_urls: ['/logo.webp'] // Using placeholder image
  };

  return await createPostNotification(
    userId, 
    'post_approved', 
    'sample-post-id', 
    samplePostData
  );
};