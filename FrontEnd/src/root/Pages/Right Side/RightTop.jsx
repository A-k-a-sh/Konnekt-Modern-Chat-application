import React, { useEffect, useState } from 'react'

import { useAllContext } from '../../../Context/AllContext'
import ModalUserSettings from '../../../Modals/ModalUserSettings'
import { useIsOnline } from './SocketConnection'
import { useRightContext } from './Right Context/RightContext'
import Avatar from '@mui/joy/Avatar';
import AvatarGroup from '@mui/joy/AvatarGroup';

import { useLocation } from 'react-router-dom'
import ModalDelSelectedMsg from '../../../Modals/ModalDelSelectedMsg'
import ModalForwardMsg from '../../../Modals/ModalForwardMsg'


function clampAvatars(avatars, options = { max: 5 }) {
  const { max = 5, total } = options;
  let clampedMax = max < 2 ? 2 : max;
  const totalAvatars = total || avatars.length;
  if (totalAvatars === clampedMax) {
    clampedMax += 1;
  }
  clampedMax = Math.min(totalAvatars + 1, clampedMax);
  const maxAvatars = Math.min(avatars.length, clampedMax - 1);
  const surplus = Math.max(totalAvatars - clampedMax, totalAvatars - maxAvatars, 0);
  return { avatars: avatars.slice(0, maxAvatars).reverse(), surplus };
}

const RightTop = () => {

  const dataFromTheServer = {
    people: [
      {
        alt: 'R',
        src: '/static/images/avatar/1.jpg',
      },
      {
        alt: 'Travis Howard',
        src: '/static/images/avatar/2.jpg',
      },
      {
        alt: 'Agnes Walker',
        src: '/static/images/avatar/4.jpg',
      },
      {
        alt: 'Trevor Henderson',
        src: '/static/images/avatar/5.jpg',
      },
    ],
    total: 24,
  };
  const { avatars, surplus } = clampAvatars(dataFromTheServer.people, {
    max: 5,
    total: dataFromTheServer.total,
  });

  const { MsgAreaDivRef, isMsgSelected, setIsMsgSelected, setSelectedMsg, selectedMsg } = useRightContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  

  const [forwardMsgModalOpen , setForwardMsgModalOpen] = useState(false)




  // console.log('in right top:', open);
  const { selectedUser, userInfo, isOnline, setIsOnline, selectedGroup , connected_to } = useAllContext()

  console.log(connected_to);

  useIsOnline(selectedUser, userInfo, setIsOnline)

  const [info, setInfo] = useState({})

  const path = useLocation().pathname;



  console.log(info);


  useEffect(() => {
    setInfo({
      ...selectedUser,
      path: path,
      selectedGroup: selectedGroup
    });
  }, [selectedUser, selectedGroup]);


  return (
    <div
      className=' h-full w-full flex items-center bg-blue-600/10 backdrop-blur-md  '
    >

      {!isMsgSelected ? (
        <div
          className=' max-h-3/4    max-w-64 ml-1   zinc-700 py-1 px-4  rounded-lg hover:bg-zinc-600 duration-500 cursor-pointer  flex flex-row gap-4  justify-start items-center'
          onClick={() => setModalOpen(true)}
        >

          <div className='relative'>
            <img className='w-12 h-12 rounded-full' src={info.selectedGroup?.groupImage || info.profilePhoto} alt="" />

            <div className='absolute -bottom-1 -right-1 '>
              <i className={`fa-solid fa-circle pr-1 ${isOnline ? 'text-green-400' : 'text-zinc-400'} `}></i>
            </div>
          </div>

          <div className='flex  flex-col jucent-center  '>
            <p>{selectedUser.userName || info.selectedGroup?.groupName} </p>


            {
              info.selectedGroup?.groupMembers ? (
                <AvatarGroup
                  color='neutral'
                  variant='soft'
                  size='sm'

                // className='flex flex-row gap-1 borde  '
                >
                  {avatars.map((avatar) => (
                    <Avatar key={avatar.alt} {...avatar} > {avatar.alt[0]} </Avatar>
                  ))}
                  {!!surplus && <Avatar size='sm'>+{surplus}</Avatar>}
                </AvatarGroup>
              ) : (
                <p className='text-xs borde text-zinc-500'>
                  Status : {isOnline ? 'Online' : 'Offline'}

                </p>
              )
            }
          </div>




        </div>

      ) : (
        <div className='flex flex-row justify-between items-center  px-2 w-full'>

          <div className='flex flex-row gap-4 px-2 '>

            {selectedMsg.some((msg) => msg.chatType === 'group' && msg.sender.userId !== userInfo.userId) ? (
               
              null
            ) : (
              <div 
               className=' bg-gray-500/30 px-3 py-2 rounded-lg flex flex-row items-center hover:bg-gray-500/65 cursor-pointer duration-150'
               onClick={()=> setDeleteModalOpen(true)}
             >
               <i className="fa-solid fa-trash px-2 py-1   w-fit h-fit"></i>
               <p>Delete</p>
             </div>
            )
          }
           

            <div 
              className='bg-gray-500/30 px-3 py-2 rounded-lg flex flex-row items-center hover:bg-gray-500/65 cursor-pointer duration-150'
              onClick={() => setForwardMsgModalOpen(true)}
            >
              <i className={`fa-solid fa-share px-2 py-1 rounded-full hover:bg-gray-600 w-fit h-fit `}></i>
              <p>Forward</p>
            </div>

          </div>
          <div className='flex flex-row gap-3 items-center  mr-3'>
            <p>{selectedMsg?.length} Message selected</p>


            <div
              className='flex flex-row gap-3 items-center px-3 cursor-pointer rounded-lg py-1 hover:bg-gray-600/80'
              onClick={() => {
                setSelectedMsg([])

              }}
            >
              <i class="fa-solid fa-xmark"></i>
              <p>Cancel</p>
            </div>
          </div>

        </div >

      )}





      <div className='hidden'>
        {
          (Object.keys(selectedGroup).length || Object.keys(selectedUser).length) &&
          <ModalUserSettings
            setModalOpen={setModalOpen}
            modalOpen={modalOpen}
            MsgAreaDivRef={MsgAreaDivRef}
            infoFromRightTop={info}

          />
        }

      </div>

      <div className=''>

        <ModalDelSelectedMsg
         deleteModalOpen={deleteModalOpen}
         setDeleteModalOpen={setDeleteModalOpen}

        />
        
      </div>

      <div className=''>
        <ModalForwardMsg
          forwardMsgModalOpen={forwardMsgModalOpen}
          setForwardMsgModalOpen={setForwardMsgModalOpen}
          selectedMsg = {selectedMsg}
          setSelectedMsg = {setSelectedMsg}


        />
      </div>



    </div >
  )
}

export default RightTop