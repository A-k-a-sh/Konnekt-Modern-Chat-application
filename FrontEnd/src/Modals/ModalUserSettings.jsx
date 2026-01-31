import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { useAllContext } from '../Context/AllContext';
import { useEffect, useState } from 'react';

export default function ModalUserSettings({ modalOpen, setModalOpen, MsgAreaDivRef, infoFromRightTop }) {
    const src = 'https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg'

    const [selectedValue, setSelectedValue] = useState(null);
    const [open, setOpen] = React.useState(false);

    const bgImageSrc = [
        'https://images.unsplash.com/photo-1520531158340-44015069e78e?q=80&w=3072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',


        'https://images.unsplash.com/photo-1594292226956-b227b6fe7be1?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',


        'https://images.unsplash.com/photo-1631555641489-e9b5f52d3e1f?q=80&w=2980&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',


        'https://images.unsplash.com/photo-1533497197926-c9e810dcea9a?q=80&w=3137&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',

        'https://images.unsplash.com/photo-1622976480059-1e341a28786e?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',

        'https://images.unsplash.com/photo-1551794804-840faad68ba9?q=80&w=3135&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',

        'https://plus.unsplash.com/premium_photo-1686309673130-36e6a28333a3?q=80&w=3027&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',

        'https://images.unsplash.com/photo-1628498188873-579210ce622e?q=80&w=2268&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',

        'https://images.unsplash.com/photo-1544941224-f7f40bb3b3c8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',

        'https://images.unsplash.com/photo-1519873174361-37788c5a73c7?q=80&w=2746&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',

        'https://images.unsplash.com/photo-1567360425618-1594206637d2?q=80&w=2160&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',

        'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?q=80&w=2267&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'


    ]

    const { user: currentUser, setUser, selectedUser, allGroupsData, setAllGroupsData } = useAllContext()

    //console.log('in modal:', open);

    const close = () => {
        setOpen(false);
    }

    const handleClick = () => {
        setOpen(false);
        setModalOpen(false)
    };

    useEffect(() => {
        if (modalOpen) {
            setOpen(true)
        }

    }, [modalOpen])
    return (
        <React.Fragment>


            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={open}
                onClose={handleClick}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    variant="outlined"
                    //main outline box
                    sx={{

                        borderRadius: 'md', p: 3,
                        boxShadow: 'lg',
                        backgroundColor: '#000',
                        // border: '1px solid red'

                    }}
                >
                    <ModalClose variant="plain" sx={{ m: 1 }} />
                    <Typography
                        component="h2"
                        id="modal-title"
                        level="h4"
                        textColor="inherit"
                        // title
                        sx={{ fontWeight: 'lg', mb: 1, backgroundColor: '#000', color: '#cacccc' }}
                    >
                        User Profile : {selectedUser.userName}
                    </Typography>

                    <div

                        className='h-[26rem] w-[35rem] overflow-auto'

                        id="modal-desc" 
                    >
                        <div className=''>

                            <div className='w-full  mt-1 '>
                                <img className='w-20 h-20 mx-auto rounded-full' src={infoFromRightTop.groupInfo?.groupImage || src} alt="" />
                            </div>

                            <div className='mt-2'>
                                <p className='text-center text-zinc-500'>Username : {selectedUser.userName}</p>
                                <p className='text-center text-zinc-500'>Email : {selectedUser.email}</p>

                                <p className='text-center text-zinc-500'>Joined on :</p>
                                <p className='text-center text-zinc-500'>Bio</p>
                                <Button
                                    variant='primary'
                                    style={{ border: '1px solid #e5e7eb', borderRadius: '0.4rem' }}
                                >
                                    Add
                                </Button>
                            </div>

                            <p className='text-center text-xl text-zinc-500 underline'>Change Background</p>
                            
                            {/* Reset to default gradient button */}
                            <div className='w-full mt-2 flex justify-center'>
                                <Button
                                    onClick={() => {
                                        if (MsgAreaDivRef.current) {
                                            MsgAreaDivRef.current.style.backgroundImage = ''
                                            MsgAreaDivRef.current.style.backgroundPosition = ''
                                            MsgAreaDivRef.current.style.backgroundSize = ''
                                            MsgAreaDivRef.current.style.backgroundRepeat = ''
                                        }
                                    }}
                                    variant='soft'
                                    color='neutral'
                                >
                                    Reset to Default Gradient
                                </Button>
                            </div>

                            <div className='w-full mt-2 p-2 rounded-md flex flex-row flex-wrap justify-start items-center bg-neutral-800 gap-3 '>
                                {/* // change background image */}
                                {
                                    bgImageSrc.map((src, index) => (
                                        <div
                                            key={index}
                                            className='cursor-pointer loading-lazy'
                                            onClick={() => {
                                                if (MsgAreaDivRef.current) {
                                                    MsgAreaDivRef.current.style.backgroundImage = `url(${src})`
                                                    MsgAreaDivRef.current.style.backgroundPosition = 'center'
                                                    MsgAreaDivRef.current.style.backgroundSize = 'cover'
                                                    MsgAreaDivRef.current.style.backgroundRepeat = 'no-repeat'
                                                }
                                            }}
                                        >
                                            <img className='w-20 h-20 loading-lazy mx-auto rounded-full object-cover object-center ' src={src} alt="" />
                                        </div>
                                    ))
                                }
                            </div>


                            {/* // group join requests */}

                            {
                                (infoFromRightTop.path === '/group' && infoFromRightTop.groupInfo?.adminId === currentUser) && (
                                    <div className="bg-zinc-800 p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
                                        <h2 className="text-2xl font-semibold text-white mb-4">Pending Join Requests</h2>

                                        <div className="space-y-4">
                                            {infoFromRightTop.groupInfo?.groupJoinRequests.map((member) => (
                                                <div
                                                    key={member.userId}
                                                    className="flex items-center justify-between bg-zinc-700 p-4 rounded-lg shadow-sm hover:bg-zinc-600 transition-all"
                                                >
                                                    {/* Member Image */}
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={member.image || 'default-avatar.png'}
                                                            alt={member.userId}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                        <p className="text-white text-lg">{member.userId}</p>
                                                    </div>

                                                    {/* Accept / Reject Buttons */}
                                                    <div className="flex space-x-4">
                                                        {/* Accept Button */}
                                                        <button
                                                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                                                            onClick={() => acceptRequest(member.userId)}
                                                        >
                                                            Accept
                                                        </button>

                                                        {/* Reject Button */}
                                                        <button
                                                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                                                            onClick={() => rejectRequest(member.userId)}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }







                        </div>


                    </div>
                </Sheet>
            </Modal>
        </React.Fragment>
    );
}
