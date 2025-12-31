// src/components/seo/Header.jsx
import React from 'react';
import { BrainCircuit, Sun, Moon, Share2, ArrowLeft, MessageCirclePlus } from 'lucide-react';
import { useTheme, useDashboard } from '../../pages/SEO.jsx';
import { useNavigate } from 'react-router-dom';

const Header = React.memo(({ currentPath, navigate, onExportClick }) => {
    const { theme, toggleTheme, themeColors } = useTheme();
    const { keywords, lastUserMessage } = useDashboard();
    const localNavigate = useNavigate();
    

    const isChatView = currentPath.startsWith('/seo/chat');

    const handleExportClick = () => {
        const prompt = "Generate posts using the keywords given below :";
        const top10Keywords = keywords.slice(0, 10).map(kw => kw.name).join(', ');
        
        const combinedMessage = `${prompt}\n${top10Keywords}\n\n For the Content : ${lastUserMessage}`;

        localNavigate('/generate-post/generate', {
            state: {
                prompt: combinedMessage,
                focusKeywords: top10Keywords,
            }
        });
    };

    if (isChatView) {
        return (
            <header style={{boxShadow: themeColors.cardShadow}} className="flex flex-wrap items-center justify-between gap-4 px-4 py-2 bg-[var(--bg-card)] border-b border-[var(--border-default)] sticky top-0 z-30 h-16 shadow-xl">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
                        <BrainCircuit className="text-[var(--accent-primary)]" />
                        AI Chat Assistant
                    </h1>
                </div>
                <button onClick={toggleTheme} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-full hover:bg-[var(--bg-subtle)]">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </header>
        );
    }

    // Default Header for Dashboard view
    return (
        <header style={{boxShadow: themeColors.cardShadow}} className="flex flex-wrap items-center justify-between gap-4 px-4 py-2 bg-[var(--bg-card)] border-b border-[var(--border-default)] sticky top-0 z-30 h-16">
            <h1 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]"><BrainCircuit className="text-[var(--accent-primary)]" /> SEO Dashboard</h1>
            <div className="flex items-center gap-4">
                <button
                    onClick={handleExportClick}
                    className="inline-flex items-center justify-center text-sm font-medium transition-colors px-3 py-1.5 border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] rounded-md"
                >
                    <Share2 className="mr-2 h-4 w-4" /> Export
                </button>

                <button onClick={toggleTheme} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-full hover:bg-[var(--bg-subtle)]">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>
        </header>
    );
});

export default Header;