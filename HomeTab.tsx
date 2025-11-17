import React from 'react';
import type { User, MainTask, Tab } from '../types';
import StatCard from '../components/StatCard';

interface HomeTabProps {
    user: User;
    mainTasks: MainTask[];
    onPromoClaim: (code: string) => void;
    theme: string;
    onThemeToggle: () => void;
    completedTasks: string[];
    pendingCheckTasks: string[];
    onGoToTask: (taskId: string, link: string) => void;
    onCheckTask: (taskId: string, points: number) => void;
    onSimpleTask: (taskId: string, points: number, link?: string) => void;
    onNavigate: (tab: Tab) => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ 
    user, 
    mainTasks, 
    onPromoClaim, 
    theme, 
    onThemeToggle,
    completedTasks,
    pendingCheckTasks,
    onGoToTask,
    onCheckTask,
    onSimpleTask,
    onNavigate
}) => {

    const handlePromoClaim = () => {
        const promoInput = document.getElementById('promo-input') as HTMLInputElement;
        if (promoInput && promoInput.value.trim()) {
            onPromoClaim(promoInput.value.trim());
            promoInput.value = '';
        }
    };

    const renderTaskButton = (task: MainTask) => {
        const isCompleted = completedTasks.includes(task.id);
        const isLimitReached = task.completions >= task.limit;

        if (isLimitReached) {
            return (
                <button
                    disabled
                    className="bg-gray-400 dark:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap flex items-center gap-1.5 cursor-not-allowed"
                >
                    Limit Reached
                </button>
            );
        }

        if (isCompleted) {
            return (
                <button
                    disabled
                    className="bg-gray-400 dark:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap flex items-center gap-1.5 cursor-not-allowed"
                >
                    <i className="fas fa-check"></i> Completed
                </button>
            );
        }

        if (task.category === 'telegram') {
            const isPending = pendingCheckTasks.includes(task.id);
            if (isPending) {
                 return (
                    <button
                        onClick={() => onCheckTask(task.id, task.points)}
                        className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-transform hover:scale-105 active:scale-100 flex items-center gap-1.5"
                    >
                        <i className="fas fa-search"></i> CHECK
                    </button>
                );
            }
            return (
                <button
                    onClick={() => onGoToTask(task.id, task.link)}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-transform hover:scale-105 active:scale-100 flex items-center gap-1.5"
                >
                    <i className="fas fa-external-link-alt"></i> GO
                </button>
            );
        }
        
        if (task.category === 'website') {
            return (
                <button
                    onClick={() => onSimpleTask(task.id, task.points, task.link)}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-transform hover:scale-105 active:scale-100 flex items-center gap-1.5"
                >
                    <i className="fas fa-globe"></i> VISIT
                </button>
            );
        }
        
        return null;
    };

    return (
        <div className="animate-fadeIn space-y-6 pb-6">
            {/* Profile Section */}
            <div className="flex items-center justify-between gap-4 px-4 pt-8 pb-4 relative">
                 <div className="flex items-center gap-4">
                    <img 
                        src={user.avatarUrl} 
                        alt="User Avatar" 
                        className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-700 shadow-lg shrink-0"
                    />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
                        <div className="flex items-center gap-2 bg-white dark:bg-[#2C2C2E] py-1.5 px-3 rounded-full shadow-sm mt-2 w-fit">
                            <i className="fas fa-coins text-yellow-500"></i>
                            <span className="font-bold text-gray-800 dark:text-white">{user.coins}</span>
                        </div>
                    </div>
                 </div>

                <button 
                    onClick={onThemeToggle}
                    className="bg-white/50 dark:bg-gray-800/50 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110 text-gray-700 dark:text-gray-200 shrink-0"
                    aria-label="Toggle theme"
                >
                    <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
                </button>
            </div>


            {/* Promo Code Section */}
            <div className="bg-white dark:bg-[#2C2C2E] p-5 rounded-xl shadow-md mx-4">
                <div className="flex items-center gap-3 mb-4">
                    <i className="fas fa-gift text-blue-500 text-xl"></i>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Promo Code</h3>
                </div>
                <div className="flex gap-2.5">
                    <input 
                        id="promo-input"
                        type="text" 
                        className="flex-1 p-3 border border-gray-200 dark:border-[#3A3A3C] rounded-lg text-base bg-gray-100 dark:bg-[#3A3A3C] dark:text-white focus:outline-none focus:border-blue-500 transition-colors" 
                        placeholder="Enter Promo Code" 
                    />
                    <button 
                        onClick={handlePromoClaim} 
                        className="bg-blue-500 text-white px-8 py-3 rounded-lg font-bold text-sm whitespace-nowrap transition-transform hover:scale-105 active:scale-100"
                    >
                        Claim
                    </button>
                </div>
            </div>
            
            {/* Leaderboard Button */}
            <div className="px-4">
                <button
                    onClick={() => onNavigate('leaderboard')}
                    className="w-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-100 shadow-lg"
                >
                    <i className="fas fa-trophy"></i> View Leaderboard
                </button>
            </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 px-4">
                <StatCard value={`${user.todayAds} / 100`} label="TODAY ADS" />
                <StatCard value={user.totalAds} label="TOTAL ADS" />
                <StatCard value={user.totalReferrals} label="TOTAL REFERRALS" />
                <StatCard value={user.totalEarnings} label="TOTAL EARNINGS" />
            </div>

             {/* Main Tasks Section */}
            {mainTasks.length > 0 && (
                 <div className="bg-white dark:bg-[#2C2C2E] p-4 rounded-xl shadow-md mx-4">
                     <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                        <i className="fab fa-telegram text-blue-500 mr-2"></i> Main Tasks
                     </h3>
                     <div className="space-y-3">
                         {mainTasks.map(task => (
                             <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/10 rounded-lg">
                                 <div>
                                     <h4 className="font-semibold text-gray-800 dark:text-white">{task.title}</h4>
                                     <div className="flex items-center gap-4 mt-2">
                                        <div className="inline-block bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full">
                                            +{task.points} Coins
                                        </div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            <i className="fas fa-users mr-1"></i> {Math.max(0, task.limit - task.completions)} spots left
                                        </div>
                                     </div>
                                 </div>
                                {renderTaskButton(task)}
                             </div>
                         ))}
                     </div>
                 </div>
            )}
        </div>
    );
};

export default HomeTab;
