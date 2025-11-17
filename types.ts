export interface User {
  name: string;
  id: string; // username
  telegramId: number;
  avatar: string; // fallback initial
  avatarUrl?: string; // image url
  coins: number;
  todayAds: number;
  totalAds: number;
  totalReferrals: number;
  totalEarnings: number;
  referralLink: string;
  rank?: number;
}

export type Tab = 'home' | 'tasks' | 'referral' | 'withdraw' | 'leaderboard';

export interface LeaderboardUser {
  rank: number;
  avatar: string;
  avatarUrl?: string;
  name: string;
  id: string;
  points: number;
}

export interface MainTask {
    id: string;
    title: string;
    points: number;
    link: string;
    category: 'telegram' | 'website';
    limit: number;
    completions: number;
    channelId?: string;
}

export interface PartnershipTask {
    id: string;
    title: string;
    points: number;
    link?: string;
    type: 'telegram' | 'website' | 'youtube';
    category: string;
    limit: number;
    completions: number;
    channelId?: string;
}

export interface ReferredUser {
  name: string;
  id: string;
  avatar: string;
  pointsEarned: number;
  isPremium?: boolean;
}

export interface AdminSettings {
    dailyAdLimit: number;
    adMinPoints: number;
    adMaxPoints: number;
    adScriptId: string;
    premiumReferralBonus: number;
    normalReferralBonus: number;
    referralMessage: string;
    botUsername: string;
    minimumWithdrawal: number;
}

export type NotificationType = 'success' | 'error';

export interface AdminDashboardStats {
    totalUsers: number;
    totalCoinsEarned: number;
    activeUsersToday: number;
    tasksCompletedToday: number;
    dailyEarnings: number[]; // Array of last 7 days earnings
}

export interface Activity {
    id: string;
    text: string;
    time: string;
    icon: string;
    color: string;
}

export interface PromoCode {
    id: string;
    code: string;
    reward: number;
    usesLeft: number;
}

export interface WithdrawalRequest {
    id: string;
    telegramId: number; // Changed from userId: string
    userName: string;
    walletAddress: string;
    amount: number; // amount in coins
    status: 'pending' | 'completed' | 'rejected';
    date: string;
}
