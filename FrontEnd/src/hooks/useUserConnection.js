import { useEffect } from 'react';
import { socket } from '../services/socket.service';

/**
 * Hook to handle automatic user connection updates
 * When a user sends/receives a message from someone new, they auto-connect
 */
export const useUserConnection = (setConnected_to) => {
    useEffect(() => {
        const handleUserConnected = (newUser) => {
            console.log('[User Connected]', newUser);
            
            setConnected_to((prev) => {
                // Check if user already exists
                const exists = prev.some(u => u.userId === newUser.userId);
                if (exists) return prev;
                
                // Add new user to connected list
                return [...prev, newUser];
            });
        };

        socket.on('userConnected', handleUserConnected);

        return () => {
            socket.off('userConnected', handleUserConnected);
        };
    }, [setConnected_to]);
};
