import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios';

import { deleteFromCloudinary as cloudinaryDelete } from '../../../services';
import { downloadFile as getCloudinaryDownloadUrl } from '../../../services';
import { useChangeMessage } from '../../../hooks';

import { deleteMsg } from '../../../utils';
import { useClickOutside } from '../../../hooks';

import { useAllContext } from '../../../Context/AllContext';

import { useRightContext } from './Right Context/RightContext';

import { formatDateTime as multiFormatDateString } from '../../../utils';

import './Right.css'

import Loader from '../../../Components/Loader';
import ChatUtility from './ChatUtility';

import { TexAreaFunctions } from '../input/functions';

const Chats = ({ messages, setAllMessages, curUserInfo, showMediaFunction, setMsgToEdit }) => {
    const [previews, setPreviews] = useState(null);


    const { parentRef, setMessageRef, getMessageRef, selectedChatToChangBg, setSelectedChatToChangBg, setMsgToReply, selectedMsg, setSelectedMsg, isMsgSelected,
        setIsMsgSelected } = useRightContext()

    const { mediaUploading, selectedGroup } = useAllContext()

    const scrollToDiv = (msg) => {
        const element = getMessageRef(msg.msgId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
            setSelectedChatToChangBg(msg.msgId);
            setTimeout(() => setSelectedChatToChangBg(null), 2000);
        }
    }



    const imgUrl = 'https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg'

    const dropdownRef = useRef(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const [utilDropdownMsg, setUtilDropdownMsg] = useState(null)

    useClickOutside(dropdownRef, showDropdown, setShowDropdown);


    const deleteFunc = async (msg) => {
        setAllMessages((prev) => prev.filter((m) => m.msgId !== msg.msgId));

        // remove reply
        setAllMessages((prev) => prev.map((m) => {
            if (m.reply?.msgId === msg.msgId) {
                return { ...m, reply: null }
            }
            return m
        }))

        deleteMsg(msg)

        setMsgToEdit((m) => m?.msgId === msg.msgId ? null : m)
        setMsgToReply((m) => m?.msgId === msg.msgId ? null : m)


        setShowDropdown(false)

        await Promise.all(msg.mediaLinks.map(async (link) => {
            await cloudinaryDelete(link.public_id, link.resource_type)
        }))



    }

    //this is for when a message is deleted , edited or replied || listen to socket
    useChangeMessage(setAllMessages);


    function extractUrls(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.match(urlRegex) || [];
    }

    // async function fetchLinkPreview(url) {
    //     const res = await axios.get(`http://localhost:4000/link-preview?url=${encodeURIComponent(url)}`)
    //     console.log(res);
    //     return res;
    // }


    async function fetchLinkPreview(url) {

        const res = await axios.post('https://api.linkpreview.net', {
            q: url,
        },
            {
                headers: {
                    'X-Linkpreview-Api-Key': 'dc18179bb14b35a48aa495e14a488af9 d'
                }
            }).then(resp => {
                console.log(resp.data)
                return resp
            }).catch(err => {
                // something went wrong
                console.log(err.response)
            })

        return res;

    }


    useEffect(() => {
        const msg = messages[messages.length - 1]?.message;
        const urls = msg ? extractUrls(msg) : [];

        // const urls = extractUrls(msg.message);
        if (urls.length > 0) {
            fetchLinkPreview(urls[0]).then(setPreviews);
        }

        if (!selectedMsg?.length) {
            setIsMsgSelected(false)
        }
    }, [messages, selectedMsg]);



    function linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        return text.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
                return <i>
                    <a key={index} href={part} target="_blank" rel="noopener noreferrer" className='text-zinc-300 font-extralight'>{part}</a>
                </i>;
            } else {
                return part;
            }
        });
    }

    const hasPreviews = (msg) => {

        const urls = msg ? extractUrls(msg) : [];
        return urls.length > 0
    }

    return (
        <div
            className={` textMsg w-[85%] flex mx-auto gap-3 flex-col borde border-red-500   h-auto  pb-4 pt-4 ${mediaUploading ? "items-end" : ""}`}

            ref={parentRef}
        >

            {messages && messages.map((msg, index) => (



                //full width div for a msg
                <div
                    key={`${msg.msgId}-${index}`}
                    className={`borde  flex  w-full duration-100 rounded-2xl ${msg.sender.userId === curUserInfo.userId ? "justify-end" : "justify-start"} ${selectedChatToChangBg === msg.msgId && 'bg-[#30507d6f]'} ${selectedMsg?.some((m) => m.msgId === msg.msgId) && 'bg-blue-300/30'}`}
                    onClick={() => {
                        if (isMsgSelected) {
                            setSelectedMsg((prev) => {
                                const exists = prev.find((m) => m?.msgId === msg?.msgId);
                                if (exists) {

                                    // Remove from selection
                                    return prev.filter((m) => m?.msgId !== msg?.msgId);
                                } else {
                                    // Add to selection
                                    return [...prev, msg];
                                }
                            });
                        }
                    }}

                    ref={(el) => setMessageRef(msg.msgId, el)}
                >

                    {/* Text div includes utility */}
                    <div className={`textAndUtility  borde border-fuchsia-600 max-w-[70%]  h-fit flex ${msg.sender.userId === curUserInfo.userId ? "flex-row-reverse" : "flex-row"}   justify-start items-center gap-1 `}>

                        {/* MSg showing div : text , media */}
                        <div
                            className={`msgggsgsdf borde relative max-w-full min-w-[5rem] min-h-[2rem] whitspace-pre-wrap break-words text-lg
                                    ${msg.sender.userId === curUserInfo.userId ? `${msg.mediaLinks && !msg.message ? "text-zinc-200" : "text-white px-2 pb-4 py-1 bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20 msg-tail-right"}` :
                                    `${msg.mediaLinks && !msg.message ? "text-zinc-700" : "text-zinc-200 px-2 pb-4 py-1 bg-white/10 backdrop-blur-md border border-white/10 msg-tail-left"}`}
                                      rounded-2xl`
                            }
                        >
                            {msg.chatType === 'group' && msg.sender.userId !== curUserInfo.userId && <span className='text-sm text-zinc-400'>{msg.sender.userName}</span>}



                            {/* // Media div */}
                            {msg.mediaLinks && msg.mediaLinks.map((link, index) => (

                                <div className='' key={index}>

                                    {
                                        link.resource_type === "image" && (
                                            <img
                                                onClick={() => showMediaFunction(link.url, link.resource_type)}
                                                src={link.url} alt=""
                                                className='w-full border border-zinc-600 max-h-fit rounded-lg object-cover object-center cursor-pointer '
                                            />
                                        )


                                    }

                                    {
                                        link.resource_type === "video" && (
                                            <video
                                                onClick={() => showMediaFunction(link.url, link.resource_type)}
                                                className='w-full max-h-fit rounded-lg object-cover object-center cursor-pointer '
                                                controls
                                            >
                                                <source src={link.url} type="video/mp4" />
                                            </video>
                                        )
                                    }

                                    {
                                        link.resource_type === "raw" && (() => {
                                            const fileName = link.url.split('/').pop().split('?')[0];
                                            const fileExt = fileName.split('.').pop().toLowerCase();

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

                                            const fileIcon = getFileIcon(fileExt);

                                            // Create download URL with fl_attachment flag
                                            const downloadUrl = getCloudinaryDownloadUrl(link.url, fileName);

                                            return (
                                                <div
                                                    className='flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 cursor-pointer transition-all duration-200 group max-w-xs'
                                                    onClick={() => window.open(downloadUrl, '_blank')}
                                                >
                                                    <div className='w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0'>
                                                        <i className={`fa-solid ${fileIcon.icon} ${fileIcon.color} text-xl`}></i>
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <p className='text-sm text-white truncate group-hover:text-purple-300 transition-colors'>{fileName}</p>
                                                        <p className='text-xs text-gray-400'>{fileExt.toUpperCase()}</p>
                                                    </div>
                                                    <i className="fa-solid fa-download text-gray-400 group-hover:text-purple-400 transition-colors"></i>
                                                </div>
                                            );
                                        })()
                                    }



                                </div>
                            ))}

                            {/* reply section */}
                            {msg.reply && (
                                <div
                                    className={`text-sm max-h-[5rem] overflow-y-scroll cursor-pointer text-white w-full px-2 py-2 rounded-lg border-l-4 
                                            ${msg.sender.userId === curUserInfo.userId ? "border-purple-400 bg-purple-600/30 backdrop-blur-sm"
                                            :
                                            "border-blue-400 bg-white/20 backdrop-blur-sm"
                                        }
                                             `}
                                    onClick={() => scrollToDiv(msg.reply)}

                                >
                                    <span className='text-xs text-gray-300'>Reply To: {msg.reply.sender.userId === curUserInfo.userId ? "Yourself" : msg.reply.sender.userName}</span>
                                    <br />
                                    {msg.reply.message.length > 120 ? msg.reply.message.substring(0, 120) + "..." : msg.reply.message}
                                </div>
                            )}

                            {/* showing forward from */}

                            {msg.forwardFrom && (
                                <div
                                    className={`text-sm max-h-[5rem] overflow-y-scroll block cursor-pointer text-white px-2 py-2 rounded-lg border-l-4 
                                            ${msg.sender.userId === curUserInfo.userId ? "border-purple-400 bg-purple-600/30 backdrop-blur-sm"
                                            :
                                            "border-blue-400 bg-white/20 backdrop-blur-sm"
                                        }
                                             `}

                                >
                                    <span className='text-xs text-gray-300'>Forwarded from: {msg.forwardFrom?.userName}</span>
                                    <br />

                                </div>
                            )}

                            {/* //main Message div */}
                            <p>{linkify(msg.message)}</p>

                            {/* //url Preview div */}
                            {previews && (
                                <div
                                    className="preview-card bg-slate-800 m-2 p-2 rounded-sm" style={{ border: '0px solid #ccc', padding: '10px', marginTop: '10px' }}
                                    onClick={() => window.open(previews.url, '_blank')}
                                >
                                    <img src={previews.image} alt="Preview" className='w-[70%] rounded-lg h-full' />
                                    <div>
                                        <h4>{previews.title}</h4>
                                        <p>{previews.description?.slice(0, 120)}</p>
                                    </div>
                                </div>
                            )}

                            {/* // Time div */}

                            <div
                                className='text-xs text-zinc-400 absolute  bottom-1 right-2'
                            >
                                {
                                    multiFormatDateString(msg.time)
                                }
                            </div>


                        </div>

                        {/* Utility section : three dot , share, edit , delete */}

                        {
                            !isMsgSelected &&
                            <ChatUtility
                                msg={msg}
                                setShowDropdown={setShowDropdown}
                                showDropdown={showDropdown}
                                dropdownRef={dropdownRef}
                                utilDropdownMsg={utilDropdownMsg}
                                setUtilDropdownMsg={setUtilDropdownMsg}
                                deleteFunc={deleteFunc}
                                curUserInfo={curUserInfo}
                                setMsgToEdit={setMsgToEdit}
                            />
                        }

                    </div>

                </div>

            ))}

            {/* Loading animation */}

            {
                mediaUploading && (
                    <div className='w-80 h-36 flex flex-col gap-3 justify-center items-center bg-transparent rounded-2xl'>
                        <p>Uploading</p>
                        <Loader />
                    </div>
                )
            }




        </div>
    )
}

export default Chats