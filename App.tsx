import React, { useState, useEffect, useCallback } from 'react';
import type { Tab, User, MainTask, PartnershipTask, AdminSettings, NotificationType, ReferredUser, WithdrawalRequest } from './types';
import BottomNav from './components/BottomNav';
import HomeTab from './tabs/HomeTab';
import TasksTab from './tabs/TasksTab';
import ReferralTab from './tabs/ReferralTab';
import WithdrawTab from './tabs/WithdrawTab';
import LeaderboardTab from './tabs/LeaderboardTab';
import Notification from './components/Notification';
import * as api from './services/api';

declare global {
    interface Window {
        showGiga: () => Promise<void>;
        Telegram: {
            WebApp: {
                ready: () => void;
                expand: () => void;
                initDataUnsafe: {
                    user?: {
                        id: number;
                        first_name: string;
                        last_name?: string;
                        username?: string;
                        photo_url?: string;
                        is_premium?: boolean;
                    };
                };
            };
        };
    }
}

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [activeTab, setActiveTab] = useState<Tab>('home');
    
    // State for user-facing app
    const [user, setUser] = useState<User | null>(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as NotificationType });
    const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
    const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
    const [partnershipTasks, setPartnershipTasks] = useState<PartnershipTask[]>([]);
    const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
    const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
    const [completedTasks, setCompletedTasks] = useState<string[]>([]);
    const [pendingCheckTasks, setPendingCheckTasks] = useState<string[]>([]);
    const [mockJoinedChannels, setMockJoinedChannels] = useState<Set<string>>(new Set());
    
    const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    }, []);

    useEffect(() => {
        const initTelegram = () => {
             if (window.Telegram && window.Telegram.WebApp) {
                const tg = window.Telegram.WebApp;
                tg.ready();
                tg.expand();
            }
        };

        const loadData = async () => {
            setIsLoading(true);
            try {
                initTelegram();
                const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

                if (!tgUser) {
                     throw new Error("Could not retrieve Telegram user data. Please open this app through Telegram.");
                }

                // First, initialize API and sign in user
                await api.initialize();

                const [
                    settingsData,
                    userData,
                    mainTasksData,
                    partnershipTasksData,
                    referredUsersData,
                    withdrawalRequestsData,
                    completedTasksData,
                ] = await Promise.all([
                    api.fetchAdminSettings(),
                    api.fetchUser(tgUser),
                    api.fetchMainTasks(),
                    api.fetchPartnershipTasks(),
                    api.fetchReferredUsers(tgUser.id),
                    api.fetchWithdrawalRequests(tgUser.id),
                    api.fetchCompletedTasks(tgUser.id),
                ]);
                
                setAdminSettings(settingsData);
                const finalUserData = { ...userData, referralLink: `https://t.me/${settingsData.botUsername}?start=ref_${tgUser.id}`};
                setUser(finalUserData);
                setMainTasks(mainTasksData);
                setPartnershipTasks(partnershipTasksData);
                setReferredUsers(referredUsersData);
                setWithdrawalRequests(withdrawalRequestsData);
                setCompletedTasks(completedTasksData);

            } catch (err: any) {
                console.error("Failed to load initial data", err);
                setError(err.message || "Failed to load app data. Please check your internet connection and try again.");
                showNotification(err.message || "Error loading data. Please try again.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [showNotification]);


    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        if (adminSettings?.adScriptId) {
            const scriptId = `giga-ad-script-${adminSettings.adScriptId}`;
            const existingScript = document.getElementById(scriptId);
            if (existingScript) {
                existingScript.remove();
            }

            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `https://ad.gigapub.tech/script?id=${adminSettings.adScriptId}`;
            script.async = true;
            document.head.appendChild(script);

            return () => {
                const scriptElement = document.getElementById(scriptId);
                if (scriptElement) {
                    document.head.removeChild(scriptElement);
                }
            };
        }
    }, [adminSettings?.adScriptId]);

    const handleThemeToggle = useCallback(() => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, []);

    const addCoins = useCallback(async (points: number, source: 'task' | 'ad' | 'promo' | 'referral') => {
        if (!user) return;
        const updatedUser = {
            ...user,
            coins: user.coins + points,
            totalEarnings: user.totalEarnings + points,
        };
        await api.updateUser(updatedUser);
        setUser(updatedUser);
    }, [user]);

    const handleWatchAd = useCallback(async () => {
        if (!user || !adminSettings) return;

        if (user.todayAds >= adminSettings.dailyAdLimit) {
            showNotification("Daily ad limit reached.", 'error');
            return;
        }

        if (typeof window.showGiga !== 'function') {
            showNotification('Ad service is not available. Check settings.', 'error');
            return;
        }

        try {
            await window.showGiga();
            const points = Math.floor(Math.random() * (adminSettings.adMaxPoints - adminSettings.adMinPoints + 1)) + adminSettings.adMinPoints;
            const updatedUser = {
                ...user,
                todayAds: user.todayAds + 1,
                totalAds: user.totalAds + 1,
            };
            await api.updateUser(updatedUser);
            setUser(updatedUser);
            addCoins(points, 'ad');
            showNotification(`Ad watched! You earned ${points} coins.`);
        } catch (e) {
            console.error("Ad error:", e);
            showNotification('Failed to show ad. Please try again.', 'error');
        }
    }, [addCoins, showNotification, user, adminSettings]);

    const handleGoToTask = useCallback((taskId: string, link: string) => {
        const task = mainTasks.find(t => t.id === taskId) || partnershipTasks.find(t => t.id === taskId);

        if (task && (('type' in task && task.type === 'telegram') || (!('type' in task) && task.category === 'telegram')) && task.channelId) {
            setMockJoinedChannels(prev => new Set(prev).add(task.channelId!));
        }

        if (!pendingCheckTasks.includes(taskId) && !completedTasks.includes(taskId)) {
            setPendingCheckTasks(prev => [...prev, taskId]);
        }
        window.open(link, '_blank');
    }, [completedTasks, pendingCheckTasks, mainTasks, partnershipTasks]);

    const verifyTelegramMembership = async (userId: number, channelId: string): Promise<boolean> => {
        // This is still a mock. In a real scenario, this would be a backend call.
        console.warn("Using mock Telegram membership verification.");
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockJoinedChannels.has(channelId));
            }, 1500);
        });
    };
    
    const handleCheckTask = useCallback(async (taskId: string, points: number) => {
        if(!user) return;
        const mainTask = mainTasks.find(t => t.id === taskId);
        const partnershipTask = partnershipTasks.find(t => t.id === taskId);
        const task = mainTask || partnershipTask;
        if (!task) return;

        if (task.completions >= task.limit) {
            showNotification("This task is no longer available.", 'error');
            return;
        }
        
        if (!task.channelId) {
            showNotification("Task configuration error: Channel ID missing.", 'error');
            return;
        }

        showNotification("Verifying task completion...", 'success');

        const isMember = await verifyTelegramMembership(user.telegramId, task.channelId);

        if (isMember) { 
            setPendingCheckTasks(prev => prev.filter(id => id !== taskId));
            await api.addCompletedTask(user.telegramId, taskId);
            setCompletedTasks(prev => [...prev, taskId]);
            addCoins(points, 'task');
            
            await api.incrementTaskCompletions(taskId, task.category === 'website' ? 'partnershipTasks' : 'mainTasks');
             if (mainTask) {
                setMainTasks(prev => prev.map(t => t.id === taskId ? {...t, completions: t.completions + 1} : t));
            } else if (partnershipTask) {
                setPartnershipTasks(prev => prev.map(t => t.id === taskId ? {...t, completions: t.completions + 1} : t));
            }
            showNotification("Verification Successful! Coins awarded.", 'success');
        } else { 
            setPendingCheckTasks(prev => prev.filter(id => id !== taskId));
            showNotification("Verification Failed! Please join the channel and try again.", 'error');
        }
    }, [addCoins, showNotification, mainTasks, partnershipTasks, mockJoinedChannels, user]);

    const handleSimpleTask = useCallback(async (taskId: string, points: number, link?: string) => {
        if (completedTasks.includes(taskId) || !user) return;
        
        const mainTask = mainTasks.find(t => t.id === taskId);
        const partnershipTask = partnershipTasks.find(t => t.id === taskId);
        const task = mainTask || partnershipTask;

        if (!task || task.completions >= task.limit) {
            showNotification("This task is no longer available.", 'error');
            return;
        }

        addCoins(points, 'task');
        await api.addCompletedTask(user.telegramId, taskId);
        setCompletedTasks(prev => [...prev, taskId]);

        await api.incrementTaskCompletions(taskId, mainTask ? 'mainTasks' : 'partnershipTasks');
        if(mainTask) {
            setMainTasks(prev => prev.map(t => t.id === taskId ? {...t, completions: t.completions + 1} : t));
        } else if(partnershipTask) {
             setPartnershipTasks(prev => prev.map(t => t.id === taskId ? {...t, completions: t.completions + 1} : t));
        }

        showNotification(`You earned ${points} coins!`);
        if (link) {
            window.open(link, '_blank');
        }
    }, [addCoins, showNotification, completedTasks, mainTasks, partnershipTasks, user]);
    
    const handlePromoClaim = useCallback(async (code: string) => {
        if (!user) return;
        try {
            const result = await api.claimPromoCode(code, user.telegramId);
            addCoins(result.reward, 'promo');
            showNotification(`Success! You earned ${result.reward} coins.`, 'success');
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
    }, [addCoins, showNotification, user]);
    
    const handleWithdrawRequest = useCallback(async (walletAddress: string, amount: number) => {
        if (!user || !adminSettings) return;

        if (amount < adminSettings.minimumWithdrawal || amount <= 0 || user.coins < amount) {
            showNotification(amount < adminSettings.minimumWithdrawal ? `Minimum is ${adminSettings.minimumWithdrawal} coins.` : "Invalid amount or insufficient balance.", 'error');
            return;
        }
        
        const updatedUser = { ...user, coins: user.coins - amount };
        
        const newRequest = await api.addWithdrawalRequest({ 
            telegramId: user.telegramId, 
            userName: user.name, 
            walletAddress, 
            amount 
        });

        await api.updateUser(updatedUser);
        setUser(updatedUser);
        setWithdrawalRequests(prev => [...prev, newRequest]);
        showNotification("Withdrawal request submitted successfully.", 'success');
    }, [user, adminSettings, showNotification]);

    if (isLoading || !user || !adminSettings) {
        return (
            <div className="w-full h-[100dvh] flex items-center justify-center bg-[#F2F2F7] dark:bg-[#1C1C1E]">
                <div className="flex flex-col items-center gap-4">
                    {error ? (
                         <>
                            <i className="fas fa-exclamation-triangle text-4xl text-red-500"></i>
                            <p className="text-red-600 dark:text-red-400 font-medium text-center px-4">{error}</p>
                         </>
                    ) : (
                         <>
                            <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
                            <p className="text-gray-600 dark:text-gray-300 font-medium">Loading App...</p>
                         </>
                    )}
                </div>
            </div>
        );
    }

    const renderTabContent = () => {
        const taskHandlers = {
            onGoToTask: handleGoToTask,
            onCheckTask: handleCheckTask,
            onSimpleTask: handleSimpleTask,
        };

        switch (activeTab) {
            case 'home':
                return <HomeTab user={user} mainTasks={mainTasks} onPromoClaim={handlePromoClaim} theme={theme} onThemeToggle={handleThemeToggle} completedTasks={completedTasks} pendingCheckTasks={pendingCheckTasks} onNavigate={setActiveTab} {...taskHandlers} />;
            case 'tasks':
                return <TasksTab user={user} partnershipTasks={partnershipTasks} onWatchAd={handleWatchAd} settings={adminSettings} completedTasks={completedTasks} pendingCheckTasks={pendingCheckTasks} {...taskHandlers} />;
            case 'referral':
                return <ReferralTab user={user} showNotification={showNotification} referredUsers={referredUsers} settings={adminSettings} />;
            case 'withdraw':
                return <WithdrawTab user={user} requests={withdrawalRequests} onWithdrawRequest={handleWithdrawRequest} settings={adminSettings} />;
            case 'leaderboard':
                return <LeaderboardTab user={user} onBack={() => setActiveTab('home')} />;
            default:
                return <HomeTab user={user} mainTasks={mainTasks} onPromoClaim={handlePromoClaim} theme={theme} onThemeToggle={handleThemeToggle} completedTasks={completedTasks} pendingCheckTasks={pendingCheckTasks} onNavigate={setActiveTab} {...taskHandlers} />;
        }
    };

    return (
        <div className="mobile-container w-full max-w-md h-[100dvh] mx-auto relative overflow-hidden flex flex-col">
            <main className="flex-1 overflow-y-auto pb-20">
                {renderTabContent()}
            </main>

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            <Notification message={notification.message} show={notification.show} type={notification.type} />
        </div>
    );
};

export default App;
