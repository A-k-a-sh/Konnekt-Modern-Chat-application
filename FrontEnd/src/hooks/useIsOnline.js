import { useEffect } from 'react';
import { socket } from '../services/socket.service';

export const useIsOnline = (selectedUser, userInfo, setIsOnline) => {
    useEffect(() => {
        socket.emit('isOnline', { selectedUser, userInfo });

        const handleIsOnline = (data) => {
            setIsOnline(data);
        };

        socket.on('isOnline', handleIsOnline);

        const handleUserStatus = ({ user: updatedUser, isOnline }) => {
            if (updatedUser.userId === selectedUser.userId) {
                setIsOnline(isOnline);
            }
        };

        socket.on('userStatus', handleUserStatus);

        return () => {
            socket.off('isOnline', handleIsOnline);
        };
    }, [selectedUser, userInfo]);
};
