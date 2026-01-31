import { useEffect } from 'react';
import { socket } from '../services/socket.service';

export const useSocketMessage = (setAllMessages) => {
    useEffect(() => {
        const handleMessage = (messageData) => {
            try {
                const { msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId, forwardFrom } = messageData;

                // Validate required fields (msg can be empty if there are media)
                if (!msgId || !sender) {
                    console.error('Invalid message data received:', messageData);
                    return;
                }

                // Browser notification with error handling
                if ("Notification" in window && msg) {
                    try {
                        if (Notification.permission === "granted") {
                            const notification = new Notification(sender.userName + " : " + msg, {
                                body: "Click to open the chat",
                                tag: sender.userId?.toString() || 'unknown',
                                icon: sender.image || '/default-avatar.png'
                            });

                            notification.onclick = () => {
                                window.focus();
                                window.location.href = '/';
                            };
                        } else if (Notification.permission !== "denied") {
                            Notification.requestPermission().catch(error => {
                                console.error('Notification permission error:', error);
                            });
                        }
                    } catch (notifError) {
                        console.error('Notification error:', notifError);
                    }
                }

                setAllMessages((prevMessages) => {
                    // Prevent duplicate messages
                    const isDuplicate = prevMessages.some(m => m.msgId === msgId);
                    if (isDuplicate) {
                        console.warn('Duplicate message detected:', msgId);
                        return prevMessages;
                    }

                    return [...prevMessages, {
                        msgId: msgId,
                        sender: sender,
                        receiver: receiver,
                        msg: msg,
                        mediaLinks: mediaLinks || [],
                        reply: reply || null,
                        time: time,
                        chatType: chatType,
                        groupId: groupId,
                        forwardFrom: forwardFrom
                    }];
                });
            } catch (error) {
                console.error('Error handling received message:', error, messageData);
            }
        };

        socket.on('receivedMessage', handleMessage);

        return () => {
            socket.off('receivedMessage', handleMessage);
        };
    }, [setAllMessages]);
};
