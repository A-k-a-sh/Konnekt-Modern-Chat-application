
import { editMsg, deleteMsg, handleSubmit } from "../../../utils";

import { uploadToCloudinary as cloudinaryUpload, deleteFromCloudinary as cloudinaryDelete } from "../../../services";


import { useEffect } from "react";

export const TexAreaFunctions = {

    //Generat blob url for selected images || sotred in files
    handleFileUpload: (event, setFileData) => {

        const files = Array.from(event.target.files); // Convert FileList to array


        let fileData = files.map((file) => {
            const fileType = file.type.split('/')[0]; // Get main type (image, video, text, application)

            // Normalize type: only keep 'image' and 'video', everything else becomes 'application'
            const normalizedType = (fileType === 'image' || fileType === 'video') ? fileType : 'application';

            return {
                file: file,
                blobUrls: URL.createObjectURL(file),// Generate temporary URLs
                type: normalizedType
            };
        })


        setFileData((prev) => [...prev, ...fileData])

        // imageUrls.forEach(url => URL.revokeObjectURL(url));


    },

    sendMsg: async (e, msg, setMsg, msgToEdit, setMsgToEdit, setAllMessages, setOutgoingMsg, selectedUser, userInfo, fileData, setFileData, setMediaUploading, msgToReply, setMsgToReply, selectedGroup) => {


        //msg , setMsg - typed message in text area
        //setOutgoingMsg - message to be sent
        //msgToEdit , setMsgToEdit - message to be edited
        //files , setFiles - files to be uploaded
        //setImages  - Store selected images blob url to view in modal
        //console.log(fileData);


        if (msg.trim() === '' && fileData.length === 0) return;

        msg = msg.trim();

        const tempFileData = [...fileData];
        setFileData([])

        if (msgToEdit) {


            setAllMessages((prev) =>
                prev.map((m) =>
                    m.msgId === msgToEdit.msgId
                        ? { ...m, message: msg }  // Update the message
                        : m // Return the original message if not being edited
                )
            );
            msgToEdit.message = msg

            editMsg(msgToEdit);

            setMsgToEdit(null);

            setMsg('');
            return;

        }


        const msgTemp = msg

        setMsg('');

        setMediaUploading(true)
        let validUrls = [];
        const filesLinks = await Promise.all(tempFileData.map(fileInfo => cloudinaryUpload(fileInfo)));

        setMediaUploading(false)

        validUrls = filesLinks.filter(url => url !== null);


        setFileData([])
        //const { reply, ...msgToReply } = msgToReply ; 
        let msgToReplyTemp = msgToReply;

        setMsgToReply(null)

        handleSubmit(e, msgTemp, selectedUser, userInfo, validUrls, msgToReplyTemp, selectedGroup);



    },


    useTextAreaDynamicHeight: (msg, textareaRef) => {
        useEffect(() => {
            const textarea = textareaRef.current;

            textarea.style.height = '4rem'; // Reset height first
            const newHeight = textarea.scrollHeight; // Get the required height

            // Set a max height limit (e.g., 200px)
            const maxHeight = 200;

            // Apply the height, but do not exceed maxHeight
            textarea.style.height = `${Math.min(newHeight, maxHeight)}px`;

            // If the content exceeds maxHeight, enable scrolling inside textarea
            textarea.style.overflowY = newHeight > maxHeight ? "scroll" : "hidden";

        }, [msg]);
    }

}