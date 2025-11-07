import React, { createContext, useContext, useState } from 'react'

import { allGroupsData as groupData } from '../root/Pages/Left side/LeftGroupChat/groupData'


const AllinfoContext = createContext()
const AllContext = ({ children }) => {

    console.log("All context");
    const [allMessages, setAllMessages] = useState([])
    const [userInfo, setUserInfo] = useState(null)
    const [isAuth, setIsAuth] = useState(false)
    const [selectedUser, setSelectedUser] = useState({})
    const [isOnline, setIsOnline] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState({})
    const [allGroupsData, setAllGroupsData] = useState(groupData)
    const [connected_to, setConnected_to] = useState({})
    const [joined_groupsInfo, setJoined_groupsInfo] = useState({})

    const [mediaUploading, setMediaUploading] = useState(false)

    const value = {
        allMessages,
        setAllMessages,
        userInfo,//who is logged in
        setUserInfo,
        isAuth,
        setIsAuth,
        selectedUser, //user to chat
        setSelectedUser,
        isOnline,
        setIsOnline,
        mediaUploading,
        setMediaUploading,
        selectedGroup,
        setSelectedGroup,
        allGroupsData,
        setAllGroupsData,
        connected_to,
        setConnected_to,
        joined_groupsInfo,
        setJoined_groupsInfo
    }

    return (
        <AllinfoContext.Provider value={value}>
            {children}
        </AllinfoContext.Provider>
    )
}

export default AllContext
export const useAllContext = () => useContext(AllinfoContext)