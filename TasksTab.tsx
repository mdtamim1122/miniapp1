
import React from 'react';
import type { User, PartnershipTask, AdminSettings } from '../types';

interface TasksTabProps {
    user: User;
    partnershipTasks: PartnershipTask[];
    onWatchAd: () => void;
    settings: AdminSettings;
    completedTasks: string[];
    pendingCheckTasks: string[];
    onGoToTask: (taskId: string, link: string) => void;
    onCheckTask: (taskId: string, points: number) => void;
    onSimpleTask: (taskId: string, points: number, link?: string) => void;
}

const TaskCard: React.FC<{ 
    task: PartnershipTask, 
    isCompleted: boolean, 
    isPending: boolean, 
    onGoToTask: (taskId: string, link: string) => void,
    onCheckTask: (taskId: string, points: number) => void,
    onSimpleTask: (taskId: string, points: number, link?: string) => void
}> = ({ task, isCompleted, isPending, onGoToTask, onCheckTask, onSimpleTask }) => {
    const gradientClasses = {
        telegram: 'from-blue-500 to-cyan-500',
        website: 'from-green-500 to-emerald-500',
        youtube: 'from-red-500 to-red-600',
    };
    
    const buttonText = {
        telegram: 'Join',
        website: 'Visit',
        youtube: 'Subscribe',
    }

    const renderButton = () => {
        const isLimitReached = task.completions >= task.limit;
        if (isLimitReached) {
            return <button disabled className="bg-white/50 text-black/50 w-28 h-10 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 cursor-not-allowed">Limit Reached</button>;
        }

        if (isCompleted) {
            return <button disabled className="bg-white/50 text-black/50 w-28 h-10 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 cursor-not-allowed"><i className="fas fa-check"></i> Completed</button>;
        }

        if (task.type === 'telegram') {
            if (isPending) {
                return <button onClick={() => onCheckTask(task.id, task.points)} className="bg-yellow-400 text-black w-28 h-10 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-transform hover:scale-105 active:scale-100"><i className="fas fa-search"></i> Check</button>;
            }
            return <button onClick={() => onGoToTask(task.id, task.link || '')} className="bg-white/90 text-black w-28 h-10 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-transform hover:scale-105 active:scale-100"><i className="fab fa-telegram-plane"></i> {buttonText[task.type]}</button>;
        }

        return <button onClick={() => onSimpleTask(task.id, task.points, task.link)} className="bg-white/90 text-black w-28 h-10 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-transform hover:scale-105 active:scale-100"><i className={`fab fa-${task.type}`}></i> {buttonText[task.type]}</button>;
    };

    return (
        <div className={`bg-gradient-to-br ${gradientClasses[task.type]} text-white p-4 rounded-xl flex justify-between items-center`}>
            <div>
                <h3 className="font-bold">{task.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                    <div className="inline-block bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        +{task.points} Coins
                    </div>
                    <div className="text-xs font-medium text-white/80">
                        <i className="fas fa-users mr-1"></i> {Math.max(0, task.limit - task.completions)} left
                    </div>
                </div>
            </div>
            {renderButton()}
        </div>
    );
};


const TasksTab: React.FC<TasksTabProps> = ({ 
    user, 
    partnershipTasks, 
    onWatchAd, 
    settings,
    completedTasks,
    pendingCheckTasks,
    onGoToTask,
    onCheckTask,
    onSimpleTask
}) => {

    return (
        <div className="animate-fadeIn p-4 space-y-4">
            <h1 className="text-2xl font-extrabold text-center text-gray-800 dark:text-white">Daily Tasks</h1>

            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-5 rounded-2xl text-center text-black shadow-lg relative overflow-hidden animate-pulse" style={{animationDuration: '3s'}}>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-orange-500 shadow-md animate-bounce" style={{animationDuration: '2.5s', animationIterationCount: 'infinite'}}>
                    <i className="fas fa-ad"></i>
                </div>
                <h2 className="text-xl font-extrabold mb-2">Watch Ads & Earn More!</h2>
                <p className="text-sm opacity-90 mb-4">Complete ad tasks to earn extra points instantly.</p>
                
                <div className="bg-white/30 rounded-xl p-3 text-left text-sm space-y-2 mb-4">
                    <div className="flex justify-between items-center font-medium"><span className="opacity-80">Daily Ads Limit:</span> <strong>{settings.dailyAdLimit} Ads</strong></div>
                    <div className="flex justify-between items-center font-medium"><span className="opacity-80">Points per Ad:</span> <strong className="text-blue-700">{settings.adMinPoints}-{settings.adMaxPoints} Coins</strong></div>
                    <div className="flex justify-between items-center font-medium"><span className="opacity-80">Your Today:</span> <strong>{user.todayAds}/{settings.dailyAdLimit}</strong></div>
                    <div className="flex justify-between items-center font-medium"><span className="opacity-80">Total Earned from Ads:</span> <strong>{user.totalEarnings} Coins</strong></div>
                </div>

                <button onClick={onWatchAd} className="bg-[#007AFF] text-white px-8 py-3 rounded-full font-bold text-sm transition-transform hover:scale-105 active:scale-100 shadow-lg">
                    <i className="fas fa-play-circle mr-2"></i> Watch Ads Now
                </button>
            </div>
            
            <div className="bg-white dark:bg-[#2C2C2E] p-4 rounded-xl shadow-sm border border-gray-200/50 dark:border-[#3A3A3C]/50 space-y-4 transition-colors duration-300">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center">
                    <i className="fas fa-handshake mr-2 text-green-500"></i> Partnership Tasks
                 </h3>
                {partnershipTasks.length > 0 ? (
                    <div className="space-y-3">
                        {partnershipTasks.map(task => (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                isCompleted={completedTasks.includes(task.id)}
                                isPending={pendingCheckTasks.includes(task.id)}
                                onGoToTask={onGoToTask}
                                onCheckTask={onCheckTask}
                                onSimpleTask={onSimpleTask}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No partnership tasks available at the moment.</p>
                )}
            </div>
        </div>
    );
};

export default TasksTab;