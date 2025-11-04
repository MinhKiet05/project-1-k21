import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Tạo client với service role để bypass RLS
const supabaseService = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

/**
 * Upload ảnh lên Supabase Storage
 * @param {File[]} files - Array của File objects
 * @param {string} folder - Thư mục trong storage bucket (vd: "posts")
 * @returns {Promise<{success: boolean, urls?: string[], error?: string}>}
 */
export async function uploadImages(files, folder = 'posts') {
  try {
    if (!files || files.length === 0) {
      return { success: true, urls: [] }
    }

    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${index}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Sử dụng service client nếu có, không thì dùng client thường
      const client = supabaseService || (await import('../lib/supabase')).supabase
      
      const { data, error } = await client.storage
        .from('images') // Tên bucket trong Supabase Storage
        .upload(filePath, file)

      if (error) throw error

      // Lấy public URL
      const { data: { publicUrl } } = client.storage
        .from('images')
        .getPublicUrl(filePath)

      return publicUrl
    })

    const urls = await Promise.all(uploadPromises)
    return { success: true, urls }
  } catch (err) {
    return { success: false, error: err.message }
  }
}