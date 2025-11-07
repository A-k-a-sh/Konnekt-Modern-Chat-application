import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { useAllContext } from '../Context/AllContext';
import { useEffect, useState } from 'react';

export default function ModalAddNewGroup({ modalOpen, setModalOpen }) {
    const src = 'https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg'
    const [open, setOpen] = React.useState(false);


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
                        Add New Group
                    </Typography>
                    
                    <div
                        id="modal-desc" 

                        className='h-[26rem] w-[35rem] overflow-auto'
                    >
                        <div className=' w-full h-full border'>

                            <div className>
                                Enter Group Name
                                <input type="text"  className=''/>
                            </div>

                            <div className>
                                Enter Group Description
                                <input type="text"  className=''/>
                            </div>
                            
                        </div>


                    </div>
                </Sheet>
            </Modal>
        </React.Fragment>
    );
}
