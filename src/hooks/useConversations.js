// hooks/useConversations.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

export const useConversations = () => {
    const { user } = useUser();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchingRef = useRef(false);

    useEffect(() => {
        if (user?.id) {
            fetchConversations();
            
            // Subscribe to real-time updates
            const subscription = supabase
                .channel('conversations')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'conversations'
                }, handleConversationChange)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public', 
                    table: 'messages'
                }, handleMessageChange)
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user?.id]);

    const fetchConversations = useCallback(async () => {
        if (fetchingRef.current || !user?.id) return;
        
        try {
            fetchingRef.current = true;
            setLoading(true);
            
            const { data, error } = await supabase
                .from('conversation_participants')
                .select(`
                    conversation_id,
                    conversations (
                        id,
                        post_id,
                        last_message_content,
                        last_message_at,
                        posts (
                            id,
                            title,
                            image_urls,
                            author_id
                        )
                    )
                `)
                .eq('user_id', user.id);

            if (error) throw error;

            // Get other participants for each conversation
            const conversationsWithParticipants = await Promise.all(
                (data || []).map(async (item) => {
                    const conversation = item.conversations;
                    
                    // Get other participant (not current user)
                    const { data: participants } = await supabase
                        .from('conversation_participants')
                        .select(`
                            user_id,
                            profiles (
                                id,
                                full_name,
                                avatar_url
                            )
                        `)
                        .eq('conversation_id', conversation.id)
                        .neq('user_id', user.id);

                    return {
                        ...conversation,
                        otherParticipant: participants?.[0]?.profiles || null
                    };
                })
            );

            // Sort by last message time
            conversationsWithParticipants.sort((a, b) => {
                const timeA = a.last_message_at ? new Date(a.last_message_at) : new Date(0);
                const timeB = b.last_message_at ? new Date(b.last_message_at) : new Date(0);
                return timeB - timeA;
            });

            setConversations(conversationsWithParticipants);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [user?.id]);

    const handleConversationChange = useCallback((payload) => {
        console.log('Conversation changed:', payload);
        
        // Chỉ refetch khi có conversation mới được tạo
        if (payload.eventType === 'INSERT') {
            // Delay 1s để đảm bảo participants đã được insert
            setTimeout(() => {
                if (!fetchingRef.current) {
                    fetchConversations();
                }
            }, 1000);
        }
        // Không cần refetch cho UPDATE hoặc DELETE
    }, [fetchConversations]);

    const handleMessageChange = useCallback((payload) => {
        console.log('Message changed:', payload);
        
        if (payload.eventType === 'INSERT') {
            const { conversation_id, content, created_at, sender_id } = payload.new;
            
            setConversations(prevConversations => {
                // Update conversation với tin nhắn mới
                const updatedConversations = prevConversations.map(conv => 
                    conv.id === conversation_id 
                        ? { 
                            ...conv, 
                            last_message_content: content,
                            last_message_at: created_at || new Date().toISOString()
                          }
                        : conv
                );
                
                // Sắp xếp lại theo thứ tự thời gian (conversation mới nhất lên đầu)
                return updatedConversations.sort((a, b) => {
                    const timeA = a.last_message_at ? new Date(a.last_message_at) : new Date(0);
                    const timeB = b.last_message_at ? new Date(b.last_message_at) : new Date(0);
                    return timeB - timeA;
                });
            });
        }
    }, []);

    const createOrFindConversation = async (postId, otherUserId) => {
        try {
            // Check if conversation already exists
            const { data: existingConversations } = await supabase
                .from('conversations')
                .select(`
                    id,
                    conversation_participants!inner (user_id)
                `)
                .eq('post_id', postId);

            // Find conversation that includes both current user and other user
            for (const conv of existingConversations || []) {
                const participants = conv.conversation_participants.map(p => p.user_id);
                if (participants.includes(user.id) && participants.includes(otherUserId)) {
                    return conv.id;
                }
            }

            // Create new conversation if none exists
            const { data: newConversation, error: convError } = await supabase
                .from('conversations')
                .insert({
                    post_id: postId
                })
                .select('id')
                .single();

            if (convError) throw convError;

            // Add participants
            const { error: participantError } = await supabase
                .from('conversation_participants')
                .insert([
                    { conversation_id: newConversation.id, user_id: user.id },
                    { conversation_id: newConversation.id, user_id: otherUserId }
                ]);

            if (participantError) throw participantError;

            await fetchConversations();
            return newConversation.id;
        } catch (error) {
            console.error('Error creating/finding conversation:', error);
            throw error;
        }
    };

    return {
        conversations,
        loading,
        createOrFindConversation,
        refetch: fetchConversations
    };
};