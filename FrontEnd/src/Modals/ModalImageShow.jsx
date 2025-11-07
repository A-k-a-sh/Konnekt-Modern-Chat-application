import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { useAllContext } from '../Context/AllContext';
import { useEffect, useState } from 'react';

export default function ModalImageShow({ modalOpen, setModalOpen, fileSrcType }) {
    const src = 'https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg'

    const [selectedValue, setSelectedValue] = useState(null);
    const [open, setOpen] = React.useState(false);


    const { user, setUser } = useAllContext()

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
                    sx={{ borderRadius: 'md', p: 3, boxShadow: 'lg', backgroundColor: '#000' }}
                >
                    <ModalClose variant="plain" sx={{ m: 1, backgroundColor: 'white' }} />
                    <Typography
                        component="h2"
                        id="modal-title"
                        level="h4"
                        textColor="inherit"
                    // title

                    >

                    </Typography>

                    
                    <div

                        className='max-h-[40rem] max-w-[55rem] flex justify-center items-center overflow-auto '

                        id="modal-desc" 
                    >
                            
                        <div className=''>

                            {
                                fileSrcType.type === 'image' && (
                                    <img
                                        src={fileSrcType.src} alt="image"
                                        className=" object-cover object-center max-w-[55rem] max-h-[40rem]"
                                    />
                                )
                            }

                            {
                                fileSrcType.type === 'video' && (
                                    <video
                                        className="w-full h-full object-cover object-center"
                                        controls
                                    >
                                        <source src={fileSrcType.src} type="video/mp4" />

                                    </video>
                                )
                            }


                        </div>
                    </div>
                </Sheet>
            </Modal>
        </React.Fragment>
    );
}
