import React, { useState } from 'react'
import { useAllContext } from '../../../Context/AllContext'
import { usePanelContext } from '../../../Context/PanelContext'
import { useLocation } from 'react-router-dom'
import ModalImageShow from '../../../Modals/ModalImageShow'
import { downloadFile } from '../../../services'
import { useIsOnline } from '../../../hooks'
import { socket } from '../../../services'

const UserGroupDetails = () => {
    const { selectedUser, setSelectedUser, selectedGroup, setSelectedGroup, userInfo, joined_groupsInfo, connected_to, allGroupsData } = useAllContext()
    const { closePanel } = usePanelContext()
    const location = useLocation()
    const isGroupChat = location.pathname === '/group'

    const [activeTab, setActiveTab] = useState('about') // about, media, files, members, requests
    const [showMediaModal, setShowMediaModal] = useState(false)
    const [viewingMember, setViewingMember] = useState(null) // To store the member being viewed
    const [selectedMedia, setSelectedMedia] = useState({ src: '', type: '' })
    const [allMediaForModal, setAllMediaForModal] = useState([])

    // Use local isOnline state with useIsOnline hook for proper tracking
    const [isOnline, setIsOnline] = useState(false)

    const safeSelectedUser = selectedUser || {}
    const safeSelectedGroup = selectedGroup || {}

    useIsOnline(safeSelectedUser, userInfo, setIsOnline)

    // Determine what to display
    // Get live group data if it's a group chat
    const currentGroup = isGroupChat && allGroupsData
        ? allGroupsData.find(g => g.groupId === safeSelectedGroup.groupId) || safeSelectedGroup
        : {};

    const displayData = isGroupChat ? currentGroup : safeSelectedUser
    const hasData = displayData && Object.keys(displayData).length > 0

    if (!hasData) {
        return (
            <div className='h-full flex flex-col items-center justify-center p-8 text-center bg-[#0f0e1a] border-l border-white/10'>
                <div className='w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4 animate-pulse'>
                    <i className="fa-regular fa-comments text-4xl text-gray-600"></i>
                </div>
                <h3 className='text-xl font-semibold text-gray-300 mb-2'>No Chat Selected</h3>
                <p className='text-sm text-gray-500'>Select a chat to view details</p>
            </div>
        )
    }

    return (
        <div className='h-full flex flex-col bg-[#0f0e1a] border-l border-white/10 relative'>
            <button
                onClick={() => {
                    if (viewingMember) setViewingMember(null);
                    else {
                        // setSelectedUser({});
                        // setSelectedGroup({});
                        closePanel();
                    }
                }}
                className='absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border border-white/5'
                title={viewingMember ? "Back" : "Close"}
            >
                <i className={`fa-solid ${viewingMember ? 'fa-arrow-left' : 'fa-xmark'} text-gray-400 hover:text-white`}></i>
            </button>

            {viewingMember ? (
                <div className='h-full flex flex-col bg-gradient-to-b from-[#0f0e1a] to-[#1a1a2e] overflow-hidden animate-fade-in'>
                    {/* Header with Avatar and Name */}
                    <div className='bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10 p-6 flex flex-col items-center'>
                        <div className='relative mb-4'>
                            <div className='w-24 h-24 rounded-full overflow-hidden ring-4 ring-purple-500/30'>
                                <img
                                    src={viewingMember.profilePhoto || viewingMember.image}
                                    alt={viewingMember.userName}
                                    className='w-full h-full object-cover'
                                />
                            </div>
                        </div>

                        <h2 className='text-xl font-bold text-white mb-1'>
                            {viewingMember.userName}
                        </h2>
                        <p className='text-sm text-gray-400'>
                            {viewingMember.email || 'No email provided'}
                        </p>
                    </div>

                    {/* Member Details Content - Similar to About Tab */}
                    <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                        <div className='space-y-4'>
                            <div className='bg-white/5 rounded-xl p-4 border border-white/10'>
                                <h3 className='text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2'>
                                    <i className="fa-solid fa-circle-info text-purple-400"></i>
                                    Information
                                </h3>

                                <div className='space-y-3'>
                                    <div>
                                        <p className='text-xs text-gray-500 mb-1'>User ID</p>
                                        <p className='text-sm text-white font-mono bg-white/5 px-2 py-1 rounded'>{viewingMember.userId}</p>
                                    </div>
                                    <div>
                                        <p className='text-xs text-gray-500 mb-1'>Email</p>
                                        <p className='text-sm text-white'>{viewingMember.email || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className='text-xs text-gray-500 mb-1'>Bio</p>
                                        <p className='text-sm text-white'>{viewingMember.bio || 'No bio available'}</p>
                                    </div>

                                    {currentGroup.adminId === viewingMember.userId && (
                                        <div>
                                            <p className='text-xs text-gray-500 mb-1'>Role</p>
                                            <span className='inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium border border-purple-500/30'>
                                                Group Admin
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='h-full flex flex-col bg-gradient-to-b from-[#0f0e1a] to-[#1a1a2e] overflow-hidden'>

                    {/* Header with Avatar and Name */}
                    <div className='bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10 p-6 flex flex-col items-center'>
                        <div className='relative mb-4'>
                            <div className='w-24 h-24 rounded-full overflow-hidden ring-4 ring-purple-500/30'>
                                <img
                                    src={isGroupChat ? selectedGroup.groupImage : selectedUser.profilePhoto || selectedUser.image}
                                    alt={isGroupChat ? selectedGroup.groupName : selectedUser.userName}
                                    className='w-full h-full object-cover'
                                />
                            </div>
                            {!isGroupChat && (
                                <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-[#0f0e1a] ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                            )}
                        </div>

                        <h2 className='text-xl font-bold text-white mb-1'>
                            {isGroupChat ? currentGroup.groupName : selectedUser.userName}
                        </h2>

                        {isGroupChat ? (
                            <p className='text-sm text-gray-400'>
                                {currentGroup.groupMembers?.length || 0} members
                            </p>
                        ) : (
                            <p className='text-sm text-gray-400'>
                                {selectedUser.email || 'No email'}
                            </p>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className='flex border-b border-white/10 bg-white/5'>
                        <button
                            onClick={() => setActiveTab('about')}
                            className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${activeTab === 'about'
                                ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-600/10'
                                : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            <i className="fa-solid fa-info-circle mr-2"></i>
                            About
                        </button>
                        <button
                            onClick={() => setActiveTab('media')}
                            className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${activeTab === 'media'
                                ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-600/10'
                                : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            <i className="fa-solid fa-image mr-2"></i>
                            Media
                        </button>
                        <button
                            onClick={() => setActiveTab('files')}
                            className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${activeTab === 'files'
                                ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-600/10'
                                : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            <i className="fa-solid fa-file mr-2"></i>
                            Files
                        </button>
                        {isGroupChat && (
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${activeTab === 'members'
                                    ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-600/10'
                                    : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                <i className="fa-solid fa-users mr-2"></i>
                                Members
                            </button>
                        )}
                        {/* Join Requests tab - only show for group admins */}
                        {isGroupChat && currentGroup.adminId === userInfo?.userId && (
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${activeTab === 'requests'
                                    ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-600/10'
                                    : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                <i className="fa-solid fa-user-plus mr-2"></i>
                                Requests
                                {currentGroup.groupJoinRequests?.length > 0 && (
                                    <span className='ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs'>
                                        {currentGroup.groupJoinRequests.length}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className='flex-1 overflow-y-auto p-4 space-y-4'>

                        {activeTab === 'about' && (
                            <div className='space-y-4'>
                                {/* About Section */}
                                <div className='bg-white/5 rounded-xl p-4 border border-white/10'>
                                    <h3 className='text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2'>
                                        <i className="fa-solid fa-circle-info text-purple-400"></i>
                                        Information
                                    </h3>

                                    {isGroupChat ? (
                                        <div className='space-y-3'>
                                            <div>
                                                <p className='text-xs text-gray-500 mb-1'>Group ID</p>
                                                <p className='text-sm text-white font-mono bg-white/5 px-2 py-1 rounded'>{selectedGroup.groupId}</p>
                                            </div>
                                            <div>
                                                <p className='text-xs text-gray-500 mb-1'>Created</p>
                                                <p className='text-sm text-white'>Recently</p>
                                            </div>
                                            <div>
                                                <p className='text-xs text-gray-500 mb-1'>Description</p>
                                                <p className='text-sm text-white'>{selectedGroup.description || 'No description'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='space-y-3'>
                                            <div>
                                                <p className='text-xs text-gray-500 mb-1'>User ID</p>
                                                <p className='text-sm text-white font-mono bg-white/5 px-2 py-1 rounded'>{selectedUser.userId}</p>
                                            </div>
                                            <div>
                                                <p className='text-xs text-gray-500 mb-1'>Email</p>
                                                <p className='text-sm text-white'>{selectedUser.email || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className='text-xs text-gray-500 mb-1'>Status</p>
                                                <p className={`text-sm flex items-center gap-2 ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
                                                    {isOnline ? 'Online' : 'Offline'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Members Section (for groups) */}
                                {isGroupChat && selectedGroup.members && (
                                    <div className='bg-white/5 rounded-xl p-4 border border-white/10'>
                                        <h3 className='text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2'>
                                            <i className="fa-solid fa-users text-blue-400"></i>
                                            Members ({selectedGroup.members.length})
                                        </h3>

                                        <div className='space-y-2 max-h-64 overflow-y-auto'>
                                            {selectedGroup.members.map((member, index) => (
                                                <div key={index} className='flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors'>
                                                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold'>
                                                        {member.userName?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <p className='text-sm text-white truncate'>{member.userName || 'Unknown'}</p>
                                                        <p className='text-xs text-gray-400'>{member.userId === userInfo.userId ? 'You' : 'Member'}</p>
                                                    </div>
                                                    {member.userId === selectedGroup.admin && (
                                                        <span className='text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30'>
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className='bg-white/5 rounded-xl p-4 border border-white/10 space-y-2'>
                                    <h3 className='text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2'>
                                        <i className="fa-solid fa-gear text-gray-400"></i>
                                        Actions
                                    </h3>

                                    <button className='w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 transition-all duration-200 group'>
                                        <i className="fa-solid fa-bell text-purple-400 group-hover:text-purple-300"></i>
                                        <span className='text-sm text-white'>Mute notifications</span>
                                    </button>

                                    <button className='w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 transition-all duration-200 group'>
                                        <i className="fa-solid fa-search text-blue-400 group-hover:text-blue-300"></i>
                                        <span className='text-sm text-white'>Search in chat</span>
                                    </button>

                                    {!isGroupChat && (
                                        <button className='w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/30 transition-all duration-200 group'>
                                            <i className="fa-solid fa-user-slash text-red-400 group-hover:text-red-300"></i>
                                            <span className='text-sm text-white'>Block user</span>
                                        </button>
                                    )}

                                    {isGroupChat && (
                                        <button className='w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/30 transition-all duration-200 group'>
                                            <i className="fa-solid fa-right-from-bracket text-red-400 group-hover:text-red-300"></i>
                                            <span className='text-sm text-white'>Leave group</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'media' && (
                            <div className='space-y-4'>
                                {(() => {
                                    // Get all messages from context
                                    const { allMessages } = useAllContext();

                                    // Filter messages for current chat (user or group)
                                    const currentChatMessages = allMessages.filter((msg) => {
                                        if (isGroupChat) {
                                            // For group chat, filter by groupId
                                            return msg.chatType === 'group' && msg.groupId === selectedGroup.groupId;
                                        } else {
                                            // For private chat, filter by sender/receiver
                                            return msg.chatType === 'private' && (
                                                (msg.receiver.userId === selectedUser.userId && msg.sender.userId === userInfo.userId) ||
                                                (msg.sender.userId === selectedUser.userId && msg.receiver.userId === userInfo.userId)
                                            );
                                        }
                                    });

                                    // Filter messages with media (images/videos)
                                    const mediaMessages = currentChatMessages.filter(msg =>
                                        msg.mediaLinks && msg.mediaLinks.length > 0 &&
                                        msg.mediaLinks.some(media =>
                                            media.resource_type === 'image' || media.resource_type === 'video'
                                        )
                                    );

                                    // Extract all media items
                                    const allMedia = mediaMessages.flatMap(msg =>
                                        msg.mediaLinks
                                            .filter(media => media.resource_type === 'image' || media.resource_type === 'video')
                                            .map(media => ({
                                                src: media.url,
                                                type: media.resource_type,
                                                msgId: msg.msgId,
                                                date: msg.createdAt
                                            }))
                                    );

                                    if (allMedia.length === 0) {
                                        return (
                                            <div className='text-center py-12'>
                                                <div className='w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4'>
                                                    <i className="fa-solid fa-image text-3xl text-gray-500"></i>
                                                </div>
                                                <p className='text-gray-400'>No media yet</p>
                                                <p className='text-gray-500 text-sm mt-1'>Shared photos and videos will appear here</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className='grid grid-cols-3 gap-2'>
                                            {allMedia.map((media, index) => (
                                                <div
                                                    key={index}
                                                    className='aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/50 cursor-pointer transition-all duration-200 hover:scale-105 group'
                                                    onClick={() => {
                                                        setSelectedMedia({ src: media.src, type: media.type });
                                                        setAllMediaForModal(allMedia);
                                                        setShowMediaModal(true);
                                                    }}
                                                >
                                                    {media.type === 'image' ? (
                                                        <img
                                                            src={media.src}
                                                            alt="Media"
                                                            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-200'
                                                        />
                                                    ) : (
                                                        <div className='relative w-full h-full'>
                                                            <video
                                                                src={media.src}
                                                                className='w-full h-full object-cover'
                                                            />
                                                            <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                                                                <i className="fa-solid fa-play text-white text-2xl"></i>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {activeTab === 'files' && (
                            <div className='space-y-4'>
                                {(() => {
                                    // Get all messages from context
                                    const { allMessages } = useAllContext();

                                    // Filter messages for current chat (user or group)
                                    const currentChatMessages = allMessages.filter((msg) => {
                                        if (isGroupChat) {
                                            // For group chat, filter by groupId
                                            return msg.chatType === 'group' && msg.groupId === selectedGroup.groupId;
                                        } else {
                                            // For private chat, filter by sender/receiver
                                            return msg.chatType === 'private' && (
                                                (msg.receiver.userId === selectedUser.userId && msg.sender.userId === userInfo.userId) ||
                                                (msg.sender.userId === selectedUser.userId && msg.receiver.userId === userInfo.userId)
                                            );
                                        }
                                    });

                                    // Filter messages with files (documents)
                                    const fileMessages = currentChatMessages.filter(msg =>
                                        msg.mediaLinks && msg.mediaLinks.length > 0 &&
                                        msg.mediaLinks.some(media => media.resource_type === 'raw')
                                    );

                                    // Extract all file items
                                    const allFiles = fileMessages.flatMap(msg =>
                                        msg.mediaLinks
                                            .filter(media => media.resource_type === 'raw')
                                            .map(media => {
                                                const fileName = media.url.split('/').pop().split('?')[0];
                                                const fileExt = fileName.split('.').pop().toLowerCase();
                                                return {
                                                    url: media.url,
                                                    name: fileName,
                                                    ext: fileExt,
                                                    msgId: msg.msgId,
                                                    date: msg.createdAt
                                                };
                                            })
                                    );

                                    if (allFiles.length === 0) {
                                        return (
                                            <div className='text-center py-12'>
                                                <div className='w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4'>
                                                    <i className="fa-solid fa-file text-3xl text-gray-500"></i>
                                                </div>
                                                <p className='text-gray-400'>No files yet</p>
                                                <p className='text-gray-500 text-sm mt-1'>Shared documents will appear here</p>
                                            </div>
                                        );
                                    }

                                    const getFileIcon = (ext) => {
                                        const icons = {
                                            pdf: { icon: 'fa-file-pdf', color: 'text-red-400' },
                                            txt: { icon: 'fa-file-lines', color: 'text-gray-400' },
                                            doc: { icon: 'fa-file-word', color: 'text-blue-400' },
                                            docx: { icon: 'fa-file-word', color: 'text-blue-400' },
                                            xls: { icon: 'fa-file-excel', color: 'text-green-400' },
                                            xlsx: { icon: 'fa-file-excel', color: 'text-green-400' },
                                            ppt: { icon: 'fa-file-powerpoint', color: 'text-orange-400' },
                                            pptx: { icon: 'fa-file-powerpoint', color: 'text-orange-400' },
                                            zip: { icon: 'fa-file-zipper', color: 'text-yellow-400' },
                                            rar: { icon: 'fa-file-zipper', color: 'text-yellow-400' }
                                        };
                                        return icons[ext] || { icon: 'fa-file', color: 'text-gray-400' };
                                    };

                                    return (
                                        <div className='space-y-2'>
                                            {allFiles.map((file, index) => {
                                                const fileIcon = getFileIcon(file.ext);
                                                const downloadUrl = getCloudinaryDownloadUrl(file.url, file.name);
                                                return (
                                                    <div
                                                        key={index}
                                                        className='flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 cursor-pointer transition-all duration-200 group'
                                                        onClick={() => window.open(downloadUrl, '_blank')}
                                                    >
                                                        <div className='w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0'>
                                                            <i className={`fa-solid ${fileIcon.icon} ${fileIcon.color} text-xl`}></i>
                                                        </div>
                                                        <div className='flex-1 min-w-0'>
                                                            <p className='text-sm text-white truncate group-hover:text-purple-300 transition-colors'>{file.name}</p>
                                                            <p className='text-xs text-gray-400'>{file.ext.toUpperCase()}</p>
                                                        </div>
                                                        <i className="fa-solid fa-download text-gray-400 group-hover:text-purple-400 transition-colors"></i>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Members Tab */}
                        {activeTab === 'members' && isGroupChat && (
                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    {currentGroup.groupMembers?.map((member, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setViewingMember(member)}
                                            className='flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 cursor-pointer transition-all duration-200 group'
                                        >
                                            <div className='w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-purple-500/50 transition-all'>
                                                <img
                                                    src={member.profilePhoto || member.image}
                                                    alt={member.userName}
                                                    className='w-full h-full object-cover'
                                                />
                                            </div>
                                            <div className='flex-1 min-w-0 text-left'>
                                                <div className='flex items-center gap-2'>
                                                    <p className='text-sm text-white font-medium truncate group-hover:text-purple-300 transition-colors'>
                                                        {member.userName}
                                                    </p>
                                                    {currentGroup.adminId === member.userId && (
                                                        <i className="fa-solid fa-crown text-yellow-500 text-xs" title="Admin"></i>
                                                    )}
                                                </div>
                                                <p className='text-xs text-gray-400'>View Profile</p>
                                            </div>
                                            <i className="fa-solid fa-chevron-right text-gray-500 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all"></i>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Join Requests Tab (Admin Only) */}
                        {activeTab === 'requests' && isGroupChat && (
                            <div className='space-y-4'>
                                {(() => {
                                    const joinRequests = currentGroup.groupJoinRequests || [];

                                    if (joinRequests.length === 0) {
                                        return (
                                            <div className='text-center py-12'>
                                                <div className='w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4'>
                                                    <i className="fa-solid fa-user-plus text-3xl text-gray-500"></i>
                                                </div>
                                                <p className='text-gray-400'>No pending requests</p>
                                                <p className='text-gray-500 text-sm mt-1'>Join requests will appear here</p>
                                            </div>
                                        );
                                    }

                                    const handleApprove = (userId) => {
                                        socket.emit('approveJoinRequest', {
                                            groupId: currentGroup.groupId,
                                            userId: userId,
                                            adminId: userInfo.userId
                                        });
                                    };

                                    const handleReject = (userId) => {
                                        socket.emit('rejectJoinRequest', {
                                            groupId: currentGroup.groupId,
                                            userId: userId,
                                            adminId: userInfo.userId
                                        });
                                    };

                                    return (
                                        <div className='space-y-2'>
                                            {joinRequests.map((request, index) => (
                                                <div
                                                    key={index}
                                                    className='flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-200'
                                                >
                                                    <div className='flex items-center gap-3'>
                                                        <div className='w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10'>
                                                            <img
                                                                src={request.profilePhoto || request.image}
                                                                alt={request.userName || request.userId}
                                                                className='w-full h-full object-cover'
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className='text-sm text-white font-medium'>
                                                                {request.userName || `User ${request.userId}`}
                                                            </p>
                                                            <p className='text-xs text-gray-400'>Wants to join</p>
                                                        </div>
                                                    </div>

                                                    <div className='flex gap-2'>
                                                        <button
                                                            onClick={() => handleApprove(request.userId)}
                                                            className='px-4 py-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 hover:border-green-500/50 text-green-400 hover:text-green-300 text-sm transition-all duration-200 flex items-center gap-2'
                                                        >
                                                            <i className="fa-solid fa-check"></i>
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(request.userId)}
                                                            className='px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 text-sm transition-all duration-200 flex items-center gap-2'
                                                        >
                                                            <i className="fa-solid fa-xmark"></i>
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                    </div>

                    {/* Media Modal */}
                    <ModalImageShow
                        modalOpen={showMediaModal}
                        setModalOpen={setShowMediaModal}
                        fileSrcType={selectedMedia}
                        allMedia={allMediaForModal}
                    />

                </div>
            )}
        </div>
    )
}

export default UserGroupDetails
