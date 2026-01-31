import React, { useState } from 'react';
import { useNotificationContext } from '../../Context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { unreadCount } = useNotificationContext();

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative p-2 rounded-lg transition-all duration-200
                    ${isOpen 
                        ? 'bg-purple-600/20 text-purple-400' 
                        : 'hover:bg-white/10 text-gray-400 hover:text-white'
                    }
                `}
                title="Notifications"
            >
                <i className="fa-solid fa-bell text-xl"></i>
                
                {/* Badge for unread count */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <NotificationDropdown onClose={() => setIsOpen(false)} />
            )}
        </div>
    );
};

export default NotificationBell;
