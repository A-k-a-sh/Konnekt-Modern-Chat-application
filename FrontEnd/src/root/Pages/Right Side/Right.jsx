import React, { useEffect, useRef, useState, useMemo } from 'react'
import RightTop from './RightTop'

import { useAllContext } from '../../../Context/AllContext'
import InputArea from '../input/TextArea'
import './Right.css'
import ModalSelectUser from '../input/ModalSelectUser'

import { useSocketMessage } from '../../../hooks'
import Chats from './Chats'
import ModalImageShow from '../../../Modals/ModalImageShow'

import { useRightContext } from './Right Context/RightContext'


const Right = () => {

    const { MsgAreaDivRef } = useRightContext()

    const [fileData, setFileData] = useState([])

    const [showImg, setShowImg] = useState(false) //to show image large
    const [fileSrcType, setFileSrcType] = useState({})

    const [outgoingMsg, setOutgoingMsg] = useState('')
    // const [allMessages, setAllMessages] = useState([])

    const [msgToEdit, setMsgToEdit] = useState(null)
    const { selectedUser, userInfo: curUserInfo, selectedGroup, allMessages, setAllMessages } = useAllContext()
    const { setSelectedMsg, setIsMsgSelected } = useRightContext()

    useEffect(() => {
        setSelectedMsg([])
        setIsMsgSelected(false)
    }, [selectedGroup, selectedUser])

    useSocketMessage(setAllMessages)

    // Filter messages based on selected user or group
    const filteredMessages = useMemo(() => {
        return allMessages.filter((msg) =>
            (msg.chatType === 'private' && (msg.receiver.userId === selectedUser.userId && msg.sender.userId === curUserInfo.userId) ||
                (msg.sender.userId === selectedUser.userId && msg.receiver.userId === curUserInfo.userId)) ||

            (msg.chatType === 'group' && (msg.groupId === selectedGroup.groupId))
        )
    }, [allMessages, selectedUser, selectedGroup, curUserInfo])

    const showMediaFunction = (src, type) => {
        setShowImg(true)
        setFileSrcType({ src, type })

    }

    document.title = `ChatApp | ${curUserInfo
        ? curUserInfo.userName
        : 'Select a user'}`

    // console.log(selectedGroup);

    return (
        ((selectedGroup && Object.keys(selectedGroup).length > 0) || (selectedUser && Object.keys(selectedUser).length > 0)) ? (
            <div className='MsgArea  h-full flex flex-col   ' ref={MsgAreaDivRef}>

                <div className=' h-[5rem] '>
                    <RightTop />
                </div>

                <div
                    className=' relative borde border-green-700  w-full h-full flex flex-col overflow-auto  justify-end '


                >

                    {/* chat msg box div */}
                    <div className='overflow-y-auto'>
                        <Chats
                            messages={filteredMessages}
                            setAllMessages={setAllMessages}
                            curUserInfo={curUserInfo}
                            showMediaFunction={showMediaFunction}
                            setMsgToEdit={setMsgToEdit}
                        />
                    </div>

                    {/*input area and file prev area when uploading*/}
                    <div className='w-[85%]  mb-4 mx-auto flex flex-col '>

                        {/*  file  prev and cross file area */}

                        <div className='flex flex-row gap-2 flex-wrap  '>

                            {fileData.map((fileInfo, index) => (


                                // file prev area
                                <div key={index} className='relative'>

                                    {
                                        fileInfo.type === 'image' && (
                                            <img
                                                onClick={() => showMediaFunction(fileInfo.blobUrls, fileInfo.type)}
                                                src={fileInfo.blobUrls} className="object-cover  rounded-lg w-20 h-20 border"
                                            />
                                        )

                                    }

                                    {
                                        fileInfo.type === 'video' && (
                                            <video
                                                onClick={() => showMediaFunction(fileInfo.blobUrls, fileInfo.type)}
                                                className="object-cover rounded-lg w-20 h-20 border"
                                            // Allows play/pause
                                            >
                                                <source src={fileInfo.blobUrls} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        )
                                    }

                                    {
                                        fileInfo.type === 'application' && (
                                            <div className='w-20 h-20 rounded-lg border border-white/20 bg-white/5 flex flex-col items-center justify-center gap-1 p-2'>
                                                <i className="fa-solid fa-file text-2xl text-green-400"></i>
                                                <span className='text-xs text-white truncate w-full text-center'>{fileInfo.file.name.split('.').pop().toUpperCase()}</span>
                                            </div>
                                        )
                                    }


                                    {/* cross file */}

                                    <i
                                        className='fa-solid fa-plus rotate-45 rounded-full p-1  cursor-pointer bg-slate-100  text-black absolute top-[-10%] right-[-10%]'
                                        onClick={() => {
                                            const updatedFileData = fileData.filter((_, i) => i !== index);

                                            setFileData((prevData) => prevData.filter((_, i) => i !== index));

                                        }}
                                    ></i>

                                </div>


                            ))}
                        </div>


                        {/* Input area : textarea, button , media button */}
                        <div className='borde border-slate-400'>

                            <InputArea
                                setOutgoingMsg={setOutgoingMsg}
                                setMsgToEdit={setMsgToEdit}
                                msgToEdit={msgToEdit}
                                fileData={fileData}
                                setFileData={setFileData}



                            />
                        </div>


                    </div>




                </div>


                {/* large image modal */}

                <div className='h-[0rem] absolute top-[-999%]'>
                    <ModalImageShow modalOpen={showImg} setModalOpen={setShowImg} fileSrcType={fileSrcType} />
                </div>


            </div>
        ) : (

            <div className='w-full h-screen flex justify-center items-center relative bg-black '>
                <ModalSelectUser />
            </div>
        )

    )
}

export default Right




//DK3k%i84IjdsjfoiO