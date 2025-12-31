// src/components/transcript/GeneratedContentBlock.jsx
import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';

const GeneratedContentBlock = ({ title, children, theme, timestamp, currentThemeColors }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <div className={`flex justify-between items-center w-full rounded-xl p-4 ${currentThemeColors.cardBg} ${currentThemeColors.cardBorder} border`}>
                <div className="flex items-center gap-3">
                    <FileText className={`h-5 w-5 ${currentThemeColors.iconColor}`} />
                    <div>
                        <p className={`font-semibold ${currentThemeColors.textPrimary}`}>{title}</p>
                        <p className={`text-xs ${currentThemeColors.textSecondary}`}>{timestamp}</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className={`py-1.5 px-4 rounded-full text-sm font-semibold transition-colors ${currentThemeColors.buttonPrimaryBg} ${currentThemeColors.buttonPrimaryHoverBg} text-white`}
                >
                    Open
                </button>
            </div>
        );
    }

    return (
        <div className={`w-full border rounded-xl transition-all duration-300 ${currentThemeColors.cardBorder} ${currentThemeColors.cardBg}`}>
            <div className={`w-full flex justify-between items-center p-3 font-semibold text-left ${currentThemeColors.headerBackground} border-b ${currentThemeColors.headerBorder}`}>
                <span className={`${currentThemeColors.headingColor}`}>{title}</span>
                <button onClick={() => setIsOpen(false)}>
                    <X className={`h-5 w-5 transition-transform ${currentThemeColors.iconColor} hover:text-red-400`} />
                </button>
            </div>
            <div className={`p-4 border-t ${currentThemeColors.cardBorder} ${currentThemeColors.textPrimary}`}>
                {children}
            </div>
        </div>
    );
};

export default GeneratedContentBlock;