import React from 'react';
import type { Tab } from '../types';

interface BottomNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: 'fa-home', label: 'Home' },
    { id: 'tasks', icon: 'fa-tasks', label: 'Tasks' },
    { id: 'referral', icon: 'fa-user-friends', label: 'Referrals' },
    { id: 'withdraw', icon: 'fa-wallet', label: 'Withdraw' },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md flex justify-around py-3 border-t border-gray-200 dark:border-[#3A3A3C] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] transition-colors duration-300">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-lg transition-all duration-300 text-xs font-medium ${
                        activeTab === item.id 
                        ? 'text-[#007AFF] bg-blue-500/10 dark:bg-blue-500/20 -translate-y-1' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                    <i className={`fas ${item.icon} text-lg transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : ''}`}></i>
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default BottomNav;
