import React, { createContext, useContext, useState } from 'react'

const hydrateGroups = (groups, users) => {
    if (!groups || !users) return [];
    return groups.map(group => ({
        ...group,
        groupMembers: group.groupMembers ? group.groupMembers.map(member => {
            const userDetails = users.find(u => u.userId === member.userId);
            return userDetails ? { ...member, ...userDetails } : member;
        }) : [],
        groupJoinRequests: group.groupJoinRequests ? group.groupJoinRequests.map(req => {
            const userDetails = users.find(u => u.userId === req.userId);
            return userDetails ? { ...req, ...userDetails } : req;
        }) : []
    }));
};

const AllinfoContext = createContext()
const AllContext = ({ children }) => {

    console.log("All context");
    const [allMessages, setAllMessages] = useState([])
    const [userInfo, setUserInfo] = useState(null)
    const [isAuth, setIsAuth] = useState(false)
    const [selectedUser, setSelectedUser] = useState({})
    const [isOnline, setIsOnline] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState({})
    const [allGroupsData, setAllGroupsData] = useState([])
    const [allUserInfo, setAllUserInfo] = useState([])
    const [connected_to, setConnected_to] = useState([])
    const [joined_groupsInfo, setJoined_groupsInfo] = useState([])

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, groupsRes] = await Promise.all([
                    fetch('/api/users'),
                    fetch('/api/groups')
                ]);
                const users = await usersRes.json();
                const groups = await groupsRes.json();

                setAllUserInfo(users);
                setAllGroupsData(hydrateGroups(groups, users));

                // Mock Auto-Login for User 1 (Akash) to restore dev state
                const currentUser = users.find(u => u.userId === 1);
                if (currentUser) {
                    setUserInfo(currentUser);
                    setConnected_to(currentUser.connected_to || []);
                    setJoined_groupsInfo(currentUser.joined_groups || []); // Assuming joined_groups exists
                    setIsAuth(true);
                }

            } catch (err) {
                console.error("Failed to fetch data from Backend API. Ensure server is running on port 4000.", err);
            }
        };
        fetchData();
    }, []);

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
        setJoined_groupsInfo,
        allUserInfo // Expose fetching user info
    }

    return (
        <AllinfoContext.Provider value={value}>
            {children}
        </AllinfoContext.Provider>
    )
}

export default AllContext
export const useAllContext = () => useContext(AllinfoContext)