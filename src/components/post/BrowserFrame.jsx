// src/components/BrowserFrame.jsx
import React from 'react';
import { Circle } from 'lucide-react';

const BrowserFrame = ({ children, activeTabTitle, colors }) => {
    return (
        <div className={`${colors.bgPrimary} rounded-xl border shadow-2xl overflow-hidden flex flex-col h-full w-full ${colors.border}`}>
            {/* Browser Title Bar */}
            <div className={`flex items-center justify-between p-2 ${colors.bgPrimary} border-b ${colors.border}`}>
                <div className="flex space-x-1 ml-2">
                    <Circle size={10} fill="#FF5F56" stroke="none" /> {/* Red */}
                    <Circle size={10} fill="#FFBD2E" stroke="none" /> {/* Yellow */}
                    <Circle size={10} fill="#27C93F" stroke="none" /> {/* Green */}
                </div>
                <div className={`flex-grow text-center text-sm font-medium ${colors.textPrimary}`}>
                    {activeTabTitle || "Untitled Page"}
                </div>
                <div className="w-8"></div>
            </div>

            {/* Browser Address Bar */}
            <div className={`flex items-center p-2 ${colors.bgPrimary} border-b ${colors.border}`}>
                <div className={`flex-grow flex items-center ${colors.bgSecondary} rounded-full px-3 py-1 text-sm shadow-inner`}>
                    <span className={`mr-2 ${colors.textSecondary}`}>https://</span>
                    <span className={`font-semibold ${colors.textPrimary}`}>{activeTabTitle ? activeTabTitle.toLowerCase().replace(/\s/g, '') + '.com' : 'example.com'}</span>
                </div>
            </div>

            {/* Browser Content Area (where tabs and content go) */}
            <div className={`flex-grow flex flex-col ${colors.bgSecondary} rounded-b-xl overflow-hidden`}>
                {children}
            </div>
        </div>
    );
};

export default BrowserFrame;