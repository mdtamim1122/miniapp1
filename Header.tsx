
import React from 'react';

interface HeaderProps {
    onThemeToggle: () => void;
    theme: string;
}

const Header: React.FC<HeaderProps> = ({ onThemeToggle, theme }) => {
    return (
        <header className="bg-gradient-to-br from-[#007AFF] to-[#5856D6] p-5 pt-11 text-white text-center relative flex-shrink-0">
            <button 
                onClick={onThemeToggle}
                className="absolute top-3 right-3 bg-white/20 w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110"
                aria-label="Toggle theme"
            >
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
            </button>
            <h1 className="text-2xl font-extrabold mb-1">Earn Pro</h1>
            <p className="text-sm opacity-90 font-medium">Complete tasks & watch ads to earn rewards</p>
        </header>
    );
};

export default Header;
