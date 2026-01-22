import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { useAllContext } from '../Context/AllContext';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';


const socket = io('http://localhost:4000');


export default function ModalSearchGroupOrUser({ modalOpen, setModalOpen, info, name }) {
    const src = 'https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg'
    const [open, setOpen] = React.useState(false);

    const { user: curUser, allGroupsData, setAllGroupsData, userInfo, connected_to, setConnected_to, setSelectedUser, setSelectedGroup, allUserInfo } = useAllContext()

    const [inputFieldVal, setInputFieldVal] = useState('')
    const [allUsers, setAllUsers] = useState([])

    // Fetch all users when modal opens (for user search)
    React.useEffect(() => {
        if (modalOpen && name === 'user') {
            // In a real app, this would be an API call
            // For now, using the backend data structure
            setAllUsers(allUserInfo);
        }
    }, [modalOpen, name]);



    //console.log('in modal:', open);
    const close = () => {
        setOpen(false);
    }
    const handleClick = () => {
        setOpen(false);
        setModalOpen(false)
    };

    useEffect(() => {
        if (modalOpen) {
            setOpen(true)
        }

    }, [modalOpen])



    const isGroupJoined = (grp) => {
        return grp.groupMembers.find((member) => {
            return member.userId === userInfo.userId
        })
    }

    const isInGroupJoinRequest = (grp) => {

        return grp.groupJoinRequests.find((member) => {
            return member.userId === userInfo.userId
        })
    }

    const isUserConnected = (user) => {
        return connected_to?.find((u) => u && u.userId === user.userId);
    }

    const startChatWithUser = (user) => {
        // Add user to connected_to list if not already connected
        if (!isUserConnected(user)) {
            setConnected_to((prev) => [...prev, user]);
        }
        // Select the user to open chat
        setSelectedUser(user);
        setSelectedGroup({});
        // Close modal
        handleClick();
    }


    const wantToJoin = (grp) => {
        const userId = userInfo.userId

        // Update local state
        setAllGroupsData((prev) => prev.map((g) => {
            if (g.groupId === grp.groupId) {
                return { ...g, groupJoinRequests: [...g.groupJoinRequests, { userId }] }
            }
            return g
        }))

        // Emit socket event for backend persistence
        socket.emit('groupJoinRequest', { groupId: grp.groupId, userId });
    }

    const cancelJoinRequest = (grp) => {
        const userId = userInfo.userId

        // Update local state
        setAllGroupsData((prev) => prev.map((g) => {
            if (g.groupId === grp.groupId) {
                return {
                    ...g, groupJoinRequests: g.groupJoinRequests.filter((member) => {
                        return member.userId !== userId
                    })
                }
            }
            return g
        }))

        // Emit socket event for backend persistence
        socket.emit('cancelJoinRequest', { groupId: grp.groupId, userId });
    }

    // Listen for join request updates
    useEffect(() => {
        socket.on('groupJoinRequestUpdate', ({ groupId, joinRequests }) => {
            setAllGroupsData((prev) => prev.map((g) => {
                if (g.groupId === groupId) {
                    return { ...g, groupJoinRequests: joinRequests };
                }
                return g;
            }));
        });

        socket.on('groupMemberUpdate', ({ groupId, members, joinRequests }) => {
            setAllGroupsData((prev) => prev.map((g) => {
                if (g.groupId === groupId) {
                    return { ...g, groupMembers: members, groupJoinRequests: joinRequests };
                }
                return g;
            }));
        });

        return () => {
            socket.off('groupJoinRequestUpdate');
            socket.off('groupMemberUpdate');
        };
    }, []);




    return (
        <React.Fragment>


            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={open}
                onClose={handleClick}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    sx={{
                        borderRadius: '16px',
                        p: 0,
                        boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25)',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        display: 'block',
                        height: 'fit-content',
                        width: 'fit-content',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div className='bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10 px-6 py-4 flex items-center justify-between'>
                        <Typography
                            component="h2"
                            id="modal-title"
                            level="h4"
                            sx={{
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: '1.5rem'
                            }}
                        >
                            <i className="fa-solid fa-magnifying-glass mr-3 text-purple-400"></i>
                            Search {name.toUpperCase()}s
                        </Typography>

                        <button
                            onClick={handleClick}
                            className='w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/50 flex items-center justify-center transition-all duration-200 hover:scale-110 group'
                        >
                            <i className="fa-solid fa-xmark text-gray-400 group-hover:text-red-400 transition-colors"></i>
                        </button>
                    </div>

                    <div
                        className='max-h-[30rem] w-[45rem] overflow-auto text-white p-6'
                        id="modal-desc"
                    >
                        <div className='w-full h-full overflow-auto flex flex-col items-center'>

                            {/* Search Input */}
                            <div className='w-full mb-4'>
                                <div className='relative'>
                                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                    <input
                                        type="text"
                                        className='w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none transition-all duration-300 text-white placeholder-gray-400 hover:bg-white/10'
                                        placeholder={`Search for ${name}s...`}
                                        onChange={(e) => setInputFieldVal(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Results List */}
                            <div className='w-full space-y-2'>

                                {/* User List (when searching for users) */}
                                {name === 'user' && allUsers
                                    .filter((user) => {
                                        // Filter out current user
                                        if (user.userId === userInfo.userId) return false;

                                        // If input is empty, show suggestions (users not connected)
                                        if (inputFieldVal.trim() === '') {
                                            return !isUserConnected(user);
                                        }

                                        // If has input, search ALL users (connected or not)
                                        return user.userName.toLowerCase().includes(inputFieldVal.toLowerCase()) ||
                                            user.email.toLowerCase().includes(inputFieldVal.toLowerCase());
                                    })
                                    .map((user) => {
                                        return (
                                            <div
                                                key={user.userId}
                                                className='w-full flex flex-row justify-between items-center rounded-xl duration-300 hover:scale-[1.02] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 py-4 px-5 transition-all group'
                                            >
                                                <div className='flex items-center gap-3'>
                                                    <div className='w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10'>
                                                        <img
                                                            src={user.profilePhoto}
                                                            alt={user.userName}
                                                            className='w-full h-full object-cover'
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className='font-medium group-hover:text-purple-300 transition-colors block'>{user.userName}</span>
                                                        <span className='text-xs text-gray-400'>{user.email}</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <button
                                                        className='bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 hover:border-purple-500/50 cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 group/chat'
                                                        onClick={() => startChatWithUser(user)}
                                                    >
                                                        <i className="fa-solid fa-message text-purple-400 group-hover/chat:text-purple-300 text-sm"></i>
                                                        <span className='text-sm text-purple-400 group-hover/chat:text-purple-300'>Chat</span>
                                                    </button>
                                                </div>

                                            </div>
                                        )
                                    })
                                }

                                {/* Group List (when searching for groups) */}
                                {name === 'group' &&
                                    allGroupsData.filter((grp) => {
                                        // If input empty, show suggestions (not joined)
                                        if (inputFieldVal.trim() === '') {
                                            return !isGroupJoined(grp);
                                        }
                                        // If has input, search ALL groups
                                        return grp.groupName.toLowerCase().includes(inputFieldVal.toLowerCase()) ||
                                            String(grp.groupId).includes(inputFieldVal);
                                    }).map((grp) => {
                                        return (
                                            <div
                                                key={grp.groupId}
                                                className='w-full flex flex-row justify-between items-center rounded-xl duration-300 hover:scale-[1.02] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 py-4 px-5 transition-all group'
                                            >
                                                <div className='flex items-center gap-3'>
                                                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center'>
                                                        <i className="fa-solid fa-user-group text-white text-sm"></i>
                                                    </div>
                                                    <span className='font-medium group-hover:text-purple-300 transition-colors'>{grp.groupName}</span>
                                                </div>

                                                <div>
                                                    {isGroupJoined(grp) ? (
                                                        <button
                                                            className='bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 hover:border-purple-500/50 cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 group/chat'
                                                            onClick={() => {
                                                                setSelectedGroup(grp);
                                                                setSelectedUser({});
                                                                handleClick();
                                                            }}
                                                        >
                                                            <i className="fa-solid fa-message text-purple-400 group-hover/chat:text-purple-300 text-sm"></i>
                                                            <span className='text-sm text-purple-400 group-hover/chat:text-purple-300'>See Chat</span>
                                                        </button>
                                                    ) : isInGroupJoinRequest(grp) ? (
                                                        <div className='flex flex-row gap-2'>

                                                            <div className='cursor-not-allowed px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center gap-2'>
                                                                <i className="fa-solid fa-clock text-yellow-400 text-sm"></i>
                                                                <span className='text-sm text-yellow-400'>Pending</span>
                                                            </div>

                                                            <button
                                                                className='bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 group/cancel'
                                                                onClick={() => cancelJoinRequest(grp)}>
                                                                <i className="fa-solid fa-xmark text-red-400 group-hover/cancel:text-red-300 text-sm"></i>
                                                                <span className='text-sm text-red-400 group-hover/cancel:text-red-300'>Cancel</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className='bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 hover:border-purple-500/50 cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 group/join'
                                                            onClick={() => {
                                                                wantToJoin(grp)
                                                            }}

                                                        >
                                                            <i className="fa-solid fa-plus text-purple-400 group-hover/join:text-purple-300 text-sm"></i>
                                                            <span className='text-sm text-purple-400 group-hover/join:text-purple-300'>Join</span>
                                                        </button>
                                                    )
                                                    }
                                                </div>

                                            </div>
                                        )
                                    })

                                }

                            </div>

                        </div>




                    </div>
                </Sheet>
            </Modal>
        </React.Fragment>
    );
}
