import React, { useState, useEffect } from 'react';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import { useAllContext } from '../Context/AllContext';
import { socket } from '../services/socket.service';
import { cloudinaryUpload, cloudinaryDelete } from '../services/cloudinary.service';

export default function ModalEditGroup({ isOpen, onClose, currentGroup }) {
    const { userInfo } = useAllContext();
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [groupImage, setGroupImage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');

    // Initialize form with current group data
    useEffect(() => {
        if (currentGroup && isOpen) {
            setGroupName(currentGroup.groupName || '');
            setDescription(currentGroup.description || '');
            setGroupImage(currentGroup.groupImage || '');
            setImagePreview('');
            setImageFile(null);
        }
    }, [currentGroup, isOpen]);

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

    const handleUpdateGroup = async () => {
        if (!groupName.trim()) {
            setError('Group name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let finalImageUrl = groupImage.trim();

            // Upload image if file is selected
            if (imageFile) {
                setUploadingImage(true);
                try {
                    const uploadResult = await cloudinaryUpload({ file: imageFile, type: 'image' });
                    finalImageUrl = uploadResult.url;

                    // Delete old image if it exists and is from Cloudinary
                    if (currentGroup.groupImage && currentGroup.groupImage.includes('cloudinary.com')) {
                        const urlParts = currentGroup.groupImage.split('/');
                        const publicIdWithExtension = urlParts[urlParts.length - 1];
                        const publicId = publicIdWithExtension.split('.')[0];
                        await cloudinaryDelete(publicId, 'image');
                    }
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    setError('Failed to upload image');
                    setUploadingImage(false);
                    setLoading(false);
                    return;
                }
                setUploadingImage(false);
            }

            // Emit socket event to update group
            socket.emit('updateGroup', {
                groupId: currentGroup.groupId,
                adminId: userInfo.userId,
                updates: {
                    groupName: groupName.trim(),
                    description: description.trim(),
                    groupImage: finalImageUrl
                }
            });

            // Reset form and close
            handleClose();
        } catch (error) {
            console.error('Error updating group:', error);
            setError('Failed to update group');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setGroupName('');
        setDescription('');
        setGroupImage('');
        setImageFile(null);
        setImagePreview('');
        setError('');
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Sheet
                variant="outlined"
                sx={{
                    width: '90%',
                    maxWidth: 500,
                    borderRadius: 'md',
                    p: 3,
                    boxShadow: 'lg',
                    backgroundColor: '#1a1625',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
            >
                <ModalClose
                    variant="plain"
                    sx={{
                        m: 1,
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                />

                <Typography
                    component="h2"
                    level="h4"
                    sx={{ 
                        color: 'white',
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <i className="fa-solid fa-edit text-purple-400"></i>
                    Edit Group Info
                </Typography>

                {error && (
                    <div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm'>
                        {error}
                    </div>
                )}

                {/* Group Image */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Group Image
                    </label>
                    
                    <div className='flex flex-col items-center gap-4'>
                        {/* Image Preview */}
                        <div className='relative'>
                            <div className='w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 bg-white/5'>
                                <img
                                    src={imagePreview || groupImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName || 'Group')}&background=random&size=128`}
                                    alt="Group"
                                    className='w-full h-full object-cover'
                                />
                            </div>
                            {(imagePreview || groupImage) && (
                                <button
                                    onClick={clearImage}
                                    className='absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors'
                                >
                                    <i className="fa-solid fa-times"></i>
                                </button>
                            )}
                        </div>

                        {/* File Input */}
                        <div className='flex gap-2'>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileChange}
                                className='hidden'
                                id="editGroupImageFile"
                            />
                            <label
                                htmlFor="editGroupImageFile"
                                className='px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors text-sm flex items-center gap-2'
                            >
                                <i className="fa-solid fa-upload"></i>
                                Choose Image
                            </label>
                        </div>

                        {/* Or URL Input */}
                        <div className='w-full'>
                            <input
                                type='text'
                                value={groupImage}
                                onChange={(e) => {
                                    setGroupImage(e.target.value);
                                    setImageFile(null);
                                    setImagePreview('');
                                }}
                                placeholder='Or paste image URL...'
                                className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-sm'
                                disabled={!!imageFile}
                            />
                        </div>
                    </div>
                </div>

                {/* Group Name */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Group Name *
                    </label>
                    <input
                        type='text'
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder='Enter group name...'
                        className='w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50'
                        maxLength={50}
                    />
                    <p className='text-xs text-gray-500 mt-1'>{groupName.length}/50 characters</p>
                </div>

                {/* Description */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder='Enter group description...'
                        rows={3}
                        className='w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none'
                        maxLength={200}
                    />
                    <p className='text-xs text-gray-500 mt-1'>{description.length}/200 characters</p>
                </div>

                {uploadingImage && (
                    <div className='mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 text-sm flex items-center gap-2'>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Uploading image...
                    </div>
                )}

                {/* Action Buttons */}
                <div className='flex gap-3 mt-6'>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        sx={{
                            flex: 1,
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateGroup}
                        disabled={loading || uploadingImage || !groupName.trim()}
                        sx={{
                            flex: 1,
                            background: loading || uploadingImage || !groupName.trim()
                                ? 'rgba(139, 92, 246, 0.3)'
                                : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
                            },
                            '&:disabled': {
                                background: 'rgba(139, 92, 246, 0.3)',
                                color: 'rgba(255, 255, 255, 0.4)'
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                Updating...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-check mr-2"></i>
                                Update Group
                            </>
                        )}
                    </Button>
                </div>
            </Sheet>
        </Modal>
    );
}
