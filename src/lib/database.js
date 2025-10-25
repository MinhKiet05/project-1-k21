import { supabase } from './supabase.js'

// Profile utilities for syncing with Clerk
export const profileService = {
  // Create or update profile from Clerk data
  async upsertProfile(clerkUser) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        full_name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        avatar_url: clerkUser.imageUrl,
        // Keep existing role and location_id if profile exists
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()

    if (error) throw error
    return data?.[0]
  },

  // Get profile by Clerk user ID
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        location:locations(*)
      `)
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data
  },

  // Update profile location
  async updateLocation(userId, locationId) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ location_id: locationId })
      .eq('id', userId)
      .select()

    if (error) throw error
    return data?.[0]
  }
}

// Location utilities
export const locationService = {
  // Get all locations
  async getLocations() {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },

  // Get location by slug
  async getLocationBySlug(slug) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }
}

// Category utilities
export const categoryService = {
  // Get all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  }
}

// Post utilities
export const postService = {
  // Create new post
  async createPost(postData) {
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select(`
        *,
        author:profiles(*),
        category:categories(*),
        location:locations(*)
      `)

    if (error) throw error
    return data?.[0]
  },

  // Get posts with filters
  async getPosts({ locationId, categoryId, status = 'approved', limit = 20, offset = 0 } = {}) {
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url),
        category:categories(*),
        location:locations(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (locationId) query = query.eq('location_id', locationId)
    if (categoryId) query = query.eq('category_id', categoryId)

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get single post
  async getPost(postId) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*),
        category:categories(*),
        location:locations(*)
      `)
      .eq('id', postId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Update post status (admin function)
  async updatePostStatus(postId, status, expiresAt = null) {
    const updateData = { status }
    if (status === 'approved' && expiresAt) {
      updateData.expires_at = expiresAt
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()

    if (error) throw error
    return data?.[0]
  }
}

// Conversation utilities
export const conversationService = {
  // Get user's conversations for inbox
  async getUserConversations(userId) {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation:conversations(
          *,
          post:posts(id, title, author:profiles(full_name)),
          participants:conversation_participants(
            user:profiles(id, full_name, avatar_url)
          )
        )
      `)
      .eq('user_id', userId)
      .order('conversation.last_message_at', { ascending: false, nullsFirst: false })

    if (error) throw error
    return data?.map(item => item.conversation)
  },

  // Create or get existing conversation for a post
  async getOrCreateConversation(postId, userId, otherUserId) {
    // First, try to find existing conversation
    const { data: existingConv, error: searchError } = await supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(user_id)
      `)
      .eq('post_id', postId)

    if (searchError) throw searchError

    // Find conversation that includes both users
    const conversation = existingConv?.find(conv => {
      const userIds = conv.participants.map(p => p.user_id)
      return userIds.includes(userId) && userIds.includes(otherUserId)
    })

    if (conversation) {
      return conversation
    }

    // Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({ post_id: postId })
      .select()
      .single()

    if (createError) throw createError

    // Add participants
    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConv.id, user_id: userId },
        { conversation_id: newConv.id, user_id: otherUserId }
      ])

    if (participantError) throw participantError

    return newConv
  }
}

// Message utilities
export const messageService = {
  // Get messages for a conversation
  async getMessages(conversationId, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(id, full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Send a message
  async sendMessage(conversationId, senderId, content) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content
      })
      .select(`
        *,
        sender:profiles(id, full_name, avatar_url)
      `)

    if (error) throw error

    // Update conversation's last message info
    await supabase
      .from('conversations')
      .update({
        last_message_content: content,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    return data?.[0]
  },

  // Subscribe to new messages in a conversation
  subscribeToMessages(conversationId, callback) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe()
  }
}