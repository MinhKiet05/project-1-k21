// hooks/useMessages.js
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

export const useMessages = (conversationId) => {
    const { user } = useUser();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const LIMIT = 20;

    useEffect(() => {
        if (conversationId && user?.id) {
            // Reset state when conversation changes
            setMessages([]);
            setOffset(0);
            setHasMore(true);
            fetchMessages();
            
            // Subscribe to real-time messages for this conversation
            const subscription = supabase
                .channel(`messages:${conversationId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                }, handleNewMessage)
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [conversationId, user?.id]);

    const fetchMessages = async (isLoadingMore = false) => {
        try {
            if (isLoadingMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setOffset(0);
            }
            
            const currentOffset = isLoadingMore ? offset : 0;
            
            // Get messages with pagination, ordered DESC to get latest first
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    id,
                    content,
                    sender_id,
                    created_at,
                    profiles (
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false })
                .range(currentOffset, currentOffset + LIMIT - 1);

            if (error) throw error;

            const newMessages = data || [];
            
            // Check if we have more messages
            setHasMore(newMessages.length === LIMIT);

            if (isLoadingMore) {
                // For loading more (scroll up), prepend older messages
                setMessages(prev => [...newMessages.reverse(), ...prev]);
                setOffset(currentOffset + LIMIT);
            } else {
                // For initial load, reverse to show oldest first
                setMessages(newMessages.reverse());
                setOffset(LIMIT);
            }
        } catch (error) {
            // Error fetching messages
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleNewMessage = async (payload) => {
        // Thêm tin nhắn mới vào local state thay vì refetch tất cả
        const newMessage = payload.new;
        
        // Fetch thông tin profile của sender
        const { data: profileData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();
        
        const messageWithProfile = {
            ...newMessage,
            profiles: profileData
        };
        
        setMessages(prevMessages => {
            // Kiểm tra xem message đã tồn tại chưa để tránh duplicate
            const exists = prevMessages.some(msg => msg.id === newMessage.id);
            if (exists) return prevMessages;
            
            // Thêm tin nhắn mới và sắp xếp theo thời gian
            return [...prevMessages, messageWithProfile].sort((a, b) => 
                new Date(a.created_at) - new Date(b.created_at)
            );
        });
    };

    const sendMessage = useCallback(async (content) => {
        try {
            if (!content.trim()) return;

            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content: content.trim()
                })
                .select(`
                    id,
                    content,
                    sender_id,
                    created_at,
                    profiles (
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .single();

            if (error) throw error;

            // Update conversation's last message
            await supabase
                .from('conversations')
                .update({
                    last_message_content: content.trim(),
                    last_message_at: new Date().toISOString()
                })
                .eq('id', conversationId);

            return data;
        } catch (error) {
            throw error;
        }
    }, [conversationId, user?.id]);

    const loadMoreMessages = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchMessages(true);
        }
    }, [loadingMore, hasMore, offset]);

    return {
        messages,
        loading,
        loadingMore,
        hasMore,
        sendMessage,
        refetch: fetchMessages,
        loadMore: loadMoreMessages
    };
};