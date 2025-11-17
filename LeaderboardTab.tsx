
import React, { useMemo } from 'react';
import type { User, LeaderboardUser } from '../types';

interface LeaderboardTabProps {
    user: User;
    onBack: () => void;
}

// Mock data generation
const generateMockLeaderboard = (currentUser: User): LeaderboardUser[] => {
    const users: LeaderboardUser[] = [];
    const names = ['John', 'Sarah', 'Mike', 'Emma', 'Alex', 'Lisa', 'David', 'Anna', 'Tom', 'Mia'];
    const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    
    for (let i = 1; i <= 150; i++) {
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];
        const points = Math.floor(10000 - i * 50 + Math.random() * 500);
        users.push({
            rank: i,
            avatar: randomName.charAt(0),
            name: `${randomName} ${randomSurname}`,
            id: `@${randomName.toLowerCase()}${i}`,
            points: points,
        });
    }

    // Check if current user is in top 100, if not, add them with a simulated rank
    const currentUserInTop100 = users.slice(0, 100).find(u => u.id === currentUser.id);
    if (!currentUserInTop100) {
        const userRank = {
            rank: 123, // Simulated rank outside top 100
            avatar: currentUser.avatar,
            avatarUrl: currentUser.avatarUrl,
            name: currentUser.name,
            id: currentUser.id,
            points: currentUser.totalEarnings,
        };
        users.push(userRank);
        currentUser.rank = userRank.rank;
    } else {
         currentUser.rank = currentUserInTop100.rank;
    }
    
    return users.sort((a,b) => a.rank - b.rank);
};


const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ user, onBack }) => {

    const leaderboardData = useMemo(() => generateMockLeaderboard(user), [user]);
    const top100 = leaderboardData.slice(0, 100);
    const currentUserRank = leaderboardData.find(u => u.id === user.id) || { ...user, rank: user.rank || '100+', points: user.totalEarnings};


    const getRankColor = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg';
        if (rank === 2) return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-md';
        if (rank === 3) return 'bg-gradient-to-br from-orange-600 to-yellow-700 text-white shadow';
        return 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200';
    }
    
    const UserRow: React.FC<{ u: LeaderboardUser, isCurrentUser: boolean }> = ({ u, isCurrentUser }) => (
         <div className={`flex items-center p-3 rounded-lg transition-all duration-300 ${isCurrentUser ? 'bg-blue-500/20 dark:bg-blue-500/30 ring-2 ring-blue-500' : 'bg-gray-50 dark:bg-white/5'}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm mr-3 shrink-0 ${getRankColor(u.rank)}`}>
                {u.rank}
            </div>
            {/* Fix: Cast event target to HTMLElement to access style property. */}
            <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full mr-3 border-2 border-white/50 dark:border-gray-600" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex'; }} />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 items-center justify-center text-white font-bold text-base mr-3 shrink-0 hidden">{u.avatar}</div>

            <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{u.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{u.id}</p>
            </div>
            <div className="font-bold text-blue-500 text-sm flex items-center gap-1">
                <i className="fas fa-coins text-yellow-500"></i> {u.points.toLocaleString()}
            </div>
        </div>
    );

    return (
        <div className="animate-fadeIn h-full flex flex-col">
            <div className="p-4 text-center relative">
                 <button onClick={onBack} className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-100 dark:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center">
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Leaderboard</h1>
                <div className="text-yellow-500 mt-2">
                    <i className="fas fa-trophy text-4xl animate-bounce" style={{animationDuration: '2s'}}></i>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-2">
                {top100.map(u => (
                   <UserRow key={u.id} u={u} isCurrentUser={u.id === user.id} />
                ))}
            </div>
            
            {currentUserRank && (
                <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto p-2">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                         <UserRow u={currentUserRank as LeaderboardUser} isCurrentUser={true} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaderboardTab;