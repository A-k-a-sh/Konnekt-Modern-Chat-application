import React, { useEffect, useState } from 'react'

import { allGroupsData } from './groupData';

import ModalAddNewGroup from '../../../../Modals/ModalAddNewGroup'

import { useAllContext } from '../../../../Context/AllContext';
import { useRightContext } from '../../Right Side/Right Context/RightContext';

const LeftBottomGroup = () => {

  const [modalOpen, setModalOpen] = useState(false);

  const { setSelectedUser, setSelectedGroup, selectedGroup, userInfo, joined_groupsInfo } = useAllContext()



  console.log(joined_groupsInfo);

  return (
    <div className='h-full overflow-hidden flex flex-col bg-gradient-to-b from-[#0f0e1a] to-[#1a1a2e] rounded-lg'>

      <div className='flex-1 overflow-y-auto flex flex-col space-y-1 p-2'>
        {joined_groupsInfo.length &&
          joined_groupsInfo.map((group, index) => {

            return (

              <div
                className={`
                  flex-shrink-0 group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer
                  ${selectedGroup.groupId === group.groupId
                    ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-l-4 border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'bg-white/5 hover:bg-white/10 hover:shadow-md'
                  }
                `}
                key={index}
                onClick={() => {
                  setSelectedUser({})
                  setSelectedGroup(group)
                }}
              >
                {/* Hover gradient effect */}
                <div className='absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                <div className='relative flex items-center gap-3 p-3'>
                  {/* Group Avatar */}
                  <div className='relative flex-shrink-0'>
                    <div className='w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-purple-500/50 transition-all duration-300'>
                      <img
                        className='w-full h-full object-cover'
                        src={group.groupImage}
                        alt={group.groupName}
                      />
                    </div>
                    {/* Member count badge */}
                    <div className='absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#1a1a2e]'>
                      {group.members?.length || '0'}
                    </div>
                  </div>

                  {/* Group info */}
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-white text-sm truncate group-hover:text-purple-200 transition-colors'>
                      {group.groupName}
                    </p>
                    <p className='text-xs text-gray-400 truncate mt-0.5'>
                      {group.members?.length || 0} members
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  {selectedGroup.groupId !== group.groupId && (
                    <div className='flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <i className="fa-solid fa-chevron-right text-xs text-gray-400"></i>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        }

        {/* Empty state */}
        {joined_groupsInfo.length === 0 && (
          <div className='flex flex-col items-center justify-center h-full text-center p-6'>
            <div className='w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4'>
              <i className="fa-solid fa-user-group text-2xl text-gray-500"></i>
            </div>
            <p className='text-gray-400 text-sm'>No groups yet</p>
            <p className='text-gray-500 text-xs mt-1'>Create or join a group to start</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <div className='absolute top-[9999px]'>
        <ModalAddNewGroup
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
        />
      </div>

    </div>
  )
}

export default LeftBottomGroup