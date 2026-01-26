import { useEffect } from 'react';
import { socket } from '../services/socket.service';

export const useSocketConnection = (credentials, setUserInfo, setConnected_to, setJoined_groupsInfo) => {
    useEffect(() => {
        if (!credentials?.userId) {
            console.warn('useSocketConnection: No userId provided');
            return;
        }

        try {
            socket.emit('register', credentials);
        } catch (error) {
            console.error('Failed to register socket:', error);
            return;
        }

        const handleConnect = () => {
            console.log('Socket connected successfully');
        };

        const handleConnectError = (error) => {
            console.error('Socket connection error:', error);
        };

        const handleDisconnect = (reason) => {
            console.warn('Socket disconnected:', reason);
            if (reason === 'io server disconnect') {
                // Server initiated disconnect, try to reconnect
                socket.connect();
            }
        };

        const handleGetLoggedInUserInfo = ({ userInfo, connected_to, joined_groupsInfo }) => {
            try {
                setTimeout(() => {
                    setUserInfo(userInfo);
                    setConnected_to(connected_to);
                    setJoined_groupsInfo(joined_groupsInfo);
                }, 500);
            } catch (error) {
                console.error('Error setting user info:', error);
            }
        };

        socket.on('connect', handleConnect);
        socket.on('connect_error', handleConnectError);
        socket.on('disconnect', handleDisconnect);
        socket.on('getLoggedInUserInfo', handleGetLoggedInUserInfo);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('connect_error', handleConnectError);
            socket.off('disconnect', handleDisconnect);
            socket.off('getLoggedInUserInfo', handleGetLoggedInUserInfo);
        };
    }, [setUserInfo, setConnected_to, setJoined_groupsInfo, credentials.userId]);
};
