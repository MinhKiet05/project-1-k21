import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { supabase } from '../lib/supabase'

/**
 * 🔄 JIT (Just-In-Time) User Provisioning Hook
 * Tự động đồng bộ user từ Clerk sang Supabase khi đăng nhập
 */
export function useUserSync() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded || !user) return

    const syncUserToSupabase = async () => {
      try {
        // 1️⃣ Kiểm tra xem profile đã tồn tại chưa
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 = không tìm thấy row (bình thường khi user mới)
          return
        }

        // 2️⃣ Nếu profile đã tồn tại, không cần tạo mới
        if (existingProfile) {
          return
        }

        // 3️⃣ Tạo profile mới trong Supabase
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress,
              full_name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
              avatar_url: user.imageUrl,
              role: 'user', // Mặc định là 'user'
              location_id: null, // Mặc định là null
              created_at: new Date().toISOString()
            }
          ])
          .select()
      } catch (error) {
        // Silent fail - không hiển thị error
      }
    }

    syncUserToSupabase()
  }, [user, isLoaded])
}
