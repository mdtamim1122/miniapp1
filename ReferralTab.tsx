
import React from 'react';
import type { User, ReferredUser, AdminSettings } from '../types';

interface ReferralTabProps {
    user: User;
    showNotification: (message: string) => void;
    referredUsers: ReferredUser[];
    settings: AdminSettings;
}

const ReferralTab: React.FC<ReferralTabProps> = ({ user, showNotification, referredUsers, settings }) => {

    const handleCopy = () => {
        navigator.clipboard.writeText(user.referralLink);
        showNotification('Referral link copied!');
    };

    const handleShare = () => {
        const shareText = `Hey! I'm earning rewards with the Earn Pro bot on Telegram. Join me and get started!`;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(user.referralLink)}&text=${encodeURIComponent(shareText)}`;
        
        // This will open the native Telegram share dialog for a seamless experience
        window.open(shareUrl, '_blank');
    };

    const parseMessage = (message: string) => {
        const bolded = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <span dangerouslySetInnerHTML={{ __html: bolded }} />;
    };

    const processedMessage = settings.referralMessage
        .replace(/{premiumBonus}/g, settings.premiumReferralBonus.toString())
        .replace(/{normalBonus}/g, settings.normalReferralBonus.toString());

    return (
        <div className="animate-fadeIn p-4 space-y-4">
            <h1 className="text-2xl font-extrabold text-center text-gray-800 dark:text-white mb-4">Referral System</h1>
            
            <div className="bg-white dark:bg-[#2C2C2E] p-5 rounded-xl shadow-sm border border-gray-200/50 dark:border-[#3A3A3C]/50 transition-colors duration-300">
                <div className="flex flex-col gap-4">
                    <p className="text-center text-gray-600 dark:text-gray-300">
                        {parseMessage(processedMessage)}
                    </p>
                    
                    <div className="bg-gray-100 dark:bg-[#3A3A3C] p-4 rounded-lg font-mono text-sm text-center border-2 border-dashed border-[#007AFF] break-all font-semibold animate-pulse" style={{animationDuration: '3s'}}>
                        {user.referralLink}
                    </div>
                    
                    <div className="flex gap-3">
                        <button onClick={handleCopy} className="flex-1 bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-100">
                            <i className="fas fa-copy"></i> Copy
                        </button>
                        <button onClick={handleShare} className="flex-1 bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-100">
                            <i className="fab fa-telegram-plane"></i> Share
                        </button>
                    </div>

                    <div className="text-center mt-4 bg-gray-50 dark:bg-white/10 p-4 rounded-lg">
                        <h3 className="font-bold text-[#007AFF] mb-3 text-lg">
                            <i className="fas fa-gift mr-2"></i> Referral Rewards
                        </h3>
                        <div className="space-y-1 text-gray-700 dark:text-gray-200 text-sm">
                            <p>👑 <strong>{settings.premiumReferralBonus} coins</strong> for each <span className="font-semibold text-purple-500">Premium</span> user</p>
                            <p>🎯 <strong>{settings.normalReferralBonus} coins</strong> for each Normal user</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#2C2C2E] p-5 rounded-xl shadow-sm border border-gray-200/50 dark:border-[#3A3A3C]/50 transition-colors duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        <i className="fas fa-users mr-2 text-blue-500"></i> Your Referrals ({referredUsers.length})
                    </h3>
                </div>
                {referredUsers.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {referredUsers.map((refUser, index) => (
                            <div key={index} className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-white/10">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-base mr-3">
                                    {refUser.avatar}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                                        {refUser.name}
                                        {refUser.isPremium && <span className="ml-2 text-xs" title="Premium User">👑</span>}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{refUser.id}</p>
                                </div>
                                <div className="font-bold text-green-500 text-sm">
                                    +{refUser.pointsEarned} Coins
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        You haven't referred anyone yet. Share your link to start earning!
                    </p>
                )}
            </div>
        </div>
    );
};

export default ReferralTab;