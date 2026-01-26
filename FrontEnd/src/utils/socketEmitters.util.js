import { socket } from '../services/socket.service';

export const deleteMsg = (msg) => {
    socket.emit('deleteMessage', msg);
};

export const editMsg = (msg) => {
    socket.emit('editMessage', msg);
};

export const handleSubmit = (e, outgoingMsg, selectedUser, userInfo, media, msgToReply, selectedGroup, forwardFrom) => {
    e.preventDefault();

    const createdAt = new Date().toISOString();
    let chatType;
    let groupId;

    if (Object.keys(selectedGroup).length > 0) {
        chatType = 'group';
        groupId = selectedGroup.groupId;
    } else {
        chatType = 'private';
        groupId = null;
    }

    socket.emit('message', {
        sender: userInfo,
        receiver: selectedUser,
        msg: outgoingMsg,
        mediaLinks: media,
        reply: msgToReply,
        time: createdAt,
        chatType: chatType,
        groupId: groupId,
        forwardFrom: forwardFrom
    });
};

export const delSelectedMsg = (selectedMsg, setAllMessages, curUserInfo, selectedGroup, selectedUser) => {
    let chatType;
    let groupId;
    
    if (Object.keys(selectedGroup).length > 0) {
        chatType = 'group';
        groupId = selectedGroup.groupId;
    } else {
        chatType = 'private';
        groupId = null;
    }

    socket.emit('delSelectedMsg', {
        selectedMsg,
        curUserInfo,
        selectedUser,
        chatType,
        groupId
    });

    // Remove from sender's local state immediately
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
