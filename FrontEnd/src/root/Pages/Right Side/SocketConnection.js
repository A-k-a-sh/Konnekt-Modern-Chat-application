import { useEffect } from 'react';
import { io } from 'socket.io-client'



export const socket = io('http://localhost:4000')


export const useSocketConnection = (credintials, setUserInfo, setConnected_to, setJoined_groupsInfo) => {
    console.log(credintials);

    useEffect(() => {
        if (!credintials.userId) return; // Prevent registering if curUser is null



        //axis req to send the data of `selectedUser`
        socket.emit('register', credintials);

        //
        socket.on('connect', () => {
            console.log('connected with id :' + socket.id)
        })


        const handleGetLoggedInUserInfo = ({ userInfo, connected_to, joined_groupsInfo }) => {
            // console.log('user info', userInfo);
            // console.log('connected user:' , connected_to);
            // console.log('joined groups:' , joined_groupsInfo);


            setTimeout(() => { //delaying for showing skeleton
                setUserInfo(userInfo);
                setConnected_to(connected_to);
                setJoined_groupsInfo(joined_groupsInfo);
            }, 500)
        }

        socket.on('getLoggedInUserInfo', handleGetLoggedInUserInfo)

        return () => {
            console.log('Socket cleanup on unmount');
            socket.off('connect');
        }
    }, [setUserInfo, credintials.userId])


}


//sending message
export const handleSocketMessage = (setAllMessages) => {

    useEffect(() => {

        const handleMessage = ({ msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId, forwardFrom }) => {

            if ("Notification" in window) {
                if (Notification.permission === "granted") {
                    const notification = new Notification(sender.userName + " : " + msg, {
                        body: "Click to open the chat",
                        //icon: "/chat-icon.png",
                        tag: sender // optional: can prevent duplicate notifications
                    });


                    notification.onclick = () => {
                        window.focus(); // Bring the tab to front if it's in the background

                        // Simulate navigating to that chat (React Router style)
                        window.location.href = '/'; // <-- redirect to User B's chat
                    };

                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            new Notification("Hello, world!");
                        }
                    });
                }
            }

            //sender - who logged in || full obj (see allUserInfo)
            //receiver - to whom user is chatting || full obj

            setAllMessages((prevMessages) => [...prevMessages,
            {
                msgId: msgId,
                sender: sender,
                receiver: receiver,
                message: msg,
                mediaLinks: mediaLinks,
                reply: reply,
                time: time,
                chatType: chatType,
                groupId: groupId,
                forwardFrom: forwardFrom
            }]);
        };

        socket.on('receivedMessage', handleMessage);

        return () => {
            socket.off('receivedMessage', handleMessage);  // Clean up event listener
        };
        // console.log(allMessages);
    }, [])
}


// changes needed
export const clearMessages = (setAllMessages, setImages, selectedUser) => {
    useEffect(() => {
        setAllMessages([])
        setImages([])
    }, [selectedUser])
}


//this is for when a message is deleted , edited or replied
export const useChangeMessage = (setAllMessages) => {
    useEffect(() => {

        //message deleted
        const handleDeleteMessage = (msg) => {
            console.log("Message deleted successfully:", msg);

            setAllMessages((prev) => prev.filter((m) => m.msgId !== msg.msgId));

            setAllMessages((prev) => prev.map((m) => {
                if (m.reply?.msgId === msg.msgId) {
                    return { ...m, reply: null }
                }
                return m
            }))

        };


        socket.on("messageDeleted", handleDeleteMessage);

        //message edited
        const handleEditMessage = (msg) => {
            console.log("Message edited successfully:", msg);

            setAllMessages((prev) =>
                prev.map((m) =>
                    m.msgId === msg.msgId
                        ? { ...m, message: msg.message }  // Update the message
                        : m // Return the original message if not being edited
                )
            );
        }

        socket.on("messageEdited", handleEditMessage);

        return () => {
            socket.off("messageDeleted", handleDeleteMessage);
            socket.off("messageEdited", handleEditMessage);
        };
    }, [setAllMessages]); //bcz when msg deleted , updated ; we change the setAllMessages immediately in frontend || so as it changes this useEffect will run to update the other user through backend
};

export const deleteMsg = (msg) => { //whole msg(obj)

    socket.emit('deleteMessage', msg);
}


export const editMsg = (msg) => { //whole message (obj)

    socket.emit('editMessage', msg);
}

export const replyMsgToSocket = (msgToReply) => { // msgToReply is full object

    socket.emit('replyMessage', msgToReply);
}

export const handleSubmit = (e, outgoingMsg, selectedUser, userInfo, media, msgToReply, selectedGroup, forwardFrom) => {

    // console.log('mediaLinks , ', mediaLinks);
    e.preventDefault()
    // console.log(outgoingMsg);
    console.log('handle submit clicked');
    console.log(outgoingMsg);

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
    })

    //this was to appear the sender message on the left side || now not needed

    // setAllMessages((prevMessages) => [...prevMessages, {
    //     sender: user,
    //     receiver: selectedUser,
    //     message: outgoingMsg,
    //     mediaLinks: media
    // }])

}


//listens to the `isOnline` event || check if user is online or not

export const useIsOnline = (selectedUser, userInfo, setIsOnline) => {
    useEffect(() => {
        socket.emit('isOnline', { selectedUser, userInfo });

        const handleIsOnline = (data) => {
            console.log(`User ${selectedUser.userName} is online:`, data);
            setIsOnline(data);
        };

        //cheking if user is online or not when selecting user to chat
        socket.on('isOnline', handleIsOnline);

        const handleUserStatus = ({ user: updatedUser, isOnline }) => {

            if (updatedUser.userId === selectedUser.userId) {
                setIsOnline(isOnline)
            }
        }

        //if user goes offline or comes online || real time update
        socket.on('userStatus', handleUserStatus);

        // ✅ Cleanup function to prevent duplicate listeners
        return () => {
            socket.off('isOnline', handleIsOnline);
        };
    }, [selectedUser, userInfo]); //  Only re-run when `selectedUser` or `user` changes
};


export const delSelectedMsg = (selectedMsg, setAllMessages, curUserInfo, selectedGroup, selectedUser) => {

    console.log('selected msg deletion function');

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
        // Create a Set of msgIds for faster lookup
        const msgIdsToRemove = new Set(selectedMsg.map(msg => msg.msgId));

        // Filter out messages with those msgIds
        let updatedMessages = prev.filter(m => !msgIdsToRemove.has(m.msgId));

        // Remove replies to those messages
        updatedMessages = updatedMessages.map(m => {
            if (m.reply && msgIdsToRemove.has(m.reply.msgId)) {
                return { ...m, reply: null };
            }
            return m;
        });

        return updatedMessages;
    });





    // // Clear previous listener if it exists
    // socket.off('delSelectedMsg');



};


export const handleSelectedMsg = (selectedMsg, setAllMessages) => {
    useEffect(() => {

        const handleDelSelectedMsg = (selectedMsg) => {
            console.log('handled del msg');

            setAllMessages((prev) => {
                // Create a Set of msgIds for faster lookup
                const msgIdsToRemove = new Set(selectedMsg.map(msg => msg.msgId));

                // Filter out messages with those msgIds
                let updatedMessages = prev.filter(m => !msgIdsToRemove.has(m.msgId));

                // Remove replies to those messages
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
    }, [selectedMsg])
}


