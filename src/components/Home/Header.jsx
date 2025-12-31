// src/components/Header.jsx
import React from 'react';
import { NavLink } from 'react-router-dom'; // Using NavLink for active states
import { Sun, Moon, User, Settings, LogOut, Menu } from 'lucide-react';

const Header = ({
    theme,
    toggleTheme,
    isProfileDropdownOpen,
    setIsProfileDropdownOpen,
    profileDropdownRef,
    hideHeader,
    setIsSidebarOpen // To toggle the sidebar from header
}) => {
    return (
        <header
            className={`fixed top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-background-color text-primary-color shadow-md transition-transform duration-300 ease-in-out ${
                hideHeader ? '-translate-y-full' : 'translate-y-0'
            }`}
        >
            {/* Left Section: Menu for Mobile & CTC Sections */}
            <div className="flex items-center space-x-4">
                {/* Sidebar Toggle for smaller screens */}
                <button
                    aria-label="Open sidebar"
                    className="md:hidden p-2 rounded-md hover:bg-hover-color"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu className="h-6 w-6" />
                </button>

                {/* CTC Sections - Visible on larger screens */}
                <nav className="hidden md:flex space-x-6 text-lg font-medium">
                    <NavLink
                        to="/transcribe"
                        className={({ isActive }) =>
                            `hover:text-accent-color ${isActive ? 'text-accent-color' : ''}`
                        }
                    >
                        Transcribe
                    </NavLink>
                    <NavLink
                        to="/generate-post"
                        className={({ isActive }) =>
                            `hover:text-accent-color ${isActive ? 'text-accent-color' : ''}`
                        }
                    >
                        Generate Post
                    </NavLink>
                    <NavLink
                        to="/analyse"
                        className={({ isActive }) =>
                            `hover:text-accent-color ${isActive ? 'text-accent-color' : ''}`
                        }
                    >
                        Analyse
                    </NavLink>
                </nav>
            </div>

            {/* Right Section: Theme Toggle & Profile Dropdown */}
            <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-md hover:bg-hover-color"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? (
                        <Sun className="h-6 w-6 text-yellow-500" />
                    ) : (
                        <Moon className="h-6 w-6 text-blue-500" />
                    )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                    <button
                        onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-hover-color"
                        aria-label="User profile menu"
                    >
                        <User className="h-6 w-6" />
                        <span className="hidden md:inline">User Name</span> {/* Optional: Display user name */}
                    </button>

                    {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-card-background-color rounded-md shadow-lg py-1 z-50">
                            <a
                                href="/profile"
                                className="flex items-center px-4 py-2 text-primary-color hover:bg-hover-color"
                            >
                                <User className="mr-2 h-4 w-4" /> Profile
                            </a>
                            <a
                                href="/settings"
                                className="flex items-center px-4 py-2 text-primary-color hover:bg-hover-color"
                            >
                                <Settings className="mr-2 h-4 w-4" /> Settings
                            </a>
                            <button
                                className="flex items-center w-full text-left px-4 py-2 text-red-500 hover:bg-hover-color"
                            >
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;