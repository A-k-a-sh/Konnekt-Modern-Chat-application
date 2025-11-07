import React, { useEffect, useState } from 'react'

import { allGroupsData } from './groupData';

import ModalAddNewGroup from '../../../../Modals/ModalAddNewGroup'

import { useAllContext } from '../../../../Context/AllContext';
import { useRightContext } from '../../Right Side/Right Context/RightContext';

const LeftBottomGroup = () => {

  const [modalOpen, setModalOpen] = useState(false);

  const {setSelectedUser , setSelectedGroup , selectedGroup , userInfo ,joined_groupsInfo} = useAllContext()

  

console.log(joined_groupsInfo);

  return (
    <div
      className='pt-2 px-1 borde h-full overflow-y-auto flex flex-col rounded-lg   bg-[#09071cc7]'
    >
      
      <div className='h-full  px-1 py-2'>
        {joined_groupsInfo.length &&
          joined_groupsInfo.map((group, index) => {

            return (

              <div 
              className={`${selectedGroup.groupId === group.groupId ? 'bg-[#191345c7] border-l-4 border-[#4c4587e2]' : 'hover:bg-[#70777c3f]'} Single_User h-[4rem]  flex flex-row gap-4 items-center px-1`} 
                key={index}
                onClick={() => {
                  setSelectedUser({})
                  setSelectedGroup(group)
                  
                  
                }}
              >
                
                <img className='w-12 h-12 rounded-full' src={group.groupImage} alt="" />
                <div>
                  <p>{group.groupName}</p>
                  <p className='text-xs text-slate-500'>Lorem, ipsum dolor.</p>
                </div>
              </div>
            )
          })
        }
      </div>

        {/* // add new group */}
      {/* <div 
        className="absolute bottom-10 left-3/4  border w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center group after:animate-bounce "
        onClick={() => setModalOpen(true)}
      >
        <i className="fa-solid fa-plus text-sky-600 text-2xl group-hover:rotate-180 duration-500" ></i>
      </div> */}


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