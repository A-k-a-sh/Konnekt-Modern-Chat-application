import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { useAllContext } from '../Context/AllContext';
import { useEffect, useState } from 'react';
import { createGroup } from '../services/group.service';
import { socket } from '../services/socket.service';
import { cloudinaryUpload } from '../services/cloudinary.service';

export default function ModalAddNewGroup({ modalOpen, setModalOpen }) {
    const [open, setOpen] = React.useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupImage, setGroupImage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');

    const { userInfo, setAllGroupsData, setJoined_groupsInfo } = useAllContext();

    const close = () => {
        setOpen(false);
    }

    const handleClick = () => {
        setOpen(false);
        setModalOpen(false);
        // Reset form
        setGroupName('');
        setGroupImage('');
        setImageFile(null);
        setImagePreview('');
        setDescription('');
        setError('');
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            setImageFile(file);
            setGroupImage(''); // Clear URL if file is selected

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview('');
        setGroupImage('');
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            setError('Group name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let finalImageUrl = groupImage.trim();

            // Upload image to Cloudinary if file is selected
            if (imageFile) {
                setUploadingImage(true);
                try {
                    const uploadResult = await cloudinaryUpload({
                        file: imageFile,
                        type: 'image'
                    });
                    finalImageUrl = uploadResult.url;
                } catch (uploadError) {
                    console.error('[Upload Image] Error:', uploadError);
                    setError('Failed to upload image. Creating group without image.');
                    finalImageUrl = '';
                } finally {
                    setUploadingImage(false);
                }
            }

            const groupData = {
                groupName: groupName.trim(),
                groupImage: finalImageUrl,
                description: description.trim(),
                adminId: userInfo.userId
            };

            const response = await createGroup(groupData);

            if (response.success) {
                console.log('[Create Group] Success:', response.data);

                // Update local state with new group
                setAllGroupsData(prev => [...prev, response.data]);
                setJoined_groupsInfo(prev => [...prev, response.data]);

                // Join the socket room for this new group
                socket.emit('register', { userId: userInfo.userId });

                handleClick(); // Close modal
            }
        } catch (err) {
            console.error('[Create Group] Error:', err);
            setError(err.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (modalOpen) {
            setOpen(true);
        }
    }, [modalOpen]);

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
                    sx={{
                        maxWidth: 500,
                        width: '90%',
                        borderRadius: 'md',
                        p: 4,
                        boxShadow: 'lg',
                        bgcolor: '#1a1a2e',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}
                >
                    <ModalClose
                        variant="plain"
                        sx={{
                            m: 1,
                            color: '#9ca3af',
                            '&:hover': { backgroundColor: 'rgba(156, 163, 175, 0.1)' }
                        }}
                    />
                    <Typography
                        component="h2"
                        id="modal-title"
                        level="h4"
                        textColor="inherit"
                        sx={{
                            fontWeight: 'bold',
                            mb: 3,
                            color: '#f3f4f6',
                            fontSize: '1.5rem'
                        }}
                    >
                        Create New Group
                    </Typography>

                    <div id="modal-desc" className='space-y-4'>
                        {error && (
                            <div className='p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-start gap-2'>
                                <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className='block text-gray-300 mb-2 text-sm font-semibold'>
                                Group Name <span className='text-red-400'>*</span>
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Enter group name"
                                className='w-full px-4 py-2.5 bg-[#0f0f1e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all'
                                disabled={loading || uploadingImage}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className='block text-gray-300 mb-2 text-sm font-semibold'>
                                Group Image
                            </label>
                            
                            {/* Image Preview or Avatar */}
                            <div className='mb-3 flex items-center gap-4'>
                                {imagePreview || groupImage ? (
                                    <div className='relative'>
                                        <img 
                                            src={imagePreview || groupImage} 
                                            alt="Preview" 
                                            className='w-20 h-20 rounded-full object-cover border-2 border-purple-500'
                                        />
                                        <button
                                            onClick={clearImage}
                                            type="button"
                                            className='absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors'
                                            disabled={loading || uploadingImage}
                                        >
                                            <i className="fa-solid fa-xmark text-xs"></i>
                                        </button>
                                    </div>
                                ) : groupName ? (
                                    <div className='w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-3xl font-bold text-white border-2 border-purple-500'>
                                        {groupName.charAt(0).toUpperCase()}
                                    </div>
                                ) : (
                                    <div className='w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600'>
                                        <i className="fa-solid fa-users text-2xl text-gray-500"></i>
                                    </div>
                                )}
                                
                                <div className='flex-1 text-xs text-gray-400'>
                                    {imagePreview || groupImage ? (
                                        <p>✓ Image ready</p>
                                    ) : groupName ? (
                                        <p>First letter will be used as avatar</p>
                                    ) : (
                                        <p>Enter group name to see avatar</p>
                                    )}
                                </div>
                            </div>

                            {/* Upload Button */}
                            <div className='mb-3'>
                                <input
                                    type="file"
                                    id="groupImageFile"
                                    accept="image/*"
                                    onChange={handleImageFileChange}
                                    className='hidden'
                                    disabled={loading || uploadingImage}
                                />
                                <label
                                    htmlFor="groupImageFile"
                                    className={`inline-flex items-center gap-2 px-4 py-2 bg-[#0f0f1e] border border-purple-500/50 rounded-lg text-sm text-purple-300 hover:bg-purple-900/20 transition-all cursor-pointer ${
                                        loading || uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    <i className="fa-solid fa-upload"></i>
                                    <span>Upload from device</span>
                                </label>
                            </div>

                            {/* Or URL Input */}
                            <div className='relative'>
                                <div className='absolute inset-0 flex items-center'>
                                    <div className='w-full border-t border-gray-700'></div>
                                </div>
                                <div className='relative flex justify-center text-xs'>
                                    <span className='px-2 bg-[#1a1a2e] text-gray-500'>or use URL</span>
                                </div>
                            </div>
                            
                            <input 
                                type="text"
                                value={groupImage}
                                onChange={(e) => {
                                    setGroupImage(e.target.value);
                                    setImageFile(null);
                                    setImagePreview('');
                                }}
                                placeholder="https://example.com/image.jpg"
                                className='w-full mt-3 px-4 py-2.5 bg-[#0f0f1e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all'
                                disabled={loading || uploadingImage || imageFile !== null}
                            />
                        </div>

                        <div>
                            <label className='block text-gray-300 mb-2 text-sm font-semibold'>
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter group description (optional)"
                                rows={3}
                                className='w-full px-4 py-2.5 bg-[#0f0f1e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none'
                                disabled={loading || uploadingImage}
                            />
                        </div>

                        <div className='flex gap-3 pt-2'>
                            <Button
                                onClick={handleCreateGroup}
                                disabled={loading || uploadingImage || !groupName.trim()}
                                sx={{
                                    flex: 1,
                                    bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    py: 1.2,
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5568d3 0%, #65408a 100%)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                                    },
                                    '&:disabled': {
                                        background: '#1e3a8a',
                                        opacity: 0.5,
                                        cursor: 'not-allowed'
                                    },
                                    transition: 'all 0.2s'
                                }}
                            >
                                {uploadingImage ? (
                                    <span className='flex items-center gap-2'>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Uploading image...
                                    </span>
                                ) : loading ? (
                                    <span className='flex items-center gap-2'>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Creating...
                                    </span>
                                ) : (
                                    <span className='flex items-center gap-2'>
                                        <i className="fa-solid fa-plus"></i>
                                        Create Group
                                    </span>
                                )}
                            </Button>
                            <Button
                                onClick={handleClick}
                                variant="outlined"
                                disabled={loading || uploadingImage}
                                sx={{
                                    flex: 1,
                                    py: 1.2,
                                    borderColor: '#4b5563',
                                    color: '#d1d5db',
                                    fontWeight: 'medium',
                                    '&:hover': {
                                        borderColor: '#6b7280',
                                        bgcolor: 'rgba(75, 85, 99, 0.1)',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s'
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Sheet>
            </Modal>
        </React.Fragment >
    );
}
