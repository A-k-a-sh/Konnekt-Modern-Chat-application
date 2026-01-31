import React, { useEffect, useState } from 'react'

import { Link, NavLink } from 'react-router-dom'

import { useAllContext } from '../../../Context/AllContext';
import ModalSearchGroupOrUser from '../../../Modals/ModalSearchGroupOrUser';
import ModalAddNewGroup from '../../../Modals/ModalAddNewGroup';
import NotificationBell from '../../../Components/Notification/NotificationBell';
import { useNotificationSocket } from '../../../hooks/useNotificationSocket';

import { useLocation } from 'react-router-dom';

const LeftSideBar = () => {

  const { user, selectedGroup } = useAllContext()
  const navLinkClass = ({ isActive }) =>
    isActive ? 'bg-primary-500 rounded-lg ' : '';

  const [modalOpen, setModalOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  const [info, setInfo] = useState({})
  const location = useLocation();
  const pathName = location.pathname;

  // Initialize notification socket listeners
  useNotificationSocket();


  return (
    <div className='h-full w-full bg-gradient-to-b from-[#1a1a2e] to-[#16213e] relative overflow-hidden'>

      {/* Decorative gradient orbs */}
      <div className='absolute top-0 left-0 w-20 h-20 bg-purple-600/20 rounded-full blur-3xl'></div>
      <div className='absolute bottom-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-3xl'></div>

      <div className='h-full w-full relative z-10 flex flex-col'>

        {/* Navigation Icons */}
        <div className='flex flex-col gap-4 justify-center items-center pt-6 pb-4'>

          <NavLink
            className={({ isActive }) =>
              `group relative px-3 py-3 rounded-xl transition-all duration-300 ${isActive
                ? 'bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50'
                : 'bg-white/5 hover:bg-white/10 hover:scale-110'
              }`
            }
            to="/"
          >
            <i className="fa-solid fa-message text-[1.2rem] transition-transform duration-300 group-hover:scale-110"></i>

            {/* Tooltip */}
            <span className='absolute left-full ml-2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>
              Chats
            </span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `group relative px-3 py-3 rounded-xl transition-all duration-300 ${isActive
                ? 'bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50'
                : 'bg-white/5 hover:bg-white/10 hover:scale-110'
              }`
            }
            to="/group"
          >
            <i className="fa-solid fa-user-group text-[1.2rem] transition-transform duration-300 group-hover:scale-110"></i>

            {/* Tooltip */}
            <span className='absolute left-full ml-2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>
              Groups
            </span>
          </NavLink>
          {/* Notification Bell */}
          <NotificationBell />
        </div>

        {/* Divider */}
        <div className='w-[70%] mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent'></div>

        {/* Search Bar */}
        <div className='px-2 py-4'>
          <div
            className='relative group cursor-pointer'
            onClick={() => setModalOpen(true)}
          >
            <div className='absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

            <div className='relative flex items-center bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-all duration-300 border border-white/10 hover:border-purple-500/50'>
              <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm mr-2"></i>
              <input
                placeholder='Search...'
                className='w-full outline-none border-none bg-transparent text-sm text-gray-300 placeholder-gray-500 cursor-pointer'
                type="text"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Add New Button (Floating at bottom) */}
        <div className='mt-auto mb-4 px-2'>
          <button
            onClick={() => {
              // Open create group modal when on group route, otherwise open search modal
              if (pathName === '/group') {
                setCreateGroupModalOpen(true);
              } else {
                setModalOpen(true);
              }
            }}
            className='w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 flex items-center justify-center gap-2 group'
          >
            <i className="fa-solid fa-plus text-sm group-hover:rotate-90 transition-transform duration-300"></i>
            <span className='text-xs font-medium'>
              {pathName === '/group' ? 'New Group' : 'New'}
            </span>
          </button>
        </div>

      </div>

      {/* Modals */}
      <div className='absolute top-[9999px]'>
        <ModalSearchGroupOrUser
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          name={pathName === '/group' ? 'group' : 'user'}
        />
        <ModalAddNewGroup
          modalOpen={createGroupModalOpen}
          setModalOpen={setCreateGroupModalOpen}
        />
      </div>

    </div>
  )
}

export default LeftSideBar