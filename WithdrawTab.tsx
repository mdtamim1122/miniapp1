import React, { useState } from 'react';
import type { User, WithdrawalRequest, AdminSettings } from '../types';

interface WithdrawTabProps {
    user: User;
    requests: WithdrawalRequest[];
    onWithdrawRequest: (walletAddress: string, amount: number) => void;
    settings: AdminSettings;
}

const WithdrawTab: React.FC<WithdrawTabProps> = ({ user, requests, onWithdrawRequest, settings }) => {
    const [wallet, setWallet] = useState('');
    const [amount, setAmount] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (wallet && numericAmount > 0) {
            onWithdrawRequest(wallet, numericAmount);
            setWallet('');
            setAmount('');
        }
    };
    
    const getStatusChip = (status: WithdrawalRequest['status']) => {
        const styles = {
            pending: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
            completed: 'bg-green-500/20 text-green-600 dark:text-green-400',
            rejected: 'bg-red-500/20 text-red-600 dark:text-red-400'
        };
        return (
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="animate-fadeIn p-4 space-y-6">
            <div className="flex flex-col items-center justify-center pt-4 pb-2 relative">
                <img 
                    src={user.avatarUrl} 
                    alt="User Avatar" 
                    className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
                />
                <h2 className="text-lg font-bold mt-3 text-gray-800 dark:text-white">{user.name}</h2>
                <div className="flex items-center gap-2 bg-white dark:bg-[#2C2C2E] py-1 px-3 mt-2 rounded-full shadow-sm">
                    <i className="fas fa-coins text-yellow-500"></i>
                    <span className="font-bold text-gray-800 dark:text-white">{user.coins.toLocaleString()}</span>
                </div>
            </div>

            {/* Withdraw Request Form */}
            <div className="bg-white dark:bg-[#2C2C2E] p-5 rounded-xl shadow-md mx-2">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">Withdraw Request</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                            <i className="fas fa-wallet mr-2"></i> TON Wallet
                        </label>
                        <input
                            type="text"
                            value={wallet}
                            onChange={(e) => setWallet(e.target.value)}
                            className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            placeholder="Enter TON Wallet Address"
                            required
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                            <i className="fas fa-coins mr-2"></i> Amount
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            placeholder="Enter amount in coins"
                            required
                            min="1"
                            step="any"
                        />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Minimum withdrawal: {settings.minimumWithdrawal} coins.</p>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors">
                        Confirm
                    </button>
                </form>
            </div>
            
             {/* Withdrawal History */}
             <div className="bg-white dark:bg-[#2C2C2E] p-5 rounded-xl shadow-md mx-2">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">Withdrawal History</h3>
                 <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {requests.length > 0 ? requests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(req => (
                        <div key={req.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/10 rounded-lg">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-white">{req.amount} Coins</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(req.date).toLocaleString()}</p>
                            </div>
                            {getStatusChip(req.status)}
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">No withdrawal history found.</p>
                    )}
                 </div>
             </div>

        </div>
    );
};

export default WithdrawTab;
