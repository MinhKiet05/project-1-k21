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
              roles: ['user'], // Mặc định là array ['user']
              location_id: null, // Mặc định là null
              created_at: new Date().toISOString()
            }
          ])
          .select()

        if (insertError) {
          if (insertError.code === '23505') {
            // Duplicate email - update existing profile with new Clerk ID
            const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress
            const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update({
                id: user.id,
                full_name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
                avatar_url: user.imageUrl,
              })
              .eq('email', userEmail)
              .select()

            if (!updateError) {
              // Trigger a page refresh to reload role context
              window.location.reload()
            }
          }
        } else {
          // Trigger a page refresh to reload role context
          window.location.reload()
        }
      } catch (error) {
        // Silent fail
      }
    }

    syncUserToSupabase()
  }, [user, isLoaded])
}
