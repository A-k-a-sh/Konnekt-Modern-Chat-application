import React, { useState, useMemo } from 'react';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import { useAllContext } from '../Context/AllContext';
import { socket } from '../services/socket.service';

export default function ModalAddMembers({ isOpen, onClose, currentGroup }) {
    const { userInfo, connected_to } = useAllContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get users who are connected but not in the group
    const availableUsers = useMemo(() => {
        if (!currentGroup?.groupMembers || !connected_to) return [];
        
        const groupMemberIds = currentGroup.groupMembers.map(m => m.userId);
        
        return connected_to.filter(user => 
            user.userId !== userInfo.userId && // Exclude current user
            !groupMemberIds.includes(user.userId) // Exclude existing members
        );
    }, [connected_to, currentGroup, userInfo]);

    // Filter users based on search query
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return availableUsers;
        
        const query = searchQuery.toLowerCase();
        return availableUsers.filter(user => 
            user.userName?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
        );
    }, [availableUsers, searchQuery]);

    const handleToggleUser = (user) => {
        setSelectedUsers(prev => {
            const isSelected = prev.some(u => u.userId === user.userId);
            if (isSelected) {
                return prev.filter(u => u.userId !== user.userId);
            } else {
                return [...prev, user];
            }
        });
    };

    const handleAddMembers = () => {
        if (selectedUsers.length === 0) return;

        setLoading(true);

        // Send invitation to each selected user
        selectedUsers.forEach(user => {
            console.log('[Add Members] Sending invitation:', {
                groupId: currentGroup.groupId,
                groupName: currentGroup.groupName,
                userId: user.userId,
                invitedBy: userInfo.userId
            });

            socket.emit('sendGroupInvitation', {
                groupId: currentGroup.groupId,
                groupName: currentGroup.groupName,
                groupImage: currentGroup.groupImage,
                userId: user.userId,
                invitedBy: userInfo.userId,
                invitedByName: userInfo.userName
            });
        });

        setLoading(false);
        setSelectedUsers([]);
        setSearchQuery('');
        onClose();
    };

    const handleClose = () => {
        setSelectedUsers([]);
        setSearchQuery('');
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Sheet
                variant="outlined"
                sx={{
                    width: '90%',
                    maxWidth: 500,
                    borderRadius: 'md',
                    p: 3,
                    boxShadow: 'lg',
                    backgroundColor: '#1a1625',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <ModalClose
                    variant="plain"
                    sx={{
                        m: 1,
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                />

                <Typography
                    component="h2"
                    level="h4"
                    sx={{ 
                        color: 'white',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <i className="fa-solid fa-user-plus text-purple-400"></i>
                    Add Members to {currentGroup?.groupName}
                </Typography>

                {/* Search Bar */}
                <div className='mb-4'>
                    <div className='relative'>
                        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type='text'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder='Search by name or email...'
                            className='w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50'
                        />
                    </div>
                </div>

                {/* Selected Count */}
                {selectedUsers.length > 0 && (
                    <div className='mb-3 px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-between'>
                        <span className='text-sm text-purple-300'>
                            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                        </span>
                        <button
                            onClick={() => setSelectedUsers([])}
                            className='text-xs text-purple-400 hover:text-purple-300'
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {/* Users List */}
                <div className='flex-1 overflow-y-auto space-y-2 mb-4' style={{ maxHeight: 'calc(80vh - 300px)' }}>
                    {filteredUsers.length === 0 ? (
                        <div className='text-center py-8 text-gray-500'>
                            <i className="fa-solid fa-users text-4xl mb-3 opacity-30"></i>
                            <p className='text-sm'>
                                {availableUsers.length === 0 
                                    ? 'All your connections are already in this group'
                                    : 'No users found matching your search'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredUsers.map(user => {
                            const isSelected = selectedUsers.some(u => u.userId === user.userId);
                            
                            return (
                                <div
                                    key={user.userId}
                                    onClick={() => handleToggleUser(user)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-purple-600/20 border-purple-500/50 hover:bg-purple-600/30'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div className='relative'>
                                        <img
                                            src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userName || 'User')}&background=random`}
                                            alt={user.userName}
                                            className='w-12 h-12 rounded-full object-cover'
                                        />
                                        {isSelected && (
                                            <div className='absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center border-2 border-[#1a1625]'>
                                                <i className="fa-solid fa-check text-white text-xs"></i>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-medium text-white truncate'>
                                            {user.userName}
                                        </p>
                                        <p className='text-xs text-gray-400 truncate'>
                                            {user.email || 'No email'}
                                        </p>
                                    </div>

                                    {/* Checkbox */}
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                        isSelected
                                            ? 'bg-purple-500 border-purple-500'
                                            : 'border-gray-500'
                                    }`}>
                                        {isSelected && <i className="fa-solid fa-check text-white text-xs"></i>}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3'>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        sx={{
                            flex: 1,
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddMembers}
                        disabled={selectedUsers.length === 0 || loading}
                        sx={{
                            flex: 1,
                            background: selectedUsers.length === 0 
                                ? 'rgba(139, 92, 246, 0.3)'
                                : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
                            },
                            '&:disabled': {
                                background: 'rgba(139, 92, 246, 0.3)',
                                color: 'rgba(255, 255, 255, 0.4)'
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                Sending...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-paper-plane mr-2"></i>
                                Send Invitation{selectedUsers.length > 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </div>
            </Sheet>
        </Modal>
    );
}
