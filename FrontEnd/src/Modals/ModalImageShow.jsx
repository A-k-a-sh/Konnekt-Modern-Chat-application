import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { useAllContext } from '../Context/AllContext';
import { useEffect, useState } from 'react';

export default function ModalImageShow({ modalOpen, setModalOpen, fileSrcType, allMedia = [] }) {
    const src = 'https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg'

    const [selectedValue, setSelectedValue] = useState(null);
    const [open, setOpen] = React.useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);


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
            // Find the index of the current media in allMedia array
            if (allMedia.length > 0) {
                const index = allMedia.findIndex(media => media.src === fileSrcType.src);
                setCurrentIndex(index !== -1 ? index : 0);
            }
        }

    }, [modalOpen, fileSrcType, allMedia])

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < allMedia.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const currentMedia = allMedia.length > 0 ? allMedia[currentIndex] : fileSrcType;
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < allMedia.length - 1;

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
                    sx={{
                        borderRadius: '16px',
                        p: 2,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        background: 'linear-gradient(135deg, #0a0a15 0%, #1a1a2e 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        position: 'relative',
                        maxWidth: '90vw',
                        maxHeight: '90vh'
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={handleClick}
                        className='absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110 group'
                    >
                        <i className="fa-solid fa-xmark text-white group-hover:text-red-400 transition-colors"></i>
                    </button>

                    {/* Counter */}
                    {allMedia.length > 1 && (
                        <div className='absolute top-4 left-4 z-50 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-sm'>
                            {currentIndex + 1} / {allMedia.length}
                        </div>
                    )}


                    <div
                        className='max-h-[85vh] max-w-[85vw] flex justify-center items-center overflow-hidden relative'
                        id="modal-desc"
                    >
                        {/* Previous button */}
                        {allMedia.length > 1 && hasPrevious && (
                            <button
                                onClick={handlePrevious}
                                className='absolute left-4 z-40 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 hover:border-purple-500/50 flex items-center justify-center transition-all duration-200 hover:scale-110 group'
                            >
                                <i className="fa-solid fa-chevron-left text-white group-hover:text-purple-400 transition-colors text-xl"></i>
                            </button>
                        )}

                        {/* Media content */}
                        <div className='flex items-center justify-center'>

                            {
                                currentMedia.type === 'image' && (
                                    <img
                                        src={currentMedia.src}
                                        alt="image"
                                        className="object-contain object-center max-w-[80vw] max-h-[80vh] rounded-lg"
                                    />
                                )
                            }

                            {
                                currentMedia.type === 'video' && (
                                    <video
                                        className="object-contain object-center max-w-[80vw] max-h-[80vh] rounded-lg"
                                        controls
                                        autoPlay
                                    >
                                        <source src={currentMedia.src} type="video/mp4" />

                                    </video>
                                )
                            }


                        </div>

                        {/* Next button */}
                        {allMedia.length > 1 && hasNext && (
                            <button
                                onClick={handleNext}
                                className='absolute right-4 z-40 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 hover:border-purple-500/50 flex items-center justify-center transition-all duration-200 hover:scale-110 group'
                            >
                                <i className="fa-solid fa-chevron-right text-white group-hover:text-purple-400 transition-colors text-xl"></i>
                            </button>
                        )}
                    </div>

                    {/* Media info */}
                    {currentMedia.caption && (
                        <div className='mt-4 px-4 py-3 rounded-lg bg-white/5 border border-white/10'>
                            <p className='text-white text-sm'>{currentMedia.caption}</p>
                        </div>
                    )}
                </Sheet>
            </Modal>
        </React.Fragment>
    );
}
