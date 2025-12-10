// Utility to clean up duplicate conversations
import { supabase } from '../lib/supabase';

export const cleanupDuplicateConversations = async (userId) => {
  try {
    // Get all conversations for this user
    const { data: userConversations } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner (
          id,
          created_at,
          conversation_participants (user_id)
        )
      `)
      .eq('user_id', userId);

    // Group conversations by participants
    const conversationGroups = new Map();
    
    userConversations?.forEach(conv => {
      const participants = conv.conversations.conversation_participants
        .map(p => p.user_id)
        .sort()
        .join(',');
      
      if (!conversationGroups.has(participants)) {
        conversationGroups.set(participants, []);
      }
      
      conversationGroups.get(participants).push({
        id: conv.conversation_id,
        created_at: conv.conversations.created_at
      });
    });

    // Find and merge duplicates
    for (const [participants, conversations] of conversationGroups) {
      if (conversations.length > 1) {
        // Sort by created_at, keep the oldest
        conversations.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        const keepConversation = conversations[0];
        const duplicateConversations = conversations.slice(1);
        
        // Move all messages from duplicates to the main conversation
        for (const dupConv of duplicateConversations) {
          // Move messages
          const { error: moveError } = await supabase
            .from('messages')
            .update({ conversation_id: keepConversation.id })
            .eq('conversation_id', dupConv.id);
          
          if (moveError) {
            console.error('Error moving messages:', moveError);
            continue;
          }

          // Delete duplicate conversation participants
          await supabase
            .from('conversation_participants')
            .delete()
            .eq('conversation_id', dupConv.id);

          // Delete duplicate conversation
          await supabase
            .from('conversations')
            .delete()
            .eq('id', dupConv.id);
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error cleaning up duplicate conversations:', error);
    return { success: false, error };
  }
};