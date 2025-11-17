import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import type { User, MainTask, PartnershipTask, AdminSettings, AdminDashboardStats, Activity, PromoCode, WithdrawalRequest } from './types';
import AdminTab from './tabs/AdminTab';
import * as api from './services/api';
import Notification from './components/Notification';

const AdminApp: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // Admin-specific state
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
    const [partnershipTasks, setPartnershipTasks] = useState<PartnershipTask[]>([]);
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
    const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
    const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

    useEffect(() => {
        const password = prompt("Enter admin password:");
        // In a real app, this should be a proper auth system.
        if (password === 'admin123') {
            setIsAuthenticated(true);
        } else {
            alert("Incorrect password.");
            const rootElement = document.getElementById('root');
            if(rootElement) {
                rootElement.innerHTML = `<div style="text-align: center; margin-top: 50px; font-family: sans-serif; color: red;"><h1>Access Denied</h1></div>`;
            }
        }
    }, []);

    const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        const loadAdminData = async () => {
            setIsLoading(true);
            try {
                const [
                    settingsData,
                    allUsersData,
                    mainTasksData,
                    partnershipTasksData,
                    promoCodesData,
                    withdrawalRequestsData,
                    dashboardData
                ] = await Promise.all([
                    api.fetchAdminSettings(),
                    api.fetchAllUsers(),
                    api.fetchMainTasks(),
                    api.fetchPartnershipTasks(),
                    api.fetchPromoCodes(),
                    api.fetchWithdrawalRequests(),
                    api.fetchDashboardStats()
                ]);

                setAdminSettings(settingsData);
                setAllUsers(allUsersData);
                setMainTasks(mainTasksData);
                setPartnershipTasks(partnershipTasksData);
                setPromoCodes(promoCodesData);
                setWithdrawalRequests(withdrawalRequestsData);
                setDashboardStats(dashboardData.stats);
                setRecentActivity(dashboardData.activity);
            } catch (err) {
                console.error("Failed to load admin data", err);
                showNotification("Error loading admin data.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadAdminData();
    }, [isAuthenticated, showNotification]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);


    // Admin action handlers
    const addMainTask = async (task: Omit<MainTask, 'id' | 'completions'>) => {
        const newTask = await api.addMainTask(task);
        setMainTasks(prev => [...prev, newTask]);
        showNotification('Main Task Added!');
    };
    const onDeleteMainTask = async (id: string) => {
        await api.deleteMainTask(id);
        setMainTasks(prev => prev.filter(task => task.id !== id));
        showNotification('Main Task Deleted!');
    };
    const addPartnershipTask = async (task: Omit<PartnershipTask, 'id' | 'completions'>) => {
        const newTask = await api.addPartnershipTask(task);
        setPartnershipTasks(prev => [...prev, newTask]);
        showNotification('Partnership Task Added!');
    };
    const onDeletePartnershipTask = async (id: string) => {
        await api.deletePartnershipTask(id);
        setPartnershipTasks(prev => prev.filter(task => task.id !== id));
        showNotification('Partnership Task Deleted!');
    };
    const handleSettingsChange = async (settings: AdminSettings) => {
        const updatedSettings = await api.updateAdminSettings(settings);
        setAdminSettings(updatedSettings);
        showNotification('Settings saved!');
    };
    const addPromoCode = async (promo: Omit<PromoCode, 'id'>) => {
        const newPromo = await api.addPromoCode(promo);
        setPromoCodes(prev => [...prev, newPromo]);
        showNotification('Promo Code Created!');
    };
    const onDeletePromoCode = async (id: string) => {
        await api.deletePromoCode(id);
        setPromoCodes(prev => prev.filter(p => p.id !== id));
        showNotification('Promo Code Deleted!');
    };
    const handleApproveWithdrawal = async (requestId: string) => {
        const request = withdrawalRequests.find(req => req.id === requestId);
        if (!request) return;
        await api.updateWithdrawalRequestStatus(requestId, 'completed');
        setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'completed' } : r));
        showNotification('Withdrawal Approved!');
    };
    const handleRejectWithdrawal = async (requestId: string) => {
        const request = withdrawalRequests.find(req => req.id === requestId);
        if (!request) return;
        await api.updateWithdrawalRequestStatus(requestId, 'rejected');
        setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
        // Refresh users list to get updated balance
        setAllUsers(await api.fetchAllUsers());
        showNotification('Withdrawal Rejected. Coins refunded.');
    };
    const handleUpdateUser = async (updatedUser: User) => {
        await api.updateUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        showNotification(`User ${updatedUser.name} updated successfully.`);
    };

    if (!isAuthenticated) {
        return null;
    }

    if (isLoading || !adminSettings || !dashboardStats) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-[#1C1C1E]">
                <div className="flex flex-col items-center gap-4">
                    <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
             <AdminTab
                mainTasks={mainTasks}
                partnershipTasks={partnershipTasks}
                promoCodes={promoCodes}
                withdrawalRequests={withdrawalRequests}
                onAddMainTask={addMainTask}
                onDeleteMainTask={onDeleteMainTask}
                onAddPartnershipTask={addPartnershipTask}
                onDeletePartnershipTask={onDeletePartnershipTask}
                onAddPromoCode={addPromoCode}
                onDeletePromoCode={onDeletePromoCode}
                onApproveWithdrawal={handleApproveWithdrawal}
                onRejectWithdrawal={handleRejectWithdrawal}
                settings={adminSettings}
                onSettingsChange={handleSettingsChange}
                dashboardStats={dashboardStats}
                recentActivity={recentActivity}
                allUsers={allUsers}
                onUpdateUser={handleUpdateUser}
            />
            <Notification message={notification.message} show={notification.show} type={notification.type} />
        </div>
    );
};

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <AdminApp />
        </React.StrictMode>
    );
}
