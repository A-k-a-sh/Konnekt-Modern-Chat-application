import { useEffect } from 'react';
import { socket } from '../services/socket.service';

export const useChangeMessage = (setAllMessages) => {
    useEffect(() => {
        const handleDeleteMessage = (msg) => {
            setAllMessages((prev) => prev.filter((m) => m.msgId !== msg.msgId));

            setAllMessages((prev) => prev.map((m) => {
                if (m.reply?.msgId === msg.msgId) {
                    return { ...m, reply: null };
                }
                return m;
            }));
        };

        socket.on("messageDeleted", handleDeleteMessage);

        const handleEditMessage = (msg) => {
            setAllMessages((prev) =>
                prev.map((m) =>
                    m.msgId === msg.msgId
                        ? { ...m, message: msg.message }
                        : m
                )
            );
        };

        socket.on("messageEdited", handleEditMessage);

        return () => {
            socket.off("messageDeleted", handleDeleteMessage);
            socket.off("messageEdited", handleEditMessage);
        };
    }, [setAllMessages]);
};
