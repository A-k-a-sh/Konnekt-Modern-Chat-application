import React, { useContext, useEffect, useState } from 'react'
import { Button, Modal } from 'antd';

import { delSelectedMsg, handleSelectedMsg } from '../root/Pages/Right Side/SocketConnection';


import './Modal.css'

import { useAllContext } from '../Context/AllContext';
import { useRightContext } from '../root/Pages/Right Side/Right Context/RightContext';


function ModalDelSelectedMsg({ deleteModalOpen, setDeleteModalOpen }) {



    const { selectedUser, userInfo: curUserInfo, selectedGroup, allMessages, setAllMessages } = useAllContext()
    const { selectedMsg, setSelectedMsg, setIsMsgSelected } = useRightContext()

    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('Are you sure you want to delete this message?');


    handleSelectedMsg(selectedMsg, setAllMessages)

    const showModal = () => {
        setDeleteModalOpen(true);
    };
    const handleOk = () => {
        setModalText('Deleting Messages...');
        setConfirmLoading(true);

        setTimeout(() => {

            delSelectedMsg(selectedMsg, setAllMessages, curUserInfo, selectedGroup, selectedUser)


            setDeleteModalOpen(false);
            setConfirmLoading(false);
            setModalText('Are you sure you want to delete this message?');
            setIsMsgSelected(false)
            setSelectedMsg([])
        }, 2000);
    };
    const handleCancel = () => {
        console.log('Clicked cancel button');
        setDeleteModalOpen(false);
    };

    return (
        <>
            <Modal
                open={deleteModalOpen}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                className="custom-ant-modal-delete"
                centered
                footer={[
                    <button
                        key="cancel"
                        onClick={handleCancel}
                        className='px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white transition-all duration-200 mr-2'
                    >
                        Cancel
                    </button>,
                    <button
                        key="delete"
                        onClick={handleOk}
                        disabled={confirmLoading}
                        className='px-6 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {confirmLoading ? 'Deleting...' : 'Delete'}
                    </button>
                ]}
            >
                <div className='flex items-center gap-4 py-4'>
                    <div className='w-12 h-12 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center flex-shrink-0'>
                        <i className="fa-solid fa-trash text-red-400 text-xl"></i>
                    </div>
                    <p className='text-white text-lg'>{modalText}</p>
                </div>
            </Modal>
        </>
    )
}

export default ModalDelSelectedMsg