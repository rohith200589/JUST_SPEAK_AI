// src/components/transcript/TranscriptHistory.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, ExternalLink, Download, FileText, BarChart, Lightbulb, Youtube, Volume2, Video } from 'lucide-react';
import { getGlobalTheme } from '../../utils/globalTheme'; // Import the global theme utility

const TranscriptHistory = ({ transcriptHistory = [], setTranscriptHistory, navigate, onLoadHistoryItem }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [theme, setTheme] = useState(getGlobalTheme());

    // Effect to listen to global theme changes
    useEffect(() => {
        const handleThemeChange = (newTheme) => setTheme(newTheme);
        window.addEventListener('themeChange', (e) => handleThemeChange(e.detail));
        window.addEventListener('storage', (e) => {
            if (e.key === 'globalTheme') handleThemeChange(e.newValue);
        });
        return () => {
            window.removeEventListener('themeChange', (e) => handleThemeChange(e.detail));
            window.removeEventListener('storage', (e) => handleThemeChange(e.newValue));
        };
    }, []);

    const darkThemeColors = {
        appBackground: 'bg-[#0f172a]',
        panelBackground: 'bg-[#1e293b]',
        panelBorder: 'border-[#334155]',
        headerBackground: 'bg-gray-800',
        headerBorder: 'border-[#334155]',
        headerText: 'text-[#f1f5f9]',
        iconColor: 'text-white',
        hoverBg: 'hover:bg-[#334155]',
        textPrimary: 'text-[#f1f5f9]',
        textSecondary: 'text-[#94a3b8]',
        buttonPrimaryBg: 'bg-[#0ea5e9]',
        buttonPrimaryHoverBg: 'hover:bg-[#0284c7]',
        buttonDeleteBg: 'bg-red-600',
        buttonDeleteHoverBg: 'hover:bg-red-700',
        inputBg: 'bg-[#0f172a]',
        inputBorder: 'border-[#334155]',
        inputPlaceholder: 'placeholder-[#94a3b8]',
        inputFocusRing: 'focus:ring-[#0ea5e9]',
        inputFocusBorder: 'focus:border-[#0ea5e9]',
        cardBg: 'bg-[#1e293b]',
        cardHoverBg: 'hover:bg-[#2e3a4d]',
        cardBorder: 'border-[#334155]',
        barChartColor: 'text-[#2dd4bf]',
        lightbulbColor: 'text-[#facc15]',
    };

    const lightThemeColors = {
        appBackground: 'bg-white',
        panelBackground: 'bg-white',
        panelBorder: 'border-gray-200',
        headerBackground: 'bg-white',
        headerBorder: 'border-gray-200',
        headerText: 'text-gray-900',
        iconColor: 'text-gray-500',
        hoverBg: 'hover:bg-gray-100',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-500',
        buttonPrimaryBg: 'bg-gradient-to-r from-cyan-500 to-purple-600',
        buttonPrimaryHoverBg: 'hover:from-cyan-600 hover:to-purple-700',
        buttonDeleteBg: 'bg-red-500',
        buttonDeleteHoverBg: 'hover:bg-red-600',
        inputBg: 'bg-gray-50',
        inputBorder: 'border-gray-300',
        inputPlaceholder: 'placeholder-gray-400',
        inputFocusRing: 'focus:ring-cyan-500',
        inputFocusBorder: 'focus:border-cyan-500',
        cardBg: 'bg-white',
        cardHoverBg: 'hover:bg-gray-50',
        cardBorder: 'border-gray-200',
        barChartColor: 'text-green-500',
        lightbulbColor: 'text-yellow-400',
    };

    const currentThemeColors = theme === 'dark' ? darkThemeColors : lightThemeColors;

    const handleDelete = (idToDelete) => {
        if (window.confirm("Are you sure you want to delete this transcript entry?")) {
            const updatedHistory = transcriptHistory.filter(entry => entry.id !== idToDelete);
            setTranscriptHistory(updatedHistory);
        }
    };

    const handleViewDetails = (entry) => {
        onLoadHistoryItem(entry); // Call the prop function
    };

    const filteredHistory = transcriptHistory.filter(entry => {
        const matchesSearch = searchTerm.toLowerCase() === '' ||
            entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.transcriptContent && entry.transcriptContent.toLowerCase().includes(searchTerm.toLowerCase()));

        let entryType;
        if (entry.source === 'youtube' || entry.source === 'videoFile') {
            entryType = 'video';
        } else if (entry.source === 'audioFile') {
            entryType = 'audio';
        } else if (entry.source === 'documentFile' || entry.source === 'file') {
            entryType = 'document';
        } else {
            entryType = 'other';
        }

        const matchesFilter = filter === 'all' || entryType === filter;

        return matchesSearch && matchesFilter;
    });

    const getSourceIcon = (entry) => {
        if (entry.source === 'youtube') return <Youtube className={`h-5 w-5 ${currentThemeColors.iconColor}`} />;
        if (entry.source === 'audioFile') return <Volume2 className={`h-5 w-5 ${currentThemeColors.iconColor}`} />;
        if (entry.source === 'videoFile') return <Video className={`h-5 w-5 ${currentThemeColors.iconColor}`} />;
        if (entry.source === 'documentFile') return <FileText className={`h-5 w-5 ${currentThemeColors.iconColor}`} />;
        return <FileText className={`h-5 w-5 ${currentThemeColors.iconColor}`} />;
    };

    return (
        <div className={`min-h-screen p-8 ${currentThemeColors.appBackground} font-inter`}>
            <div className={`max-w-4xl mx-auto ${currentThemeColors.panelBackground} ${currentThemeColors.panelBorder} border rounded-xl shadow-lg p-6`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-3xl font-bold ${currentThemeColors.headerText}`}>Transcript History</h2>
                    <button
                        onClick={() => navigate('/transcript/upload')}
                        className={`py-2 px-4 rounded-full text-sm font-semibold transition-colors ${currentThemeColors.buttonPrimaryBg} ${currentThemeColors.buttonPrimaryHoverBg} text-white`}
                    >
                        Go to Transcriber
                    </button>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`flex-grow p-3 rounded-md ${currentThemeColors.inputBg} ${currentThemeColors.inputBorder} border ${currentThemeColors.textPrimary} ${currentThemeColors.inputPlaceholder} ${currentThemeColors.inputFocusRing} ${currentThemeColors.inputFocusBorder}`}
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className={`p-3 rounded-md ${currentThemeColors.inputBg} ${currentThemeColors.inputBorder} border ${currentThemeColors.textPrimary}`}
                    >
                        <option value="all">All Types</option>
                        <option value="video">Videos</option>
                        <option value="audio">Audio Files</option>
                        <option value="document">Documents</option>
                    </select>
                </div>

                {filteredHistory.length === 0 ? (
                    <p className={`text-center py-10 ${currentThemeColors.textSecondary}`}>No saved transcripts found matching your criteria.</p>
                ) : (
                    <div className="space-y-4">
                        {filteredHistory.map(entry => (
                            <div key={entry.id} className={`p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between ${currentThemeColors.cardBg} ${currentThemeColors.cardBorder} border ${currentThemeColors.cardHoverBg} transition-colors duration-200`}>
                                <div className="flex-1 mb-4 sm:mb-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getSourceIcon(entry)}
                                        <h3 className={`font-semibold text-lg ${currentThemeColors.textPrimary}`}>{entry.title}</h3>
                                    </div>
                                    <p className={`text-sm ${currentThemeColors.textSecondary}`}>
                                        Saved: {new Date(entry.timestamp).toLocaleString()}
                                    </p>
                                    {entry.analysis && entry.analysis.metrics && entry.analysis.metrics.length > 0 && (
                                        <p className={`text-xs mt-2 ${currentThemeColors.textSecondary}`}>
                                            <BarChart className={`inline h-4 w-4 mr-1 ${currentThemeColors.barChartColor}`} />
                                            Metrics Available
                                        </p>
                                    )}
                                    {entry.insights && entry.insights.points && entry.insights.points.length > 0 && (
                                        <p className={`text-xs mt-1 ${currentThemeColors.textSecondary}`}>
                                            <Lightbulb className={`inline h-4 w-4 mr-1 ${currentThemeColors.lightbulbColor}`} />
                                            Insights Available
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 self-end sm:self-center">
                                    <button
                                        onClick={() => handleViewDetails(entry)}
                                        className={`p-2 rounded-full ${currentThemeColors.hoverBg} ${currentThemeColors.iconColor} transition-colors duration-200`}
                                        title="View Details"
                                    >
                                        <Eye className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className={`p-2 rounded-full ${currentThemeColors.buttonDeleteBg} ${currentThemeColors.buttonDeleteHoverBg} text-white transition-colors duration-200`}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TranscriptHistory;