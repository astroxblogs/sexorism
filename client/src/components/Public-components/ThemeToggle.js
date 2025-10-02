import React from 'react';
import { useTheme } from './ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    // console.log("Current theme:", theme);

    return (
        <button
            onClick={toggleTheme}
            className="
                p-2 rounded-full
                bg-light-bg-secondary dark:bg-dark-bg-secondary
                shadow-md transition-colors duration-300 ease-in-out
                flex items-center justify-center
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75
            "
            aria-label={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
        >
            {theme === 'light' ? (
                <span className="material-icons text-xl text-text-dark dark:text-black hover:text-accent-dark dark:hover:text-accent-light">dark_mode</span>
            ) : (
                <span className="material-icons text-xl text-text-dark dark:text-black hover:text-accent-dark dark:hover:text-accent-light">light_mode</span>
            )}
        </button>
    );
};

export default ThemeToggle;