import React, { useEffect, useState } from 'react'

import { useAllContext } from '../../../Context/AllContext'

import './Left.css'
import { useRightContext } from '../Right Side/Right Context/RightContext'
import ModalUserSkeleton from '../../../Modals/ModalUserSkeleton'

const LeftBottomChat = () => {
    const src = 'https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg'


    const { selectedUser, setSelectedUser, setSelectedGroup, connected_to, userInfo } = useAllContext()

    const [showSkeleton, setShowSkeleton] = useState(true)

    useEffect(() => {
        if(Object.keys(connected_to).length > 0){
            setShowSkeleton(false)
        }
    }, [connected_to])


    return (

        <div className='pt-2 px-1 borde h-full overflow-y-auto flex flex-col rounded-lg   bg-[#19162d] '>
            {
                showSkeleton === true ? (
                    <ModalUserSkeleton />
                ) : (
                    <div className='pt-2 px-1 borde h-full overflow-y-auto flex flex-col rounded-lg   bg-[#19162d] '>

                        {userInfo && connected_to.map((user, index) => (
                            <div
                                key={index}
                                className={`${selectedUser?.userId === user?.userId ? 'bg-[#251b6ac7] border-l-4 border-[#4c4587e2]' : 'hover:bg-[#70777c3f]'} Single_User h-[4rem]  flex flex-row gap-4 items-center px-1`}
                                onClick={() => {
                                    setSelectedUser(user)
                                    setSelectedGroup({})

                                }}
                            >
                                <div className='rounded-full'>
                                    <img
                                        src={user?.profilePhoto} alt=""
                                        className='rounded-full w-12 h-12'
                                    />
                                </div>
                                <div>
                                    <p>{user?.userName}</p>
                                    <p className='text-xs text-slate-500'>Lorem, ipsum dolor.</p>
                                </div>

                            </div>
                        ))}


                    </div>
                )
            }
        </div>


    )
}

export default LeftBottomChat