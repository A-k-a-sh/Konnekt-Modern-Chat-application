import React, { useEffect, useState } from 'react'

import { Link, NavLink } from 'react-router-dom'

import { useAllContext } from '../../../Context/AllContext';
import ModalSearchGroupOrUser from '../../../Modals/ModalSearchGroupOrUser';

import { useLocation } from 'react-router-dom';

const LeftSideBar = () => {

  const { user, selectedGroup } = useAllContext()
  const navLinkClass = ({ isActive }) =>
    isActive ? 'bg-primary-500 rounded-lg ' : '';

  const [modalOpen, setModalOpen] = useState(false);

  const [info, setInfo] = useState({})
  const location = useLocation();
  const pathName = location.pathname;


  return (
    <div className='h-full w-full  borde border-red-400 '>

      <div className='h-full borde w-fit  pt-4 mx-auto'>

        <div className='flex flex-col flex-wrap gap-3 justify-center items-center  '>

          <NavLink

            className={({ isActive }) =>
              ` ${isActive ? 'border  ' : ''}  px-3 py-2 rounded-lg flex flex-row gap-1 items-center`
            }

            to="/"
          >

            <i className=" fa-solid fa-message text-[1rem]"></i>


          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `${isActive ? 'border' : ''}  px-3 py-2 rounded-lg  flex flex-row gap-1 items-center`
            }
            to="/group"
          >


            <i className="fa-solid fa-user-group text-[1rem]"></i>

          </NavLink>

        </div>
      </div>


      {/* search bar */}
      <div
        className='w-[90%]  h-fit mx-1 flex justify-center items-start my-3'
        onClick={() => setModalOpen(true)}
      >


        <input placeholder='Search' className='w-[100%] outline-none border-none rounded-lg h-[2rem] bg-zinc-600 px-2 py-1' type="text" />




      </div>


      <div className='absolute top-[9999px'>
        <ModalSearchGroupOrUser
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          name={pathName === '/group' ? 'group' : 'user'}

        />
      </div>

    </div>
  )
}

export default LeftSideBar