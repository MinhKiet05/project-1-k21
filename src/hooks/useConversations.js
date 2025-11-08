// hooks/useConversations.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { cleanupDuplicateConversations } from '../utils/conversationUtils';

export const useConversations = (openConversationId = null) => {
    const { user } = useUser();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const fetchingRef = useRef(false);
    const LIMIT = 10;

    useEffect(() => {
        if (user?.id) {
            // Clean up duplicates first, then fetch conversations
            cleanupDuplicateConversations(user.id).then(() => {
                fetchConversations();
            });
            
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

    const fetchConversations = useCallback(async (isLoadingMore = false) => {
        if (fetchingRef.current || !user?.id) return;
        
        try {
            fetchingRef.current = true;
            if (isLoadingMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setOffset(0);
            }
            
            const currentOffset = isLoadingMore ? offset : 0;
            
            // First get conversation IDs with pagination
            const { data: conversationIds, error: idsError } = await supabase
                .from('conversation_participants')
                .select('conversation_id, conversations!inner(last_message_at)')
                .eq('user_id', user.id)
                .order('conversations(last_message_at)', { ascending: false })
                .range(currentOffset, currentOffset + LIMIT - 1);

            if (idsError) throw idsError;

            if (!conversationIds || conversationIds.length === 0) {
                setHasMore(false);
                if (!isLoadingMore) {
                    setConversations([]);
                }
                return;
            }

            // Check if we have more conversations
            setHasMore(conversationIds.length === LIMIT);

            // Get full conversation data
            const { data, error } = await supabase
                .from('conversation_participants')
                .select(`
                    conversation_id,
                    is_seen,
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
                .eq('user_id', user.id)
                .in('conversation_id', conversationIds.map(c => c.conversation_id));

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
                        otherParticipant: participants?.[0]?.profiles || null,
                        is_seen: item.is_seen // Get is_seen from conversation_participants
                    };
                })
            );

            // Sort by last message time
            conversationsWithParticipants.sort((a, b) => {
                const timeA = a.last_message_at ? new Date(a.last_message_at) : new Date(0);
                const timeB = b.last_message_at ? new Date(b.last_message_at) : new Date(0);
                return timeB - timeA;
            });

            if (isLoadingMore) {
                setConversations(prev => [...prev, ...conversationsWithParticipants]);
                setOffset(currentOffset + LIMIT);
            } else {
                setConversations(conversationsWithParticipants);
                setOffset(LIMIT);
            }
        } catch (error) {
            // Error fetching conversations
        } finally {
            setLoading(false);
            setLoadingMore(false);
            fetchingRef.current = false;
        }
    }, [user?.id, offset]);

    const handleConversationChange = useCallback((payload) => {
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

    const handleMessageChange = useCallback(async (payload) => {
        if (payload.eventType === 'INSERT') {
            const { conversation_id, content, created_at, sender_id } = payload.new;
            const isFromOtherUser = sender_id !== user?.id;
            
            // Check if user is currently viewing this conversation
            const isViewingThisConversation = openConversationId === conversation_id;
            const shouldMarkAsUnseen = isFromOtherUser && !isViewingThisConversation;
            
            // Update local state first for immediate UI response
            setConversations(prevConversations => {
                const updatedConversations = prevConversations.map(conv => {
                    if (conv.id === conversation_id) {
                        return { 
                            ...conv, 
                            last_message_content: content,
                            last_message_at: created_at || new Date().toISOString(),
                            is_seen: !shouldMarkAsUnseen // Keep as seen if user is viewing, or if from current user
                        };
                    }
                    return conv;
                });
                
                // Sort by last message time (newest first)
                return updatedConversations.sort((a, b) => {
                    const timeA = a.last_message_at ? new Date(a.last_message_at) : new Date(0);
                    const timeB = b.last_message_at ? new Date(b.last_message_at) : new Date(0);
                    return timeB - timeA;
                });
            });
            
            // Then update database asynchronously (only for messages from others when not viewing)
            if (shouldMarkAsUnseen) {
                try {
                    await supabase
                        .from('conversation_participants')
                        .update({ is_seen: false })
                        .eq('conversation_id', conversation_id)
                        .eq('user_id', user?.id);
                } catch (error) {
                    // Error updating is_seen - could refresh data here if needed
                    console.error('Error updating is_seen:', error);
                }
            }
        }
    }, [user?.id, openConversationId]);

    const createOrFindConversation = async (postId, otherUserId) => {
        try {
            // Check if conversation already exists between these 2 users (regardless of post)
            const { data: existingConversations } = await supabase
                .from('conversations')
                .select(`
                    id,
                    conversation_participants!inner (user_id)
                `);

            // Find conversation that includes both current user and other user
            for (const conv of existingConversations || []) {
                const participants = conv.conversation_participants.map(p => p.user_id);
                if (participants.length === 2 && 
                    participants.includes(user.id) && 
                    participants.includes(otherUserId)) {
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
            throw error;
        }
    };

    const createConversationWithProduct = async (postInfo, otherUserId) => {
        try {
            // First create or find the conversation
            const conversationId = await createOrFindConversation(postInfo.id, otherUserId);
            
            // Check if product message already exists in this conversation
            const { data: existingMessages } = await supabase
                .from('messages')
                .select('id')
                .eq('conversation_id', conversationId)
                .eq('product_id', postInfo.id)
                .eq('message_type', 'product');
            
            // Only send product message if it doesn't exist yet
            if (!existingMessages || existingMessages.length === 0) {
                const productContent = `🛍️ Sản phẩm: ${postInfo.title}\n💰 Giá: ${postInfo.price?.toLocaleString()} VND\n📍 Khu vực: ${postInfo.location}\n\nTôi quan tâm đến sản phẩm này.`;
                
                await supabase
                    .from('messages')
                    .insert({
                        conversation_id: conversationId,
                        sender_id: user.id,
                        content: productContent,
                        message_type: 'product',
                        product_id: postInfo.id
                    });

                // Update conversation's last message
                await supabase
                    .from('conversations')
                    .update({
                        last_message_content: `Sản phẩm: ${postInfo.title}`,
                        last_message_at: new Date().toISOString()
                    })
                    .eq('id', conversationId);
            }
            
            return conversationId;
        } catch (error) {
            throw error;
        }
    };

    const loadMoreConversations = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchConversations(true);
        }
    }, [fetchConversations, loadingMore, hasMore]);

    const markConversationAsSeen = useCallback(async (conversationId) => {
        try {
            // Update local state FIRST for immediate UI response
            setConversations(prev => {
                const updated = prev.map(conv => 
                    conv.id === conversationId 
                        ? { ...conv, is_seen: true }
                        : conv
                );
                return updated;
            });

            // Then update database
            const { error } = await supabase
                .from('conversation_participants')
                .update({ is_seen: true })
                .eq('conversation_id', conversationId)
                .eq('user_id', user?.id);

            if (error) {
                console.error('Error updating is_seen in database:', error);
                // Revert local state if database update failed
                setConversations(prev => 
                    prev.map(conv => 
                        conv.id === conversationId 
                            ? { ...conv, is_seen: false }
                            : conv
                    )
                );
            }
        } catch (error) {
            // Error marking as seen
        }
    }, [user?.id]);

    const markConversationAsUnseen = useCallback(async (conversationId) => {
        try {
            // Update database - conversation_participants table
            await supabase
                .from('conversation_participants')
                .update({ is_seen: false })
                .eq('conversation_id', conversationId)
                .eq('user_id', user?.id);

            // Update local state
            setConversations(prev => 
                prev.map(conv => 
                    conv.id === conversationId 
                        ? { ...conv, is_seen: false }
                        : conv
                )
            );
        } catch (error) {
            // Error marking as unseen
        }
    }, [user?.id]);

    return {
        conversations,
        loading,
        loadingMore,
        hasMore,
        createOrFindConversation,
        createConversationWithProduct,
        refetch: fetchConversations,
        loadMore: loadMoreConversations,
        markConversationAsSeen,
        markConversationAsUnseen
    };
};