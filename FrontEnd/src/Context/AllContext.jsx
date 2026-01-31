import React, { createContext, useContext, useState, useEffect } from 'react'
import { socket } from '../services/socket.service';
import { useGroupJoinRequests, useUserConnection } from '../hooks';

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
                const hydratedGroups = hydrateGroups(groups, users);
                setAllGroupsData(hydratedGroups);

                // Auto-login disabled - user must select via ModalSelectUser
                // Uncomment below to enable auto-login for development:
                /*
                const currentUser = users.find(u => u.userId === 1);
                if (currentUser) {
                    setUserInfo(currentUser);
                    const connectedUsers = currentUser.connected_to || [];
                    setConnected_to(connectedUsers);
                    const joinedGroupIds = currentUser.joined_groups || [];
                    const joinedGroups = hydratedGroups.filter(g => joinedGroupIds.includes(g.groupId));
                    setJoined_groupsInfo(joinedGroups);
                    setIsAuth(true);
                    try {
                        socket.emit('register', { userId: currentUser.userId });
                    } catch (error) {
                        console.error('Failed to register socket for auto-login:', error);
                    }
                }
                */

            } catch (err) {
                console.error("Failed to fetch data from Backend API. Ensure server is running on port 4000.", err);
            }
        };
        fetchData();
    }, []);

    // Socket event listener for auto-logged user
    useEffect(() => {
        if (!userInfo?.userId) return;

        const handleGetLoggedInUserInfo = ({ userInfo: updatedUser, connected_to: connectedUsers, joined_groupsInfo: joinedGroups }) => {
            try {
                if (updatedUser) setUserInfo(updatedUser);
                if (connectedUsers) setConnected_to(connectedUsers);
                if (joinedGroups) setJoined_groupsInfo(joinedGroups);
            } catch (error) {
                console.error('Error handling socket user info:', error);
            }
        };

        socket.on('getLoggedInUserInfo', handleGetLoggedInUserInfo);

        return () => {
            socket.off('getLoggedInUserInfo', handleGetLoggedInUserInfo);
        };
    }, [userInfo?.userId]);

    // Handle group join requests real-time updates
    useGroupJoinRequests(setAllGroupsData, setJoined_groupsInfo, userInfo, setUserInfo, selectedGroup, setSelectedGroup);

    // Handle auto-connection when users message each other
    useUserConnection(setConnected_to);

    // Handle group updates
    useEffect(() => {
        const handleGroupUpdated = ({ groupId, updates }) => {
            console.log('[Group Updated] Updating group in UI:', groupId, updates);
            
            // Update in allGroupsData
            setAllGroupsData(prev => (prev || []).map(g => 
                g.groupId === groupId ? { ...g, ...updates } : g
            ));
            
            // Update in joined_groupsInfo
            setJoined_groupsInfo(prev => (prev || []).map(g => 
                g.groupId === groupId ? { ...g, ...updates } : g
            ));
            
            // Update selectedGroup if it's the updated one
            setSelectedGroup(prev => {
                if (prev?.groupId === groupId) {
                    return { ...prev, ...updates };
                }
                return prev || {};
            });
        };

        socket.on('groupUpdated', handleGroupUpdated);

        return () => {
            socket.off('groupUpdated', handleGroupUpdated);
        };
    }, []);

    // Handle group deletion
    useEffect(() => {
        const handleGroupDeleted = ({ groupId, groupName }) => {
            console.log('[Group Deleted] Removing group from UI:', groupId, groupName);
            
            // Remove from allGroupsData
            setAllGroupsData(prev => (prev || []).filter(g => g.groupId !== groupId));
            
            // Remove from joined_groupsInfo
            setJoined_groupsInfo(prev => (prev || []).filter(g => g.groupId !== groupId));
            
            // Clear selectedGroup if it's the deleted one
            setSelectedGroup(prev => {
                if (prev?.groupId === groupId) {
                    return {};
                }
                return prev || {};
            });
        };

        socket.on('groupDeleted', handleGroupDeleted);

        return () => {
            socket.off('groupDeleted', handleGroupDeleted);
        };
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