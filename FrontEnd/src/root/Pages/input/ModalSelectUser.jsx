import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import './ModalSelectUser.css';

import { useAllContext } from '../../../Context/AllContext';
import { useEffect, useState } from 'react';
import { useSocketConnection } from '../Right Side/SocketConnection';




export default function ModalSelectUser() {

    const [open, setOpen] = React.useState(true);

    const [selectedValue, setSelectedValue] = useState(null);

    const { userInfo, setUserInfo , setConnected_to, setJoined_groupsInfo } = useAllContext()

    useSocketConnection({userId : selectedValue}, setUserInfo ,setConnected_to , setJoined_groupsInfo);

      

    const handleSelect = (value) => {



        setSelectedValue(value);

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
                onClose={() => { if (!user) check }}
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
                            {[1, 2, 3, 4, 5].map((item, index) => (
                                <li
                                    key={index}
                                    className={`cursor-pointer px-4 py-2 border 
              ${selectedValue === item ? "bg-[#232222e6] text-white" : null}`}
                                    onClick={() => handleSelect(item)}

                                >
                                    {item}
                                </li>
                            ))}
                        </div>
                    </div>
                </Sheet>
            </Modal>
        </React.Fragment>
    );
}
