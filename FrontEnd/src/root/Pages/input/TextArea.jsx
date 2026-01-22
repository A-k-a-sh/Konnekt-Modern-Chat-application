import React, { useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';


import { editMsg, handleSubmit, useChangeMessage } from '../Right Side/SocketConnection';

import { useAllContext } from '../../../Context/AllContext';
import { useState } from 'react';
import { useClickOutside } from '../../../Custom hook/ClickOutside';

import { cloudinaryUpload } from '../../../utility/cloudinaryUpload';
import { TexAreaFunctions } from './functions';

import { useRightContext } from '../Right Side/Right Context/RightContext';

const InputArea = ({ setOutgoingMsg, setMsgToEdit, msgToEdit, fileData, setFileData }) => {

    const { parentRef, childRef, setSelectedChatToChangBg, msgToReply, setMsgToReply } = useRightContext()
    const { setMediaUploading, selectedUser, userInfo, selectedGroup, setAllMessages } = useAllContext()

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const dropdownRef = useRef(null);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [msg, setMsg] = useState('')

    useChangeMessage(setAllMessages);
    useClickOutside(dropdownRef, showDropdown, setShowDropdown);
    TexAreaFunctions.useTextAreaDynamicHeight(msg, textareaRef);


    const scrollToDiv = (msg) => {
        TexAreaFunctions.scrollToDiv(childRef, msg, setSelectedChatToChangBg)
    }


    const handleFileUpload = (event) => {
        TexAreaFunctions.handleFileUpload(event, setFileData)
    }


    const sendMsg = (e) => {

        TexAreaFunctions.sendMsg(e, msg, setMsg, msgToEdit, setMsgToEdit, setAllMessages, setOutgoingMsg, selectedUser, userInfo, fileData, setFileData, setMediaUploading, msgToReply, setMsgToReply, selectedGroup)
    }



    return (
        <div className="h-fit borde bg-transparent border-red-600 ">



            {/* main div */}

            <div className=" flex flex-row gap-2  items-center justify-center h-full">

                {/* emoji icon div */}
                <div
                    className='cursor-pointer relative group'
                    onMouseOver={() => setShowEmojiPicker(true)}
                    onMouseLeave={() => setShowEmojiPicker(false)}
                >
                    <div className='w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110'>
                        <i className="fa-regular fa-face-smile text-xl text-purple-400 group-hover:text-purple-300"></i>
                    </div>

                    <div className='absolute z-50 bottom-16 inset-x-0 '>
                        <EmojiPicker
                            open={showEmojiPicker}
                            theme='dark'
                            onEmojiClick={(e) => setMsg((prev) => prev + e.emoji)}


                        />
                    </div>

                </div>

                {/* Only Text and reply/editing area */}
                <div className='w-[100%] h-full duration-300 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md border border-white/10 text-zinc-200 rounded-xl px-4 pt-2 overflow-hidden shadow-lg'>

                    {/* Editing/replying area */}
                    {
                        (msgToEdit || msgToReply) && (
                            <div
                                className='border border-purple-500/30 overflow-auto break-words py-2 px-3 mb-2 mx-auto bg-gradient-to-r from-purple-600/20 to-blue-600/20 flex flex-row gap-2 justify-between items-center rounded-lg backdrop-blur-sm'

                            >
                                {/* Reply/edit icon and msg */}
                                <div
                                    className='px-2 flex-1 flex flex-row gap-3 cursor-pointer hover:text-purple-300 transition-colors'
                                    onClick={() => scrollToDiv(msgToEdit || msgToReply)}
                                >
                                    {/* reply icon */}
                                    <div className='flex items-center'>
                                        <i className={`fa-solid ${msgToEdit ? "fa-marker" : "fa-reply"} text-purple-400`}></i>
                                    </div>

                                    {/* reply/edit msg */}
                                    <div className='text-sm'>"
                                        {
                                            msgToEdit?.message === '' ? 'Media' : msgToEdit?.message.length > 180 ? msgToEdit?.message.substring(0, 180) + '...' : msgToEdit?.message
                                        }

                                        {
                                            msgToReply?.message === '' ? 'Media' : msgToReply?.message.length > 180 ? msgToReply?.message.substring(0, 180) + '...' : msgToReply?.message
                                        }
                                        "
                                    </div>

                                </div>



                                {/* Cancel reply/edit icon */}
                                <div
                                    className='cursor-pointer opacity-70 hover:opacity-100 z-50 transition-opacity'
                                    tabIndex={100}
                                    onClick={() => {
                                        setMsgToEdit(null)
                                        setMsgToReply(null)
                                    }}
                                >
                                    <i className="fa-solid fa-circle-xmark text-purple-400 hover:text-purple-300"></i>
                                </div>

                            </div>
                        )
                    }

                    <textarea
                        ref={textareaRef}

                        className="text-lg focus:outline-none font-mono outline-none resize-none w-full bg-transparent placeholder-gray-400"
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        placeholder="Type a message"
                        onKeyDown={(e) => {
                            if (e.shiftKey && e.key === 'Enter') {
                                sendMsg(e)
                            }
                        }}

                    />

                </div>

                {/* media button and send button */}
                <div className="flex flex-row gap-3 items-center relative">

                    {/* Media button : + */}
                    <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 group"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <i className="fa-solid fa-plus text-lg group-hover:rotate-90 transition-transform duration-300"></i>

                        {showDropdown && (

                            //Media upload options

                            <div
                                ref={dropdownRef}
                                onClick={(event) => event.stopPropagation()}
                                className='absolute w-fit h-fit bottom-[160%] -left-[150%] inset-x-0 border border-white/20 text-white overflow-hidden rounded-xl bg-gradient-to-b from-[#1a1a2e] to-[#16213e] backdrop-blur-xl shadow-2xl shadow-purple-500/20'>

                                <div className='w-[10rem] h-auto flex flex-col justify-evenly items-center p-2 cursor-pointer gap-1'>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        multiple
                                        onChange={handleFileUpload}


                                    //onChange={(e) => console.log(e.target.files[0])} // Handle file selection
                                    />

                                    <div
                                        onClick={() => {
                                            fileInputRef.current.accept = `image/*`;
                                            fileInputRef.current.click()

                                        }}
                                        className='w-full text-center py-3 px-4 hover:bg-purple-600/30 rounded-lg duration-200 transition-all border border-transparent hover:border-purple-500/50 flex items-center gap-3'
                                    >
                                        <i className="fa-solid fa-image text-purple-400"></i>
                                        <span>Upload Image</span>
                                    </div>

                                    <div
                                        className='w-full text-center py-3 px-4 hover:bg-blue-600/30 rounded-lg duration-200 transition-all border border-transparent hover:border-blue-500/50 flex items-center gap-3'
                                        onClick={() => {
                                            fileInputRef.current.accept = `video/*`;
                                            fileInputRef.current.click()
                                        }}
                                    >
                                        <i className="fa-solid fa-video text-blue-400"></i>
                                        <span>Upload Video</span>
                                    </div>
                                    <div className='w-full text-center py-3 px-4 hover:bg-green-600/30 rounded-lg duration-200 transition-all border border-transparent hover:border-green-500/50 flex items-center gap-3'
                                        onClick={() => {
                                            fileInputRef.current.accept = `.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar`;
                                            fileInputRef.current.click()
                                        }}
                                    >
                                        <i className="fa-solid fa-file text-green-400"></i>
                                        <span>Upload File</span>
                                    </div>


                                </div>

                            </div>
                        )}

                    </button>


                    {/* Send button */}
                    <button
                        onClick={sendMsg}
                        className='w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 group'
                    >
                        <i className="fa-solid fa-paper-plane text-white text-lg group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
                    </button>


                </div>
            </div>


        </div>
    );
};

export default InputArea;
