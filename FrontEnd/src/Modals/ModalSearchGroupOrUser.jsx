import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { useAllContext } from '../Context/AllContext';
import { useEffect, useState } from 'react';


export default function ModalSearchGroupOrUser({ modalOpen, setModalOpen, info, name }) {
    const src = 'https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg'
    const [open, setOpen] = React.useState(false);

    const {user : curUser , allGroupsData , setAllGroupsData} = useAllContext()

    const [inputFieldVal, setInputFieldVal] = useState('')

    


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



    const isGroupJoined = (grp) => {
      return grp.groupMembers.find((member) => {
        return member.userId === curUser
      })
    }

    const isInGroupJoinRequest = (grp) => {
        
      return grp.groupJoinRequests.find((member) => {
        return member.userId === curUser
      })
    }


    const wantToJoin = (grp) => {
        const userId = curUser

        setAllGroupsData((prev) => prev.map((g) => {
            if (g.groupId === grp.groupId) {
                return { ...g, groupJoinRequests: [...g.groupJoinRequests, { userId }] }
            }
            return g
        }))
        
        //allGroupsData = allGroupsData //won't change

        // grp.groupJoinRequests.push({
        //     userId : userId
        // })
    }

    const cancelJoinRequest = (grp) => {
        const userId = curUser

        setAllGroupsData((prev) => prev.map((g) => {
            if (g.groupId === grp.groupId) {
                return { ...g, groupJoinRequests: g.groupJoinRequests.filter((member) => {
                    return member.userId !== userId
                }) }
            }
            return g
        }))

        //allGroupsData = allGroupsData //won't change

        // grp.groupJoinRequests = grp.groupJoinRequests.filter((member) => {
        //     return member.userId !== userId
        // })
    }


    
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
                    // variant="outlined"
                    //main outline box
                    sx={{

                        borderRadius: 'md', p: 3,
                        boxShadow: 'lg',
                        backgroundColor: 'rgb(0, 0, 0 , 0.0)',
                        // backdropFilter: 'blur(0px)',
                        // border:'1px solid beige',
                        display: 'block',
                        height: 'fit-content',
                        width: 'fit-content',
                        position: 'relative'

                    }}
                >
                    <ModalClose variant="plain" sx={{ m : 1, position: 'absolute', top: '-0.6rem', right: '0rem' , backgroundColor: 'white' }} />

                    <Typography
                        component="h2"
                        id="modal-title"
                        level="h4"
                        textColor="inherit"
                        // title
                        sx={{ 
                            fontWeight: 'lg',  
                            backgroundColor: 'none', 
                            color: '#cacccc' , 
                            // border:'2px solid red' 
                        }}
                    >
                        Search for {name.toUpperCase()}s
                    </Typography>
                    <div
                        className='max-h-[30rem] w-[45rem] overflow-auto  text-white'

                        id="modal-desc" 
                    >
                        <div className=' w-full h-full  overflow-auto flex flex-col items-center  '>

                            <div className='w-[90%] mx-auto '>
                                <input
                                    type="text"
                                    className='w-full mt-3  rounded-md  bg-neutral-700 outline-none border-zinc-600 py-3 px-2'
                                    placeholder={`Search for ${name}s...`}
                                    onChange={(e) => setInputFieldVal(e.target.value)}
                                />
                            </div>

                            <div className='w-[90%] mx-auto mt-3 rounded-lg '>

                                {
                                    allGroupsData.filter((grp) => {
                                        return grp.groupName.toLowerCase().includes(inputFieldVal) || grp.groupId === inputFieldVal
                                    }).map((grp) => {
                                        return (
                                            <div
                                                key={grp.groupId}
                                                className='w-full flex flex-row justify-between rounded-sm duration-300 hover:scale-[1.02] hover:rounded-xl   bg-zinc-800 outline-none border-b-[1px] border-zinc-600 py-3 px-4 hover:bg-zinc-700'
                                            >
                                                <div>
                                                {grp.groupName}
                                                </div>

                                                <div  //this div contains only one div

                                                    className={`
                                                    `}
                                                >
                                                    { isGroupJoined(grp) ? (
                                                        <div className='bg-gray-600 cursor-not-allowed px-3 py-2 rounded-lg'>
                                                            joined
                                                        </div>
                                                    ): isInGroupJoinRequest(grp) ? (
                                                        <div className='flex flex-row gap-2'>

                                                            <div className='cursor-not-allowed px-3 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500'>
                                                                pending
                                                            </div>

                                                            <div 
                                                                className='bg-red-600 hover:bg-red-500 cursor-pointer px-3 py-2 rounded-lg'
                                                                onClick={() => cancelJoinRequest(grp)}>
                                                                Cancel request
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div 
                                                            className='bg-sky-600  hover:bg-sky-500 cursor-pointer px-3 py-2 rounded-lg'
                                                            onClick={() => {
                                                                wantToJoin(grp)
                                                            }}

                                                        >
                                                            join
                                                        </div>
                                                    )
                                                }
                                                </div>

                                            </div>
                                        )
                                    })

                                }

                            </div>

                        </div>




                    </div>
                </Sheet>
            </Modal>
        </React.Fragment>
    );
}
