
import React from 'react';
import type { NotificationType } from '../types';

interface NotificationProps {
    message: string;
    show: boolean;
    type: NotificationType;
}

const Notification: React.FC<NotificationProps> = ({ message, show, type }) => {
    const styles = {
        success: {
            bg: 'bg-[#34C759]',
            icon: 'fa-check-circle'
        },
        error: {
            bg: 'bg-red-500',
            icon: 'fa-times-circle'
        }
    };

    const currentStyle = styles[type] || styles.success;

    return (
        <div 
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 ${currentStyle.bg} text-white px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-2 z-50 transition-all duration-300 ease-out ${
                show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'
            }`}
        >
            <i className={`fas ${currentStyle.icon}`}></i>
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
};

export default Notification;
