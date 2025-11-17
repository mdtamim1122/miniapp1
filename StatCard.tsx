
import React from 'react';

interface StatCardProps {
    value: string | number;
    label: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label }) => {
    return (
        <div 
            className="bg-white dark:bg-[#2C2C2E] p-4 rounded-xl text-center shadow-md transition-colors duration-300"
        >
            <div className="text-3xl font-bold text-blue-500 mb-1">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">{label}</div>
        </div>
    );
};

export default StatCard;