import React, { createContext, useContext, useRef, useState, useCallback } from 'react'


const RightInfoContext = createContext()
const RightContext = ({ children }) => {

    const parentRef = useRef(null);
    const childRefsMap = useRef(new Map()); // Use Map for better memory management
    const [selectedChatToChangBg, setSelectedChatToChangBg] = useState(null)

    const [msgToReply, setMsgToReply] = useState(null)

    const [selectedMsg , setSelectedMsg] = useState([])
    const [isMsgSelected ,  setIsMsgSelected] = useState(false)

    const MsgAreaDivRef = useRef(null);

    // Helper to set ref callback for messages
    const setMessageRef = useCallback((msgId, element) => {
        if (element) {
            childRefsMap.current.set(msgId, element);
        } else {
            childRefsMap.current.delete(msgId);
        }
    }, []);

    // Helper to get ref for scrolling
    const getMessageRef = useCallback((msgId) => {
        return childRefsMap.current.get(msgId);
    }, []);


    const value = {
        parentRef,
        childRefsMap,
        setMessageRef,
        getMessageRef,
        selectedChatToChangBg,
        setSelectedChatToChangBg,
        msgToReply,
        setMsgToReply,
        MsgAreaDivRef,
        selectedMsg,
        setSelectedMsg,
        isMsgSelected,
        setIsMsgSelected

    }

    return (
        <RightInfoContext.Provider value={value}>
            {children}
        </RightInfoContext.Provider>
    )
}

export default RightContext
export const useRightContext = () => useContext(RightInfoContext)