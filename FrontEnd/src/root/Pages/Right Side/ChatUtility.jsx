import React from 'react'

import { useRightContext } from './Right Context/RightContext'

const ChatUtility = ({ dropdownRef, showDropdown, setShowDropdown, utilDropdownMsg, setUtilDropdownMsg, msg, curUserInfo, setMsgToEdit, deleteFunc }) => {


    const { setMsgToReply, setIsMsgSelected, setSelectedMsg } = useRightContext()

    return (
        <div className='relative'>

            {/* Three dot , share */}
            <div className={`utility flex gap-1 items-center justify-center ${msg?.sender?.userId === curUserInfo.userId ? "flex-row" : "flex-row-reverse"} `}>

                {/* Three dot icon */}
                <button className='w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-purple-500/50 flex items-center justify-center transition-all duration-200 hover:scale-110 group'

                    onClick={() => {
                        setShowDropdown(!showDropdown)
                        setUtilDropdownMsg(msg)
                    }}
                >
                    <i className="fa-solid fa-ellipsis-vertical text-sm text-gray-400 group-hover:text-purple-400 transition-colors"></i>
                </button>

                {/* Reply icon */}
                <button
                    className='w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-blue-500/50 flex items-center justify-center transition-all duration-200 hover:scale-110 group'
                    onClick={() => {
                        setMsgToReply(msg)
                        setMsgToEdit(null)
                    }}

                >
                    <i className={`fa-solid fa-reply text-sm text-gray-400 group-hover:text-blue-400 transition-colors ${msg.sender.userId === curUserInfo.userId ? "fa-flip-horizontal" : ""}`}></i>
                </button>



            </div>


            {/* Edit , delete dropdown */}
            {
                showDropdown && utilDropdownMsg?.msgId === msg.msgId && msg.sender.userId === curUserInfo.userId && (
                    <div
                        ref={dropdownRef}

                        className={`absolute z-50 w-48 top-[-100%] border border-white/20 rounded-xl cursor-pointer bg-gradient-to-b from-[#1a1a2e] to-[#16213e] backdrop-blur-xl shadow-2xl shadow-purple-500/20 overflow-hidden
                        ${msg.sender.userId === curUserInfo.userId ? "left-[-80%]" : "right-[-80%]"}`}
                    >

                        <div className='p-1 space-y-1'>
                            {/* Delete */}
                            <div
                                className='flex flex-row items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-600/20 border border-transparent hover:border-red-500/30 transition-all duration-200 group'
                                onClick={() => deleteFunc(msg)}
                            >

                                <i className="fa-solid fa-trash text-red-400 group-hover:text-red-300 transition-colors"></i>
                                <p className='text-sm text-white group-hover:text-red-200 transition-colors'>Delete</p>
                            </div>

                            {/* Edit */}
                            <div
                                className='flex flex-row items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-600/20 border border-transparent hover:border-purple-500/30 transition-all duration-200 group'
                                onClick={() => {
                                    setMsgToEdit({ ...msg })
                                    setMsgToReply(null)
                                }}
                            >

                                <i className="fa-solid fa-pen-to-square text-purple-400 group-hover:text-purple-300 transition-colors"></i>
                                <p className='text-sm text-white group-hover:text-purple-200 transition-colors'>Edit</p>
                            </div>

                            {/* Select */}
                            <div
                                className='flex flex-row items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-600/20 border border-transparent hover:border-blue-500/30 transition-all duration-200 group'
                                onClick={() => {
                                    setIsMsgSelected(true)
                                    setSelectedMsg((prev) => ([...prev, msg]))

                                }}
                            >

                                <i className="fa-solid fa-circle-check text-blue-400 group-hover:text-blue-300 transition-colors"></i>
                                <p className='text-sm text-white group-hover:text-blue-200 transition-colors'>Select</p>
                            </div>
                        </div>

                    </div>
                )
            }

        </div>
    )
}

export default ChatUtility