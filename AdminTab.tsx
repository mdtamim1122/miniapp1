
import React, { useState, useEffect } from 'react';
import type { User, MainTask, PartnershipTask, AdminSettings, AdminDashboardStats, Activity, PromoCode, WithdrawalRequest } from '../types';

interface AdminTabProps {
    mainTasks: MainTask[];
    partnershipTasks: PartnershipTask[];
    promoCodes: PromoCode[];
    withdrawalRequests: WithdrawalRequest[];
    onAddMainTask: (task: Omit<MainTask, 'id' | 'completions'>) => void;
    onDeleteMainTask: (id: string) => void;
    onAddPartnershipTask: (task: Omit<PartnershipTask, 'id' | 'completions'>) => void;
    onDeletePartnershipTask: (id: string) => void;
    onAddPromoCode: (promo: Omit<PromoCode, 'id'>) => void;
    onDeletePromoCode: (id: string) => void;
    onApproveWithdrawal: (id: string) => void;
    onRejectWithdrawal: (id: string) => void;
    settings: AdminSettings;
    onSettingsChange: (settings: AdminSettings) => void;
    dashboardStats: AdminDashboardStats;
    recentActivity: Activity[];
    allUsers: User[];
    onUpdateUser: (user: User) => Promise<void>;
}

const StatCard: React.FC<{ icon: string; value: string; label: string; color: string; }> = ({ icon, value, label, color }) => (
    <div className="bg-gray-50 dark:bg-white/10 p-4 rounded-xl flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} text-white text-2xl`}>
            <i className={`fas ${icon}`}></i>
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</div>
        </div>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode; icon: string, defaultOpen?: boolean }> = ({ title, children, icon, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-md overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <i className={`fas ${icon}`}></i>
                    {title}
                </h2>
                <i className={`fas fa-chevron-down transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {children}
                </div>
            </div>
        </div>
    );
};

const AdminTab: React.FC<AdminTabProps> = ({ 
    mainTasks, 
    partnershipTasks, 
    promoCodes,
    withdrawalRequests,
    onAddMainTask, 
    onDeleteMainTask, 
    onAddPartnershipTask,
    onDeletePartnershipTask,
    onAddPromoCode,
    onDeletePromoCode,
    onApproveWithdrawal,
    onRejectWithdrawal,
    settings,
    onSettingsChange,
    dashboardStats,
    recentActivity,
    allUsers,
    onUpdateUser
}) => {
    type AdminView = 'dashboard' | 'pendingWithdrawals' | 'userManagement';
    const [view, setView] = useState<AdminView>('dashboard');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userForm, setUserForm] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // State for Main Task form
    const [mainTaskForm, setMainTaskForm] = useState({ title: '', points: '', link: '', category: 'telegram' as MainTask['category'], limit: '', channelId: '' });
    
    // State for Partnership Task form
    const [partnershipTaskForm, setPartnershipTaskForm] = useState({ title: '', points: '', link: '', type: 'telegram' as PartnershipTask['type'], category: '', limit: '', channelId: '' });

    // State for General Settings form
    const [settingsForm, setSettingsForm] = useState<AdminSettings>(settings);
    
    // State for Promo Code form
    const [promoCodeForm, setPromoCodeForm] = useState({ code: '', reward: '', usesLeft: '' });

    useEffect(() => {
        setSettingsForm(settings);
    }, [settings]);

    useEffect(() => {
        setUserForm(editingUser);
    }, [editingUser]);

    const handleMainTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setMainTaskForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddMainTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (mainTaskForm.title && mainTaskForm.points && mainTaskForm.link && mainTaskForm.category && mainTaskForm.limit) {
            onAddMainTask({ ...mainTaskForm, points: parseInt(mainTaskForm.points), limit: parseInt(mainTaskForm.limit) });
            setMainTaskForm({ title: '', points: '', link: '', category: 'telegram', limit: '', channelId: '' });
        }
    };
    
    const handlePartnershipTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPartnershipTaskForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPartnershipTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (partnershipTaskForm.title && partnershipTaskForm.points && partnershipTaskForm.category && partnershipTaskForm.limit) {
            onAddPartnershipTask({ ...partnershipTaskForm, points: parseInt(partnershipTaskForm.points), limit: parseInt(partnershipTaskForm.limit) });
            setPartnershipTaskForm({ title: '', points: '', link: '', type: 'telegram', category: '', limit: '', channelId: '' });
        }
    };
    
    const handleSettingsFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const numberFields = ['dailyAdLimit', 'adMinPoints', 'adMaxPoints', 'premiumReferralBonus', 'normalReferralBonus', 'minimumWithdrawal'];

        if (numberFields.includes(name)) {
            setSettingsForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setSettingsForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        onSettingsChange(settingsForm);
    }
    
    const handlePromoCodeFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPromoCodeForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPromoCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (promoCodeForm.code && promoCodeForm.reward && promoCodeForm.usesLeft) {
            onAddPromoCode({
                code: promoCodeForm.code,
                reward: parseInt(promoCodeForm.reward),
                usesLeft: parseInt(promoCodeForm.usesLeft)
            });
            setPromoCodeForm({ code: '', reward: '', usesLeft: '' });
        }
    };

    const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!userForm) return;
        const { name, value } = e.target;
        const isNumeric = ['coins', 'todayAds', 'totalAds', 'totalReferrals', 'totalEarnings'].includes(name);
        setUserForm({
            ...userForm,
            [name]: isNumeric ? Number(value) : value,
        });
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (userForm) {
            await onUpdateUser(userForm);
            setEditingUser(null);
        }
    };
    
    const inputClasses = "w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const buttonClasses = "w-full bg-blue-500 text-white py-2 rounded-md font-bold hover:bg-blue-600 transition-colors";
    const deleteButtonClasses = "bg-red-500 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-red-600 transition-colors";
    
    const maxEarning = Math.max(...dashboardStats.dailyEarnings, 1);
    
    const pendingWithdrawals = withdrawalRequests.filter(r => r.status === 'pending');
    const completedWithdrawals = withdrawalRequests.filter(r => r.status === 'completed');
    const rejectedWithdrawals = withdrawalRequests.filter(r => r.status === 'rejected');

    const filteredUsers = allUsers.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (view === 'pendingWithdrawals') {
        return (
            <div className="animate-fadeIn p-4 space-y-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('dashboard')} className="bg-gray-200 dark:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Pending Withdrawals</h1>
                </div>

                <div className="space-y-3">
                    {pendingWithdrawals.length > 0 ? pendingWithdrawals.map(req => (
                        <div key={req.id} className="p-4 bg-white dark:bg-[#2C2C2E] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    {/* Fix: Replaced req.userId with req.telegramId to match the WithdrawalRequest type. */}
                                    <p className="font-bold dark:text-white">{req.userName} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">({req.telegramId})</span></p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 font-mono break-all mt-1">{req.walletAddress}</p>
                                    <p className="text-md text-blue-500 font-bold mt-2">{req.amount.toLocaleString()} Coins</p>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    <button onClick={() => onApproveWithdrawal(req.id)} className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-green-600 transition-all duration-200 w-28">
                                        <i className="fas fa-check mr-2"></i>Approve
                                    </button>
                                    <button onClick={() => onRejectWithdrawal(req.id)} className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-red-600 transition-all duration-200 w-28">
                                        <i className="fas fa-times mr-2"></i>Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pending requests.</p>}
                </div>
            </div>
        );
    }

    if (view === 'userManagement') {
        if (editingUser && userForm) { // Edit User View
            return (
                <div className="animate-fadeIn p-4 space-y-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setEditingUser(null)} className="bg-gray-200 dark:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <h1 className="text-xl font-extrabold text-gray-800 dark:text-white">Edit User: {editingUser.name}</h1>
                    </div>
                    <form onSubmit={handleSaveUser} className="p-4 bg-white dark:bg-[#2C2C2E] rounded-lg shadow-sm space-y-4">
                        <div>
                            <label className={labelClasses}>Name</label>
                            <input type="text" name="name" value={userForm.name} onChange={handleUserFormChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>ID</label>
                            <input type="text" name="id" value={userForm.id} readOnly className={`${inputClasses} bg-gray-200 dark:bg-gray-800 cursor-not-allowed`} />
                        </div>
                        <div>
                            <label className={labelClasses}>Coins</label>
                            <input type="number" name="coins" value={userForm.coins} onChange={handleUserFormChange} className={inputClasses} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Today's Ads</label>
                                <input type="number" name="todayAds" value={userForm.todayAds} onChange={handleUserFormChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Total Ads</label>
                                <input type="number" name="totalAds" value={userForm.totalAds} onChange={handleUserFormChange} className={inputClasses} />
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Total Referrals</label>
                                <input type="number" name="totalReferrals" value={userForm.totalReferrals} onChange={handleUserFormChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Total Earnings</label>
                                <input type="number" name="totalEarnings" value={userForm.totalEarnings} onChange={handleUserFormChange} className={inputClasses} />
                            </div>
                        </div>
                        <button type="submit" className={buttonClasses}>Save Changes</button>
                    </form>
                </div>
            );
        }

        // User List View
        return (
             <div className="animate-fadeIn p-4 space-y-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('dashboard')} className="bg-gray-200 dark:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">User Management</h1>
                </div>
                
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 pl-10 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
                
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                        <div key={u.id} className="p-3 bg-white dark:bg-[#2C2C2E] rounded-lg shadow-sm flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-bold dark:text-white">{u.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingUser(u)} className="bg-blue-500/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-md text-sm font-bold hover:bg-blue-500/30 transition-colors">
                                <i className="fas fa-edit mr-2"></i>Edit
                            </button>
                        </div>
                    )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No users found.</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn p-4 space-y-6">
            <h1 className="text-3xl font-extrabold text-center text-gray-800 dark:text-white">Admin Dashboard</h1>

            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard icon="fa-users" value={dashboardStats.totalUsers.toLocaleString()} label="Total Users" color="bg-blue-500" />
                <StatCard icon="fa-coins" value={dashboardStats.totalCoinsEarned.toLocaleString()} label="Total Coins Earned" color="bg-yellow-500" />
                <StatCard icon="fa-user-clock" value={dashboardStats.activeUsersToday.toLocaleString()} label="Active Users (Today)" color="bg-green-500" />
                <StatCard icon="fa-check-double" value={dashboardStats.tasksCompletedToday.toLocaleString()} label="Tasks Completed (Today)" color="bg-purple-500" />
            </div>

             {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#2C2C2E] p-4 rounded-xl shadow-md">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">Daily Earnings (Last 7 Days)</h3>
                    <div className="flex justify-around items-end h-48 p-2 border-t border-b border-gray-200 dark:border-gray-700">
                         {dashboardStats.dailyEarnings.map((earning, index) => (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <div 
                                    className="w-8 bg-blue-400 rounded-t-md hover:bg-blue-500 transition-colors"
                                    style={{ height: `${(earning / maxEarning) * 100}%` }}
                                    title={`${earning} coins`}
                                ></div>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][(new Date().getDay() - 6 + index + 7) % 7]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-[#2C2C2E] p-4 rounded-xl shadow-md">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.map(activity => (
                             <div key={activity.id} className="flex items-start gap-3">
                                <i className={`fas ${activity.icon} ${activity.color} mt-1`}></i>
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-200">{activity.text}</p>
                                    <p className="text-xs text-gray-400">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Management Sections */}
            <Section title="User Management" icon="fa-users">
                <div className="p-3 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-md flex justify-between items-center">
                    <div>
                        <span className="font-bold">{allUsers.length}</span> total registered users.
                    </div>
                    <button onClick={() => setView('userManagement')} className="bg-blue-500 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-blue-600 transition-colors">
                        Manage Users
                    </button>
                </div>
            </Section>

            <Section title={`Manage Withdrawals`} icon="fa-hand-holding-usd" defaultOpen={true}>
                 <div className="space-y-4">
                    <div className="p-3 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-md flex justify-between items-center">
                        <div>
                            <span className="font-bold">{pendingWithdrawals.length}</span> requests are waiting for your review.
                        </div>
                        <button onClick={() => setView('pendingWithdrawals')} className="bg-yellow-500 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-yellow-600 transition-colors">
                            View All Pending
                        </button>
                    </div>
                     <div className="pt-2">
                        <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Completed History ({completedWithdrawals.length})</h3>
                        {/* Add history view if needed */}
                     </div>
                     <div className="pt-2">
                        <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Rejected History ({rejectedWithdrawals.length})</h3>
                        {/* Add history view if needed */}
                     </div>
                </div>
            </Section>

            <Section title="General Settings" icon="fa-cog">
                <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-600 dark:text-gray-300">Ad Settings</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className={labelClasses}>Ad Limit</label>
                                <input type="number" name="dailyAdLimit" value={settingsForm.dailyAdLimit} onChange={handleSettingsFormChange} className={inputClasses} required />
                            </div>
                             <div>
                                <label className={labelClasses}>Min Coins/Ad</label>
                                <input type="number" name="adMinPoints" value={settingsForm.adMinPoints} onChange={handleSettingsFormChange} className={inputClasses} required />
                            </div>
                             <div>
                                <label className={labelClasses}>Max Coins/Ad</label>
                                <input type="number" name="adMaxPoints" value={settingsForm.adMaxPoints} onChange={handleSettingsFormChange} className={inputClasses} required />
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Ad Script ID</label>
                            <input type="text" name="adScriptId" value={settingsForm.adScriptId || ''} onChange={handleSettingsFormChange} className={inputClasses} required />
                        </div>
                    </div>
                     <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-600 dark:text-gray-300">Referral & Bot Settings</h4>
                         <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClasses}>Premium Bonus</label>
                                <input type="number" name="premiumReferralBonus" value={settingsForm.premiumReferralBonus} onChange={handleSettingsFormChange} className={inputClasses} required />
                            </div>
                             <div>
                                <label className={labelClasses}>Normal Bonus</label>
                                <input type="number" name="normalReferralBonus" value={settingsForm.normalReferralBonus} onChange={handleSettingsFormChange} className={inputClasses} required />
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Bot Username (without @)</label>
                            <input type="text" name="botUsername" value={settingsForm.botUsername || ''} onChange={handleSettingsFormChange} className={inputClasses} placeholder="YourTelegramBot" required />
                        </div>
                        <div>
                            <label className={labelClasses}>Referral Page Message</label>
                            <textarea
                                name="referralMessage"
                                value={settingsForm.referralMessage || ''}
                                onChange={handleSettingsFormChange}
                                className={inputClasses}
                                rows={3}
                                placeholder="Use placeholders for values."
                            />
                            <p className="text-xs text-gray-400 mt-1">Placeholders: <strong>{`{premiumBonus}`}</strong>, <strong>{`{normalBonus}`}</strong>. Use **text** for bold.</p>
                        </div>
                    </div>
                     <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-600 dark:text-gray-300">Withdrawal Settings</h4>
                        <div>
                            <label className={labelClasses}>Minimum Withdrawal (Coins)</label>
                            <input type="number" name="minimumWithdrawal" value={settingsForm.minimumWithdrawal} onChange={handleSettingsFormChange} className={inputClasses} step="1" required />
                        </div>
                    </div>
                    <button type="submit" className={buttonClasses}>Save Settings</button>
                </form>
            </Section>
            
            <Section title="Manage Promo Codes" icon="fa-gift">
                <form onSubmit={handleAddPromoCode} className="space-y-3 mb-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className={labelClasses}>Code</label>
                            <input type="text" name="code" value={promoCodeForm.code} onChange={handlePromoCodeFormChange} className={inputClasses} required />
                        </div>
                        <div>
                            <label className={labelClasses}>Reward (Coins)</label>
                            <input type="number" name="reward" value={promoCodeForm.reward} onChange={handlePromoCodeFormChange} className={inputClasses} required />
                        </div>
                        <div>
                            <label className={labelClasses}>Total Uses</label>
                            <input type="number" name="usesLeft" value={promoCodeForm.usesLeft} onChange={handlePromoCodeFormChange} className={inputClasses} required />
                        </div>
                    </div>
                    <button type="submit" className={buttonClasses}>Create Promo Code</button>
                </form>
                <div className="space-y-2">
                    <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300">Active Codes: {promoCodes.length}</h3>
                    {promoCodes.map(promo => (
                        <div key={promo.id} className="grid grid-cols-4 items-center p-2 bg-gray-50 dark:bg-white/10 rounded-md text-sm">
                            <span className="font-mono font-bold dark:text-gray-200">{promo.code}</span>
                            <span className="dark:text-gray-300">Reward: {promo.reward}</span>
                            <span className="dark:text-gray-300">Uses Left: {promo.usesLeft}</span>
                            <button onClick={() => onDeletePromoCode(promo.id)} className={`${deleteButtonClasses} justify-self-end`}>Delete</button>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Manage Main Tasks (Home Page)" icon="fa-home">
                 <form onSubmit={handleAddMainTask} className="space-y-3 mb-4">
                    <div>
                        <label className={labelClasses}>Title</label>
                        <input type="text" name="title" value={mainTaskForm.title} onChange={handleMainTaskChange} className={inputClasses} required />
                    </div>
                     <div>
                        <label className={labelClasses}>Category</label>
                        <select name="category" value={mainTaskForm.category} onChange={handleMainTaskChange} className={inputClasses} required>
                            <option value="telegram">Telegram</option>
                            <option value="website">Web</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Points</label>
                            <input type="number" name="points" value={mainTaskForm.points} onChange={handleMainTaskChange} className={inputClasses} required />
                        </div>
                         <div>
                            <label className={labelClasses}>User Limit</label>
                            <input type="number" name="limit" value={mainTaskForm.limit} onChange={handleMainTaskChange} className={inputClasses} required />
                        </div>
                    </div>
                     <div>
                        <label className={labelClasses}>Link (URL)</label>
                        <input type="url" name="link" value={mainTaskForm.link} onChange={handleMainTaskChange} className={inputClasses} required />
                    </div>
                    {mainTaskForm.category === 'telegram' && (
                        <div>
                            <label className={labelClasses}>Telegram Channel ID (e.g., @channel or -100...)</label>
                            <input type="text" name="channelId" value={mainTaskForm.channelId} onChange={handleMainTaskChange} className={inputClasses} placeholder="Required for verification" required />
                        </div>
                    )}
                    <button type="submit" className={buttonClasses}>Add Main Task</button>
                </form>
                 <div className="space-y-2">
                    <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300">Current Tasks: {mainTasks.length}</h3>
                    {mainTasks.map(task => (
                        <div key={task.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-white/10 rounded-md">
                            <div>
                                <span className="text-sm font-medium dark:text-gray-200">{task.title}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Completions: {task.completions}/{task.limit}</span>
                            </div>
                            <button onClick={() => onDeleteMainTask(task.id)} className={deleteButtonClasses}>Delete</button>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Manage Partnership Tasks (Tasks Page)" icon="fa-tasks">
                 <form onSubmit={handleAddPartnershipTask} className="space-y-3 mb-4">
                     <div>
                        <label className={labelClasses}>Title</label>
                        <input type="text" name="title" value={partnershipTaskForm.title} onChange={handlePartnershipTaskChange} className={inputClasses} required />
                    </div>
                     <div>
                        <label className={labelClasses}>Category</label>
                        <input type="text" name="category" placeholder="e.g. Subscribe" value={partnershipTaskForm.category} onChange={handlePartnershipTaskChange} className={inputClasses} required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Points</label>
                            <input type="number" name="points" value={partnershipTaskForm.points} onChange={handlePartnershipTaskChange} className={inputClasses} required />
                        </div>
                        <div>
                            <label className={labelClasses}>User Limit</label>
                            <input type="number" name="limit" value={partnershipTaskForm.limit} onChange={handlePartnershipTaskChange} className={inputClasses} required />
                        </div>
                    </div>
                     <div>
                        <label className={labelClasses}>Link (URL)</label>
                        <input type="url" name="link" value={partnershipTaskForm.link} onChange={handlePartnershipTaskChange} className={inputClasses} />
                    </div>
                     {partnershipTaskForm.type === 'telegram' && (
                        <div>
                            <label className={labelClasses}>Telegram Channel ID (e.g., @channel or -100...)</label>
                            <input type="text" name="channelId" value={partnershipTaskForm.channelId} onChange={handlePartnershipTaskChange} className={inputClasses} placeholder="Required for verification" required />
                        </div>
                    )}
                    <div>
                        <label className={labelClasses}>Task Type</label>
                        <select name="type" value={partnershipTaskForm.type} onChange={handlePartnershipTaskChange} className={inputClasses} required>
                            <option value="telegram">Telegram</option>
                            <option value="website">Website</option>
                            <option value="youtube">YouTube</option>
                        </select>
                    </div>
                    <button type="submit" className={buttonClasses}>Add Partnership Task</button>
                </form>
                 <div className="space-y-2">
                    <h3 className="text-md font-semibold text-gray-600 dark:text-gray-300">Current Tasks: {partnershipTasks.length}</h3>
                    {partnershipTasks.map(task => (
                        <div key={task.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-white/10 rounded-md">
                             <div>
                                <span className="text-sm font-medium dark:text-gray-200">{task.title}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Completions: {task.completions}/{task.limit}</span>
                            </div>
                            <button onClick={() => onDeletePartnershipTask(task.id)} className={deleteButtonClasses}>Delete</button>
                        </div>
                    ))}
                </div>
            </Section>

        </div>
    );
};

export default AdminTab;
