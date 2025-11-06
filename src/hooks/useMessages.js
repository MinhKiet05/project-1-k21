// hooks/useMessages.js
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

export const useMessages = (conversationId) => {
    const { user } = useUser();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (conversationId && user?.id) {
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

    const fetchMessages = async () => {
        try {
            setLoading(true);
            
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
                .order('created_at', { ascending: true });

            if (error) throw error;

            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewMessage = async (payload) => {
        console.log('New message:', payload);
        
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
            console.error('Error sending message:', error);
            throw error;
        }
    }, [conversationId, user?.id]);

    return {
        messages,
        loading,
        sendMessage,
        refetch: fetchMessages
    };
};