import { useEffect, useRef, useCallback } from 'react';
import { fetchMessageHistory } from '../services/message.service';

/**
 * Custom hook to load message history when selecting a chat
 * @param {Object} params
 * @param {Object} params.selectedUser - Currently selected user for private chat
 * @param {Object} params.selectedGroup - Currently selected group
 * @param {Object} params.userInfo - Current logged-in user info
 * @param {Function} params.setAllMessages - Setter for all messages
 * @param {Array} params.allMessages - Current messages array
 */
export const useMessageHistory = ({ selectedUser, selectedGroup, userInfo, setAllMessages, allMessages }) => {
    const loadingRef = useRef(false);
    const loadedChatsRef = useRef(new Set());

    const loadMessages = useCallback(async (chatType, chatId) => {
        // Prevent duplicate loads
        const chatKey = `${chatType}-${chatId}`;
        if (loadingRef.current || loadedChatsRef.current.has(chatKey)) {
            return;
        }

        loadingRef.current = true;

        try {
            const params = {
                chatType,
                userId: userInfo.userId,
                page: 1,
                limit: 50
            };

            if (chatType === 'private') {
                params.otherUserId = chatId;
            } else {
                params.groupId = chatId;
            }

            console.log('[Message History] Loading messages for:', chatKey);
            const response = await fetchMessageHistory(params);

            if (response.success && response.data.messages.length > 0) {
                // Convert DB format to frontend format
                const formattedMessages = response.data.messages.map(msg => ({
                    msgId: msg.msgId,
                    sender: {
                        userId: msg.senderId,
                        // Will be populated from allUserInfo in component
                    },
                    receiver: msg.receiverId ? {
                        userId: msg.receiverId
                    } : null,
                    msg: msg.msg,
                    mediaLinks: msg.mediaLinks || [],
                    reply: msg.reply || null,
                    time: msg.time,
                    chatType: msg.chatType,
                    groupId: msg.groupId || null,
                    forwardFrom: msg.forwardFrom || null
                }));

                // Merge with existing messages, avoiding duplicates
                setAllMessages(prev => {
                    const existingMsgIds = new Set(prev.map(m => m.msgId));
                    const newMessages = formattedMessages.filter(m => !existingMsgIds.has(m.msgId));
                    return [...newMessages, ...prev];
                });

                console.log(`[Message History] Loaded ${formattedMessages.length} messages`);
                loadedChatsRef.current.add(chatKey);
            }
        } catch (error) {
            console.error('[Message History] Error loading messages:', error);
        } finally {
            loadingRef.current = false;
        }
    }, [userInfo, setAllMessages]);

    // Load messages when selecting a user
    useEffect(() => {
        if (selectedUser && selectedUser.userId && userInfo && userInfo.userId) {
            loadMessages('private', selectedUser.userId);
        }
    }, [selectedUser?.userId, userInfo?.userId, loadMessages]);

    // Load messages when selecting a group
    useEffect(() => {
        if (selectedGroup && selectedGroup.groupId && userInfo && userInfo.userId) {
            loadMessages('group', selectedGroup.groupId);
        }
    }, [selectedGroup?.groupId, userInfo?.userId, loadMessages]);

    return { loadMessages };
};
