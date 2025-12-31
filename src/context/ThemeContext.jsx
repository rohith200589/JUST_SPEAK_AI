// src/context/ThemeContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getGlobalTheme, setGlobalTheme, subscribeToThemeChange } from '../utils/globalTheme';

// Create the ThemeContext with default values from the global utility.
export const ThemeContext = createContext({
    theme: getGlobalTheme(),
    toggleTheme: () => {},
});

// Custom hook to easily consume the theme context.
export const useTheme = () => useContext(ThemeContext);

// ThemeProvider component to wrap the application.
export const ThemeProvider = ({ children }) => {
    // State to hold the current theme, initialized from the global utility.
    const [theme, setTheme] = useState(getGlobalTheme());

    // Effect to apply the correct theme class to the root HTML element.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark-theme', 'light-theme');
        root.classList.add(`${theme}-theme`);

        // Also save the theme to localStorage for persistence across sessions.
        localStorage.setItem('theme', theme);

        const handleThemeChange = (newTheme) => {
            setTheme(newTheme);
            const newRoot = document.documentElement;
            newRoot.classList.remove('dark-theme', 'light-theme');
            newRoot.classList.add(`${newTheme}-theme`);
        };
        
        // Subscribe to theme changes from the global utility.
        subscribeToThemeChange(handleThemeChange);

        // Cleanup function for the effect.
        return () => {
            window.removeEventListener('themeChange', handleThemeChange);
        };
    }, [theme]);

    // Function to toggle between 'dark' and 'light' themes using the global utility.
    const toggleTheme = useCallback(() => {
        setGlobalTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme]);

    // The Provider makes the theme state and toggle function available.
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};