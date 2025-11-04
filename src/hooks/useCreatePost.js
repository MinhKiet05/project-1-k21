import { supabase } from '../lib/supabase'

/**
 * Hook để tạo post mới trong Supabase
 */
export function useCreatePost() {
  const createPost = async (postData) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          title: postData.title,
          description: postData.description,
          price: parseFloat(postData.price),
          image_urls: postData.imageUrls || [], // Array URLs ảnh đã upload
          status: 'pending', // Chờ duyệt
          author_id: postData.authorId,
          category_id: postData.categoryId,
          location_id: postData.locationId,
          // expires_at để null (sẽ set khi admin approve)
        }])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return { createPost }
}