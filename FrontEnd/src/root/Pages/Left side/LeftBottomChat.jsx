import React, { useEffect, useState } from 'react'

import { useAllContext } from '../../../Context/AllContext'

import './Left.css'
import { useRightContext } from '../Right Side/Right Context/RightContext'
import ModalUserSkeleton from '../../../Modals/ModalUserSkeleton'

const LeftBottomChat = () => {
    const src = 'https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg'


    const { selectedUser, setSelectedUser, setSelectedGroup, connected_to, userInfo } = useAllContext()

    const [showSkeleton, setShowSkeleton] = useState(true)

    useEffect(() => {
        if (Object.keys(connected_to).length > 0) {
            setShowSkeleton(false)
        }
    }, [connected_to])


    return (

        <div className='h-full overflow-hidden flex flex-col bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-lg'>
            {
                showSkeleton === true ? (
                    <ModalUserSkeleton />
                ) : (
                    <div className='flex-1 overflow-y-auto flex flex-col space-y-1 p-2'>

                        {userInfo && connected_to && connected_to.filter(u => u?.userId).map((user, index) => (
                            <div
                                key={index}
                                className={`
                                    flex-shrink-0 group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer
                                    ${selectedUser?.userId === user?.userId
                                        ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-l-4 border-purple-500 shadow-lg shadow-purple-500/20'
                                        : 'bg-white/5 hover:bg-white/10 hover:shadow-md'
                                    }
                                `}
                                onClick={() => {
                                    setSelectedUser(user)
                                    setSelectedGroup({})
                                }}
                            >
                                {/* Hover gradient effect */}
                                <div className='absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                                <div className='  relative flex items-center gap-3 p-3'>
                                    {/* Avatar with online status */}
                                    <div className='relative flex-shrink-0'>
                                        <div className='w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-purple-500/50 transition-all duration-300'>
                                            <img
                                                src={user?.image || user?.profilePhoto}
                                                alt={user?.userName}
                                                className='w-full h-full object-cover'
                                            />
                                        </div>
                                        {/* Online status indicator */}
                                        <div className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#1a1a2e] animate-pulse'></div>
                                    </div>

                                    {/* User info */}
                                    <div className=' flex-1 min-w-0'>
                                        <p className='font-medium text-white text-sm truncate group-hover:text-purple-200 transition-colors'>
                                            {user?.userName}
                                        </p>
                                        <p className='text-xs text-gray-400 truncate mt-0.5'>
                                            Click to chat
                                        </p>
                                    </div>

                                    {/* Unread badge (optional - can be connected to actual unread count) */}
                                    {selectedUser?.userId !== user?.userId && (
                                        <div className='flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                                            <i className="fa-solid fa-chevron-right text-xs text-gray-400"></i>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Empty state */}
                        {connected_to.length === 0 && (
                            <div className='flex flex-col items-center justify-center h-full text-center p-6'>
                                <div className='w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4'>
                                    <i className="fa-solid fa-users text-2xl text-gray-500"></i>
                                </div>
                                <p className='text-gray-400 text-sm'>No conversations yet</p>
                                <p className='text-gray-500 text-xs mt-1'>Start a new chat to begin</p>
                            </div>
                        )}

                    </div>
                )
            }
        </div>


    )
}

export default LeftBottomChat