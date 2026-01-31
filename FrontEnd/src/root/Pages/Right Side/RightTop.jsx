import React, { useEffect, useState } from 'react'

import { useAllContext } from '../../../Context/AllContext'
import { usePanelContext } from '../../../Context/PanelContext'
import { useIsOnline } from '../../../hooks'
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

  const { selectedUser, selectedGroup, userInfo: info } = useAllContext()
  const { togglePanel } = usePanelContext()
  const { isMsgSelected, selectedMsg, setSelectedMsg, setIsMsgSelected } = useRightContext()

  const location = useLocation()

  const [isOnline, setIsOnline] = useState(false)
  useIsOnline(selectedUser, info, setIsOnline)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [forwardMsgModalOpen, setForwardMsgModalOpen] = useState(false)

  // Get real group member avatars
  const getGroupAvatars = () => {
    if (!selectedGroup?.groupMembers) return { avatars: [], surplus: 0 };
    
    const members = selectedGroup.groupMembers.map(member => ({
      alt: member.userName || 'User',
      src: member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.userName || 'User')}&background=random&size=32`,
    }));
    
    return clampAvatars(members, {
      max: 4,
      total: selectedGroup.groupMembers.length,
    });
  };

  const { avatars, surplus } = getGroupAvatars();


  const handleForward = () => {
    setForwardMsgModalOpen(true)
  }



  return (
    <div className='h-full w-full flex items-center bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] border-b border-white/10 backdrop-blur-xl shadow-lg'>

      {!isMsgSelected ? (
        <div
          className='group max-h-3/4 max-w-64 ml-4 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 duration-300 cursor-pointer flex flex-row gap-4 justify-start items-center transition-all hover:shadow-lg hover:shadow-purple-500/20'
          onClick={togglePanel}
        >

          <div className='relative'>
            <div className='w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/20 group-hover:ring-purple-500/50 transition-all duration-300'>
              <img 
                className='w-full h-full object-cover' 
                src={
                  selectedGroup?.groupImage 
                    ? selectedGroup.groupImage 
                    : selectedGroup?.groupName 
                      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedGroup.groupName)}&background=random`
                      : selectedUser?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.userName || 'User')}&background=random`
                } 
                alt="" 
              />
            </div>

            <div className='absolute -bottom-1 -right-1'>
              <div className={`w-3.5 h-3.5 rounded-full border-2 border-[#1a1a2e] ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            </div>
          </div>

          <div className='flex flex-col justify-center'>
            <p className='font-medium text-white group-hover:text-purple-200 transition-colors'>{selectedUser?.userName || selectedGroup?.groupName}</p>


            {
              selectedGroup?.groupMembers && avatars.length > 0 ? (
                <div className='flex items-center -space-x-2'>
                  {avatars.map((avatar, index) => (
                    <img 
                      key={index}
                      src={avatar.src} 
                      alt={avatar.alt}
                      className='w-6 h-6 rounded-full border-2 border-[#1a1a2e] object-cover'
                      title={avatar.alt}
                    />
                  ))}
                  {!!surplus && (
                    <div className='w-6 h-6 rounded-full bg-purple-600 border-2 border-[#1a1a2e] flex items-center justify-center text-white text-xs font-medium'>
                      +{surplus}
                    </div>
                  )}
                </div>
              ) : selectedGroup?.groupMembers ? (
                <p className='text-xs text-gray-400'>
                  {selectedGroup.groupMembers.length} members
                </p>
              ) : (
                <p className='text-xs text-gray-400'>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              )
            }
          </div>




        </div>

      ) : (
        <div className='flex flex-row justify-between items-center px-4 w-full'>

          <div className='flex flex-row gap-3'>

            {selectedMsg.some((msg) => msg.chatType === 'group' && msg.sender.userId !== userInfo.userId) ? (

              null
            ) : (
              <button
                className='bg-gradient-to-r from-red-600/20 to-red-500/20 hover:from-red-600/30 hover:to-red-500/30 border border-red-500/30 hover:border-red-500/50 px-4 py-2 rounded-lg flex flex-row items-center gap-2 cursor-pointer duration-300 transition-all hover:shadow-lg hover:shadow-red-500/20'
                onClick={() => setDeleteModalOpen(true)}
              >
                <i className="fa-solid fa-trash text-red-400"></i>
                <p className='text-white font-medium text-sm'>Delete</p>
              </button>
            )
            }


            <button
              className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-purple-500/30 hover:border-purple-500/50 px-4 py-2 rounded-lg flex flex-row items-center gap-2 cursor-pointer duration-300 transition-all hover:shadow-lg hover:shadow-purple-500/20'
              onClick={() => setForwardMsgModalOpen(true)}
            >
              <i className="fa-solid fa-share text-purple-400"></i>
              <p className='text-white font-medium text-sm'>Forward</p>
            </button>

          </div>
          <div className='flex flex-row gap-4 items-center'>
            <p className='text-gray-300 text-sm'><span className='font-bold text-purple-400'>{selectedMsg?.length}</span> selected</p>


            <button
              className='flex flex-row gap-2 items-center px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer transition-all duration-300'
              onClick={() => {
                setSelectedMsg([])

              }}
            >
              <i className="fa-solid fa-xmark text-gray-400"></i>
              <p className='text-white text-sm'>Cancel</p>
            </button>
          </div>

        </div >

      )}




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
          selectedMsg={selectedMsg}
          setSelectedMsg={setSelectedMsg}


        />
      </div>



    </div >
  )
}

export default RightTop