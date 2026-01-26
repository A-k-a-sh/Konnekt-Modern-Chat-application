import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import './ModalSelectUser.css';

import { useAllContext } from '../../../Context/AllContext';
import { useEffect, useState } from 'react';
import { useSocketConnection } from '../../../hooks';




export default function ModalSelectUser() {

    const [open, setOpen] = React.useState(true);

    const [selectedValue, setSelectedValue] = useState(null);

    const { userInfo, setUserInfo , setConnected_to, setJoined_groupsInfo, allUserInfo } = useAllContext()

    useSocketConnection({userId : selectedValue}, setUserInfo ,setConnected_to , setJoined_groupsInfo);

      

    const handleSelect = (userId) => {
        setSelectedValue(userId);
        setOpen(false);
    };







    useEffect(() => {
        if (userInfo) {
            setOpen(false)
        }

        const check = () => {
            if (!userInfo) {
                setOpen(true)
            }
            else {
                setOpen(false)
            }
        }


    }, [userInfo])

    //   if(!user){
    //     setOpen(true)
    //   }

    return (
        <React.Fragment>
            <Button style={{ backgroundColor: '#232222e6', color: 'white' }} variant="outlined" color="neutral" onClick={() => setOpen(true)}>
                Select id
            </Button>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={open}
                onClose={(event, reason) => {
                    // Prevent closing if no user is logged in
                    if (!userInfo && reason === 'backdropClick') {
                        return;
                    }
                }}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    variant="outlined"
                    //main outline box
                    sx={{ maxWidth: 500, borderRadius: 'md', p: 3, boxShadow: 'lg', backgroundColor: '#000' }}
                >
                    {/* <ModalClose variant="plain" sx={{ m: 1 }} /> */}
                    <Typography
                        component="h2"
                        id="modal-title"
                        level="h4"
                        textColor="inherit"
                        // title
                        sx={{ fontWeight: 'lg', mb: 1, backgroundColor: '#000', color: '#cacccc' }}
                    >
                        Select user
                    </Typography>

                    <div

                        className='h-[13rem] w-[20rem] overflow-auto rounded-md text-white bg-[#000]'

                        id="modal-desc" >
                        <div className="list-none">
                            {allUserInfo.map((user, index) => (
                                <li
                                    key={user.userId}
                                    className={`cursor-pointer px-4 py-3 border border-gray-700 hover:bg-[#232222e6] transition-colors flex items-center gap-3
              ${selectedValue === user.userId ? "bg-[#232222e6] text-white" : ""}`}
                                    onClick={() => handleSelect(user.userId)}

                                >
                                    <img 
                                        src={user.image || '/default-avatar.png'} 
                                        alt={user.userName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold">{user.userName}</p>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                    </div>
                                </li>
                            ))}
                        </div>
                    </div>
                </Sheet>
            </Modal>
        </React.Fragment>
    );
}
