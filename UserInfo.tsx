import React from 'react';
import type { User } from '../types';

interface UserInfoProps {
    user: User;
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
    return (
        <div className="bg-white dark:bg-[#2C2C2E] px-5 pb-4 pt-11 flex items-center justify-between border-b border-gray-200 dark:border-[#3A3A3C] flex-shrink-0 transition-colors duration-300">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white font-bold text-xl">
                    {user.avatar}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{user.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.id}</p>
                </div>
            </div>
            <div className="text-right">
                {/* Fix: Replaced user.balance with user.coins to correctly display the user's balance. */}
                <div className="text-2xl font-extrabold text-[#007AFF]">{user.coins.toFixed(3)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">BALANCE</div>
            </div>
        </div>
    );
};

export default UserInfo;