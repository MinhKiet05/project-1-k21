import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { createPostNotification } from '../utils/notificationUtils'

/**
 * Hook để cập nhật trạng thái bài đăng (duyệt/không duyệt)
 */
export function useUpdatePostStatus() {
  const [isUpdating, setIsUpdating] = useState(false)

  const updatePostStatus = async (postId, status) => {
    try {
      setIsUpdating(true)
      
      const updateData = { status }
      
      // Nếu duyệt bài, set expires_at là 7 ngày sau
      if (status === 'approved') {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)
        updateData.expires_at = expiresAt.toISOString()
      }
      // Nếu không duyệt, set expires_at về null
      else if (status === 'rejected') {
        updateData.expires_at = null
      }

      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId)
        .select(`
          *,
          author:profiles(id, full_name, avatar_url),
          category:categories(id, name),
          location:locations(id, name)
        `)

      if (error) throw error

      const updatedPost = data?.[0]
      
      // Tạo thông báo cho tác giả bài viết khi admin duyệt/không duyệt
      if (updatedPost && (status === 'approved' || status === 'rejected')) {
        const notificationType = status === 'approved' ? 'post_approved' : 'post_rejected'
        await createPostNotification(
          updatedPost.author_id,
          notificationType,
          postId,
          {
            title: updatedPost.title,
            image_urls: updatedPost.image_urls
          }
        )
      }

      return { success: true, data: updatedPost }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setIsUpdating(false)
    }
  }

  const approvePost = async (postId) => {
    return updatePostStatus(postId, 'approved')
  }

  const rejectPost = async (postId) => {
    return updatePostStatus(postId, 'rejected')
  }

  const markAsSold = async (postId) => {
    return updatePostStatus(postId, 'sold')
  }

  const extendPost = async (postId) => {
    try {
      setIsUpdating(true)
      
      // Gia hạn thêm 7 ngày từ hôm nay
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)
      
      const { data, error } = await supabase
        .from('posts')
        .update({ 
          status: 'approved',
          expires_at: expiresAt.toISOString()
        })
        .eq('id', postId)
        .select(`
          *,
          author:profiles(id, full_name, avatar_url),
          category:categories(id, name),
          location:locations(id, name)
        `)

      if (error) throw error

      return { success: true, data: data?.[0] }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    isUpdating,
    updatePostStatus,
    approvePost,
    rejectPost,
    markAsSold,
    extendPost
  }
}