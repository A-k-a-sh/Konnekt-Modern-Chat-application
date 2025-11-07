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

    const { parentRef, childRef, setSelectedChatToChangBg , msgToReply , setMsgToReply } = useRightContext()
    const { setMediaUploading ,selectedUser , userInfo  , selectedGroup , setAllMessages} = useAllContext()

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

        TexAreaFunctions.sendMsg(e, msg, setMsg, msgToEdit, setMsgToEdit, setAllMessages, setOutgoingMsg, selectedUser, userInfo, fileData, setFileData, setMediaUploading , msgToReply , setMsgToReply , selectedGroup)
    }



    return (
        <div className="h-fit borde bg-transparent border-red-600 ">



            {/* main div */}

            <div className=" flex flex-row gap-2  items-center justify-center h-full">

                {/* emoji icon div */}
                <div
                    className='cursor-pointer relative'
                    onMouseOver={() => setShowEmojiPicker(true)}
                    onMouseLeave={() => setShowEmojiPicker(false)}
                >
                    <i className="fa-regular fa-face-smile text-2xl text-blue-200"></i>

                    <div className='absolute z-50 bottom-16 inset-x-0 '>
                        <EmojiPicker
                            open={showEmojiPicker}
                            theme='dark'
                            onEmojiClick={(e) => setMsg((prev) => prev + e.emoji)}


                        />
                    </div>

                </div>

                {/* Only Text and reply/editing area */}
                <div className='w-[100%] h-full duration-500  backdrop:blur-md bg-blue-600/10 text-zinc-200 rounded-xl px-4 pt-2 overflow-hidde'>

                    {/* Editing/replying area */}
                    {
                        (msgToEdit || msgToReply) && (
                            <div
                                className='border overflow-auto  break-words py-2  px-2 mb-1 mx-auto bg-neutral-500 flex flex-row gap-2 justify-between items-center rounded-lg '

                            >
                                {/* Reply/edit icon and msg */}
                                <div 
                                    className='px-2 flex-1 flex flex-row gap-2 cursor-pointer  '
                                    onClick={() => scrollToDiv(msgToEdit || msgToReply)}
                                >
                                    {/* reply icon */}
                                    <div className=''>
                                        <i className={`fa-solid ${msgToEdit ? "fa-marker" : "fa-reply"}`}></i>
                                    </div>

                                    {/* reply/edit msg */}
                                    <div  className=''>"
                                        {
                                            msgToEdit?.message === '' ? 'Media' :msgToEdit?.message.length > 180 ? msgToEdit?.message.substring(0, 180) + '...' : msgToEdit?.message
                                        }

                                        {
                                            msgToReply?.message === '' ? 'Media' :msgToReply?.message.length > 180 ? msgToReply?.message.substring(0, 180) + '...' : msgToReply?.message
                                        }
                                        "
                                    </div>

                                </div>



                                {/* Cancel reply/edit icon */}
                                <div
                                    className='cursor-pointer opacity-85 hover:opacity-100 z-50'
                                    tabIndex={100}
                                    onClick={() => {
                                        setMsgToEdit(null)
                                        setMsgToReply(null)
                                    }}
                                >
                                    <i className="fa-solid fa-circle-xmark"></i>
                                </div>

                            </div>
                        )
                    }

                    <textarea
                        ref={textareaRef}

                        className="text-lg focus:outline-none font-mono outline-none  resize-none w-full backdrop:blur-md bg-blue-600/0 "
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
                <div className="flex flex-row gap-2 items-center relative">

                    {/* Media  button : + */}
                    <button className="bg-blue-200 relative text-white rounded-full  w-8 h-8"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <p className='font-bold text-xl'>+</p>

                        {showDropdown && (

                            //Media upload options

                            <div
                                ref={dropdownRef}
                                onClick={(event) => event.stopPropagation()}
                                className='absolute w-fit h-fit bottom-[160%] -left-[150%] inset-x-0 border-[0.1px] text-white overflow-hidden rounded-lg bg-slate-950 py-1  '>

                                <div className='w-[8rem] h-[9rem] flex flex-col justify-evenly items-center px-1 cursor-pointer'>

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
                                        className='w-full h-full text-center py-2 hover:bg-zinc-800 rounded-md  duration-200'
                                    >
                                        Upload Image
                                    </div>

                                    <div
                                        className='w-full h-full text-center py-2 hover:bg-zinc-800 rounded-md'
                                        onClick={() => {
                                            fileInputRef.current.accept = `video/*`;
                                            fileInputRef.current.click()
                                        }}
                                    >
                                        Upload Video</div>
                                    <div className='w-full h-full text-center py-2 hover:bg-zinc-800 rounded-md'>Upload File</div>


                                </div>

                            </div>
                        )}

                    </button>


                    {/* Send button */}
                    <button onClick={sendMsg}>
                        <i className="fa-regular  text-white font-bold text-2xl fa-paper-plane text-blue-200"></i>
                    </button>


                </div>
            </div>


        </div>
    );
};

export default InputArea;
