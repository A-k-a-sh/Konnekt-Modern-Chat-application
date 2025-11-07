import React, { createContext, useContext, useRef, useState } from 'react'


const RightInfoContext = createContext()
const RightContext = ({ children }) => {

    const parentRef = useRef(null);  //idk
    const childRef = useRef([]) //this for scrolling to the specific message
    const [selectedChatToChangBg, setSelectedChatToChangBg] = useState(null)

    const [msgToReply, setMsgToReply] = useState(null)

    const [selectedMsg , setSelectedMsg] = useState([])
    const [isMsgSelected ,  setIsMsgSelected] = useState(false)

    const MsgAreaDivRef = useRef(null);


    const value = {
        parentRef,
        childRef,
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