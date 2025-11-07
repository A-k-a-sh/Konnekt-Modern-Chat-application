import React from 'react'

import { useRightContext } from './Right Context/RightContext'

const ChatUtility = ({ dropdownRef, showDropdown, setShowDropdown, utilDropdownMsg, setUtilDropdownMsg, msg, curUserInfo , setMsgToEdit , deleteFunc }) => {


    const { setMsgToReply , setIsMsgSelected , setSelectedMsg} = useRightContext()

    return (
        <div className='relative '>

            {/* Three dot , share */}
            <div className={`utility  flex   items-center justify-center ${msg?.sender?.userId === curUserInfo.userId ? "flex-row" : "flex-row-reverse"} `}>

                {/* Three dot icon */}
                <div className=''

                    onClick={() => {
                        setShowDropdown(!showDropdown)
                        setUtilDropdownMsg(msg)
                    }}
                >
                    <i className="fa-solid fa-ellipsis-vertical px-2 py-1 rounded-full hover:bg-gray-600 w-fit h-fit"></i>
                </div>

                    {/* share icon */}
                <div
                    onClick={() => {
                        setMsgToReply(msg)
                        setMsgToEdit(null)
                    }}
                    
                >
                    <i className={`fa-solid fa-share px-2 py-1 rounded-full hover:bg-gray-600 w-fit h-fit ${msg.sender.userId === curUserInfo.userId ? "fa-flip-horizontal" : ""}`}></i>
                </div>



            </div>


            {/* Edit , delete */}
            {
                showDropdown && utilDropdownMsg?.msgId === msg.msgId  && msg.sender.userId === curUserInfo.userId && (
                    <div
                        ref={dropdownRef}

                        className={`absolute z-50 w-fit top-[-100%] border border-gray-600  py-1 px-2 rounded-lg cursor-pointer bg-black
                        ${msg.sender.userId === curUserInfo.userId ? "left-[-80%]" : "right-[-80%]"}`}
                    >

                        <div
                            className='flex flex-row items-center py-1 opacity-80 hover:opacity-100 rounded-sm '
                            onClick={() => deleteFunc(msg)}
                        >

                            <i className="fa-solid fa-trash px-2 py-1   w-fit h-fit"></i>
                            <p>Delete</p>
                        </div>

                        {/* Edit */}
                        <div
                            className='flex flex-row items-center py-1 opacity-80 hover:opacity-100  rounded-sm'
                            onClick={() => {
                                setMsgToEdit({ ...msg })
                                setMsgToReply(null)
                            }}
                        >

                            <i className="fa-solid fa-edit px-2 py-1 rounded-full w-fit h-fit"></i>
                            <p>Edit</p>
                        </div>

                        {/* Select */}
                        <div
                            className='flex flex-row items-center py-1 opacity-80 hover:opacity-100  rounded-sm'
                            onClick={() => {
                                setIsMsgSelected(true)
                                setSelectedMsg((prev) => ([...prev, msg]))

                            }}
                        >

                            <i className="fa-solid fa-circle-check px-2 py-1 rounded-full w-fit h-fit"></i>
                            <p>Select Message</p>
                        </div>

                    </div>
                )
            }

        </div>
    )
}

export default ChatUtility