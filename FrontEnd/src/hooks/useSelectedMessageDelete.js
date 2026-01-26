import { useEffect } from 'react';
import { socket } from '../services/socket.service';

export const useSelectedMessageDelete = (selectedMsg, setAllMessages) => {
    useEffect(() => {
        const handleDelSelectedMsg = (selectedMsg) => {
            setAllMessages((prev) => {
                const msgIdsToRemove = new Set(selectedMsg.map(msg => msg.msgId));
                let updatedMessages = prev.filter(m => !msgIdsToRemove.has(m.msgId));

                updatedMessages = updatedMessages.map(m => {
                    if (m.reply && msgIdsToRemove.has(m.reply.msgId)) {
                        return { ...m, reply: null };
                    }
                    return m;
                });

                return updatedMessages;
            });
        };

        socket.on('delSelectedMsg', handleDelSelectedMsg);
        
        return () => {
            socket.off('delSelectedMsg', handleDelSelectedMsg);
        };
    }, [selectedMsg, setAllMessages]);
};
