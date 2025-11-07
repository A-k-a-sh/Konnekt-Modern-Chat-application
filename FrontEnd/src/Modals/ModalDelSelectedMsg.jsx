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

            delSelectedMsg(selectedMsg , setAllMessages , curUserInfo , selectedGroup , selectedUser )
        

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
                className="custom-ant-modal"
            >
                <p>{modalText}</p>
            </Modal>
        </>
    )
}

export default ModalDelSelectedMsg