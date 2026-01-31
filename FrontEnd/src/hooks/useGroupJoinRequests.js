import { useEffect } from 'react';
import { socket } from '../services/socket.service';

/**
 * Custom hook to handle real-time group join request updates
 * Listens for join request approvals, rejections, and updates
 * 
 * @param {Function} setAllGroupsData - Update function for all groups data
 * @param {Function} setJoined_groupsInfo - Update function for joined groups
 * @param {Object} userInfo - Current logged in user info
 * @param {Function} setUserInfo - Update function for user info
 * @param {Object} selectedGroup - Currently selected group
 * @param {Function} setSelectedGroup - Update function for selected group
 */
export const useGroupJoinRequests = (setAllGroupsData, setJoined_groupsInfo, userInfo, setUserInfo, selectedGroup, setSelectedGroup) => {
    useEffect(() => {
        if (!userInfo?.userId) {
            console.log('[useGroupJoinRequests] Hook mounted but no userInfo, skipping');
            return;
        }

        console.log('[useGroupJoinRequests] Hook mounted, registering socket listeners for user:', userInfo.userId);
        console.log('[useGroupJoinRequests] Socket connected:', socket.connected);

        // Handle when user's join request is approved
        const handleJoinRequestApproved = ({ groupId, groupInfo }) => {
            console.log('[useGroupJoinRequests] JOIN REQUEST APPROVED:', { groupId, groupName: groupInfo?.groupName });
            
            // Add group to joined groups
            setJoined_groupsInfo((prev) => {
                // Check if group already exists
                const exists = prev.find(g => g.groupId === groupId);
                if (exists) {
                    console.log('[useGroupJoinRequests] Group already in joined list');
                    return prev;
                }
                console.log('[useGroupJoinRequests] Adding group to joined list');
                return [...prev, groupInfo];
            });

            // Update allGroupsData to reflect membership
            setAllGroupsData((prev) => prev.map((g) => {
                if (g.groupId === groupId) {
                    console.log('[useGroupJoinRequests] Updating group in allGroupsData');
                    return {
                        ...g,
                        groupMembers: groupInfo.groupMembers,
                        groupJoinRequests: groupInfo.groupJoinRequests
                    };
                }
                return g;
            }));

            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Join Request Approved', {
                    body: `You have been added to ${groupInfo.groupName}`,
                    icon: groupInfo.groupImage
                });
            }
        };

        // Handle when user's join request is rejected
        const handleJoinRequestRejected = ({ groupId }) => {
            // Remove from join requests in UI
            setAllGroupsData((prev) => prev.map((g) => {
                if (g.groupId === groupId) {
                    return {
                        ...g,
                        groupJoinRequests: g.groupJoinRequests.filter(
                            req => req.userId !== userInfo.userId
                        )
                    };
                }
                return g;
            }));

            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Join Request Rejected', {
                    body: `Your request to join the group was declined`
                });
            }
        };

        // Handle join request updates (for admins and group members)
        const handleGroupJoinRequestUpdate = ({ groupId, joinRequests }) => {
            console.log('[useGroupJoinRequests] Received groupJoinRequestUpdate:', { groupId, requestCount: joinRequests.length });
            setAllGroupsData((prev) => prev.map((g) => {
                if (g.groupId === groupId) {
                    return { ...g, groupJoinRequests: joinRequests };
                }
                return g;
            }));

            // Update joined_groupsInfo if this group is in there
            setJoined_groupsInfo((prev) => prev.map((g) => {
                if (g.groupId === groupId) {
                    return { ...g, groupJoinRequests: joinRequests };
                }
                return g;
            }));
        };

        // Handle group member updates (when someone joins or leaves)
        const handleGroupMemberUpdate = ({ groupId, members, joinRequests }) => {
            console.log('[useGroupJoinRequests] GROUP MEMBER UPDATE:', { 
                groupId, 
                memberCount: members.length, 
                requestCount: joinRequests.length 
            });
            
            setAllGroupsData((prev) => prev.map((g) => {
                if (g.groupId === groupId) {
                    console.log('[useGroupJoinRequests] Updating group in allGroupsData');
                    return {
                        ...g,
                        groupMembers: members,
                        groupJoinRequests: joinRequests
                    };
                }
                return g;
            }));

            // Update joined_groupsInfo
            setJoined_groupsInfo((prev) => prev.map((g) => {
                if (g.groupId === groupId) {
                    console.log('[useGroupJoinRequests] Updating group in joined_groupsInfo');
                    return {
                        ...g,
                        groupMembers: members,
                        groupJoinRequests: joinRequests
                    };
                }
                return g;
            }));
        };

        // Handle when user sends a join request (confirmation)
        const handleJoinRequestSent = ({ groupId, status }) => {
            // Already handled optimistically in UI, this is just confirmation
            console.log(`Join request sent for group ${groupId} with status: ${status}`);
        };

        // Handle when user cancels a join request (confirmation)
        const handleJoinRequestCanceled = ({ groupId }) => {
            // Already handled optimistically in UI, this is just confirmation
            console.log(`Join request canceled for group ${groupId}`);
        };

        // Handle when user leaves a group (voluntarily)
        const handleLeftGroup = ({ groupId, groupName }) => {
            console.log(`[useGroupJoinRequests] ========== LEFT GROUP EVENT RECEIVED ==========`);
            console.log(`[useGroupJoinRequests] Left group ${groupId} - ${groupName}`);
            
            // Clear selectedGroup if it's the group being left
            if (selectedGroup?.groupId === groupId) {
                console.log(`[useGroupJoinRequests] Clearing selected group as it's being left`);
                setSelectedGroup({});
            }
            
            // Remove from joined_groupsInfo
            setJoined_groupsInfo((prev) => {
                console.log(`[useGroupJoinRequests] Before filter - groups:`, prev.length);
                const newGroups = prev.filter(g => g.groupId !== groupId);
                console.log(`[useGroupJoinRequests] After filter - groups:`, newGroups.length);
                console.log(`[useGroupJoinRequests] New groups:`, newGroups.map(g => g.groupName));
                return newGroups;
            });

            // Also update userInfo.joined_groups
            if (setUserInfo && userInfo) {
                setUserInfo(prev => {
                    if (!prev) return prev;
                    const updatedJoinedGroups = prev.joined_groups.filter(gId => gId !== groupId);
                    console.log(`[useGroupJoinRequests] Updated userInfo.joined_groups from ${prev.joined_groups.length} to ${updatedJoinedGroups.length}`);
                    return {
                        ...prev,
                        joined_groups: updatedJoinedGroups
                    };
                });
            }

            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Left Group', {
                    body: `You have left ${groupName}`
                });
            }
            
            console.log(`[useGroupJoinRequests] ========== LEFT GROUP HANDLED ==========`);
        };

        // Handle when user is removed from a group (by admin)
        const handleRemovedFromGroup = ({ groupId, groupName, removedBy }) => {
            console.log(`[useGroupJoinRequests] ========== REMOVED FROM GROUP EVENT RECEIVED ==========`);
            console.log(`[useGroupJoinRequests] Removed from group ${groupId} - ${groupName} by admin ${removedBy}`);
            
            // Clear selectedGroup if it's the group being removed from
            if (selectedGroup?.groupId === groupId) {
                console.log(`[useGroupJoinRequests] Clearing selected group as user was removed`);
                setSelectedGroup({});
            }
            
            // Remove from joined_groupsInfo
            setJoined_groupsInfo((prev) => {
                console.log(`[useGroupJoinRequests] Before filter - groups:`, prev.length);
                const newGroups = prev.filter(g => g.groupId !== groupId);
                console.log(`[useGroupJoinRequests] After filter - groups:`, newGroups.length);
                return newGroups;
            });

            // Also update userInfo.joined_groups
            if (setUserInfo && userInfo) {
                setUserInfo(prev => {
                    if (!prev) return prev;
                    const updatedJoinedGroups = prev.joined_groups.filter(gId => gId !== groupId);
                    console.log(`[useGroupJoinRequests] Updated userInfo.joined_groups from ${prev.joined_groups.length} to ${updatedJoinedGroups.length}`);
                    return {
                        ...prev,
                        joined_groups: updatedJoinedGroups
                    };
                });
            }

            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Removed from Group', {
                    body: `You have been removed from ${groupName}`
                });
            }
            
            console.log(`[useGroupJoinRequests] ========== REMOVED FROM GROUP HANDLED ==========`);
        };

        // Register all event listeners
        socket.on('joinRequestApproved', handleJoinRequestApproved);
        socket.on('joinRequestRejected', handleJoinRequestRejected);
        socket.on('groupJoinRequestUpdate', handleGroupJoinRequestUpdate);
        socket.on('groupMemberUpdate', handleGroupMemberUpdate);
        socket.on('joinRequestSent', handleJoinRequestSent);
        socket.on('joinRequestCanceled', handleJoinRequestCanceled);
        socket.on('leftGroup', handleLeftGroup);
        socket.on('removedFromGroup', handleRemovedFromGroup);

        console.log('[useGroupJoinRequests] All 8 socket listeners registered');

        // Cleanup function
        return () => {
            console.log('[useGroupJoinRequests] Cleaning up socket listeners');
            socket.off('joinRequestApproved', handleJoinRequestApproved);
            socket.off('joinRequestRejected', handleJoinRequestRejected);
            socket.off('groupJoinRequestUpdate', handleGroupJoinRequestUpdate);
            socket.off('groupMemberUpdate', handleGroupMemberUpdate);
            socket.off('joinRequestSent', handleJoinRequestSent);
            socket.off('joinRequestCanceled', handleJoinRequestCanceled);
            socket.off('leftGroup', handleLeftGroup);
            socket.off('removedFromGroup', handleRemovedFromGroup);
        };
    }, [userInfo?.userId, setAllGroupsData, setJoined_groupsInfo, setUserInfo, selectedGroup, setSelectedGroup]);
};
