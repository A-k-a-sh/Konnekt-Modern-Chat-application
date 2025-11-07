import * as React from 'react';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Switch from '@mui/joy/Switch';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import DialogTitle from '@mui/joy/DialogTitle';
import Stack from '@mui/joy/Stack';
import AllContext, { useAllContext } from '../Context/AllContext';
import { handleSubmit } from '../root/Pages/Right Side/SocketConnection';


export default function ModalForwardMsg({ forwardMsgModalOpen, setForwardMsgModalOpen, selectedMsg, setSelectedMsg }) {
    const [layout, setLayout] = React.useState('center');
    const [scroll, setScroll] = React.useState(true);
    const [disabledButtons, setDisabledButtons] = React.useState(new Set());



    const { connected_to ,  userInfo ,joined_groupsInfo , selectedUser} = useAllContext();


    return (
        <React.Fragment>

            <Modal
                open={forwardMsgModalOpen}
                onClose={() => {
                    setLayout(undefined);
                    setForwardMsgModalOpen(false);
                    setDisabledButtons(new Set()); 
                }}
            >
                <ModalDialog
                    layout={layout}
                    sx={{
                        border: '0.6px solid gray',
                        backgroundColor: 'black',
                        width: '500px'
                    }}
                >
                    <ModalClose />

                    <div className='text-white text-2xl'>Forward Message To : </div>


                    <div className='text-white h-full w-full   overflow-auto'>
                        {connected_to.map((user, index) => {

                            const isDisabled = disabledButtons.has(user.userId)
                            const handleForward = (e) => {
                                // your forward logic here...
                                console.log(e);
                                console.log('Forwarding message to:', user);

                                // (e, outgoingMsg, selectedUser, userInfo, media, msgToReply, selectedGroup)

                                //receiver - selectedUser || here user
                                //sender - userInfo || ok
                                //msg - msg.message || ok
                                //mediaLinks - msg.mediaLinks || ok
                                //msgToReply - null
                                //selectedGroup - {}
                                //we have all info inside each selectedMsg
                                
                                selectedMsg.map(msg => {
                                    handleSubmit(e , msg.message , user , userInfo , msg.mediaLinks , null , {} , msg.sender)
                                })
                                setDisabledButtons(prev => new Set(prev).add(user.userId));
                            };
                            return (
                                <div className='w-full   flex py-2 flex-row justify-between items-center my-1 rounded-md hover:bg-[#010101c7] duration-200' key={index}>
                                    <div className='flex flex-row gap-2 items-center px-2'>
                                        <img
                                            src={user.profilePhoto} alt=""
                                            className='w-12 h-12 rounded-full border'
                                        />
                                        <div>{user.userName}</div>
                                    </div>
                                    <div className='mr-2'>
                                        <button
                                            className='bg-[#3bb3d2e2] text-white px-3 py-2 rounded-md hover:bg-[#3bb4d2bc] duration-200 disabled:opacity-50'
                                            onClick={handleForward}
                                            disabled={isDisabled}
                                        >
                                            Forward
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        {
                            joined_groupsInfo.map((group, index) => {
                                return (
                                    <div className='w-full   flex py-2 flex-row justify-between items-center my-1 rounded-md hover:bg-[#010101c7] duration-200' key={index}>
                                        <div className='flex flex-row gap-2 items-center px-2'>
                                            <img
                                                src={group.groupImage} alt=""
                                                className='w-12 h-12 rounded-full border'
                                            />
                                            <div>{group.groupName}</div>
                                        </div>
                                        <div className='mr-2'>
                                            <button
                                                className='bg-[#3bb3d2e2] text-white px-3 py-2 rounded-md hover:bg-[#3bb4d2bc] duration-200 disabled:opacity-50'
                                                // onClick={handleForward}
                                                // disabled={isDisabled}
                                            >
                                                Forward
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </ModalDialog>
            </Modal>
        </React.Fragment>
    );
}