// src/pages/Transcript.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Menu, Sun, Moon, PlusSquare, FileText, ListTodo, Zap, Languages, BarChart, Sparkles, Edit } from 'lucide-react';
import InitialAndUploadingView from '../components/transcript/InitialAndUploadingView';
import GeneratedView from '../components/transcript/GeneratedView';
import io from 'socket.io-client';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import GeneratingView from '../components/transcript/GeneratingView';
import { setGlobalTheme, getGlobalTheme, subscribeToThemeChange } from '../utils/globalTheme';
import { API_URL as BACKEND_URL } from '../config';

const TranscriptPage = ({ transcriptHistory, setTranscriptHistory }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Replaced local theme state with global theme utility
    const [theme, setTheme] = useState(getGlobalTheme());

    useEffect(() => {
        subscribeToThemeChange(setTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setGlobalTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme]);
    // End global theme state management

    const isInitialView = location.pathname === '/transcript/upload';
    const isGeneratedView = location.pathname === '/transcript/view';
    const isGeneratingView = location.pathname === '/transcript/generating';

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isGenerateSidebarOpen, setGenerateSidebarOpen] = useState(false);

    const [activeTab, setActiveTab] = useState(() => {
        const savedSession = localStorage.getItem('currentTranscriptSession');
        return savedSession ? JSON.parse(savedSession).activeTab || 'file' : 'file';
    });
    const [uploadedFile, setUploadedFile] = useState(() => {
        const savedSession = localStorage.getItem('currentTranscriptSession');
        return savedSession ? JSON.parse(savedSession).uploadedFile || null : null;
    });
    const [videoUrl, setVideoUrl] = useState(() => {
        const savedSession = localStorage.getItem('currentTranscriptSession');
        return savedSession ? JSON.parse(savedSession).videoUrl || '' : '';
    });
    const [youtubeVideoId, setYoutubeVideoId] = useState(() => {
        const savedSession = localStorage.getItem('currentTranscriptSession');
        return savedSession ? JSON.parse(savedSession).youtubeVideoId || '' : '';
    });

    const [isTranscribing, setIsTranscribing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [detailedProgressStatus, setDetailedProgressStatus] = useState('');
    const [isRedirecting, setIsRedirecting] = useState(false);


    const [transcript, setTranscript] = useState(() => {
        const savedSession = localStorage.getItem('currentTranscriptSession');
        return savedSession ? JSON.parse(savedSession).transcript || '' : '';
    });
    const [transcriptTimestamps, setTranscriptTimestamps] = useState(() => {
        const savedSession = localStorage.getItem('currentTranscriptSession');
        return savedSession ? JSON.parse(savedSession).transcriptTimestamps || [] : [];
    });
    // Correctly initialize summaryContent as an object
    const [summaryContent, setSummaryContent] = useState(() => {
        const savedSession = localStorage.getItem('currentTranscriptSession');
        const savedSummary = savedSession ? JSON.parse(savedSession).summaryContent : null;
        return savedSummary || { title: null, subheader: null, points: [] };
    });

    const [rightPanelTab, setRightPanelTab] = useState(() => {
        const savedSession = localStorage.getItem('currentTranscriptSession');
        return savedSession ? JSON.parse(savedSession).rightPanelTab || 'Transcript' : 'Transcript';
    });
    const [transcriptViewTab, setTranscriptViewTab] = useState(() => {
        const savedSession = localStorage.getItem('currentTranscriptSession');
        return savedSession ? JSON.parse(savedSession).transcriptViewTab || 'transcript' : 'transcript';
    });
    const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [chatInput, setChatInput] = useState('');

    // Analysis tab removed — we only maintain Quick Insights (keyInsights)
    const [keyInsights, setKeyInsights] = useState(() => {
        const savedSession = localStorage.getItem('currentTranscriptSession');
        return savedSession ? JSON.parse(savedSession).keyInsights || null : null;
    });

    const [isThinking, setIsThinking] = useState(false);
    const fileInputRef = useRef(null);
    const downloadMenuRef = useRef(null);
    const [leftPanelWidth, setLeftPanelWidth] = useState(40);
    const isResizingRef = useRef(false);
    const resizableAreaRef = useRef(null);
    const [leftPanelView, setLeftPanelView] = useState(() => {
        const savedSession = localStorage.getItem('currentTranscriptSession');
        return savedSession ? JSON.parse(savedSession).leftPanelView || 'insights' : 'insights';
    });
    const [copilotMessages, setCopilotMessages] = useState(() => {
        const savedSession = localStorage.getItem('currentTranscriptSession');
        return savedSession ? JSON.parse(savedSession).copilotMessages || [] : [];
    });
    const copilotChatContainerRef = useRef(null);
    const activeVideoPlayerRef = useRef(null);

    const socket = useRef(null);

    // Helper function to send GraphQL requests to the backend (initialized before use)
    const sendGraphQLRequest = useCallback(async (query, variables) => {
        try {
            const response = await fetch(`${BACKEND_URL}/graphql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, variables }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('GraphQL HTTP Error:', response.status, errorData);
                throw new Error(`GraphQL network error: ${response.status} - ${errorData.errors ? errorData.errors.map(e => e.message).join(', ') : 'Unknown error'}`);
            }

            const result = await response.json();
            if (result.errors) {
                console.error('GraphQL Errors:', result.errors);
                const errorMessage = result.errors.map(err => err.message).join(', ');
                throw new Error(`GraphQL error: ${errorMessage}`);
            }

            return result.data[Object.keys(result.data)[0]];
        } catch (error) {
            console.error('Failed to fetch from backend:', error);
            setIsTranscribing(false);
            setProgress(0);
            setDetailedProgressStatus(`Failed: ${error.message}`);
            alert(`Failed to communicate with the server: ${error.message}`);
            return null;
        }
    }, [BACKEND_URL]);
    // Retry analysis helper (re-uses the existing sendGraphQLRequest above)
    const retryAnalysis = useCallback(async () => {
        if (!transcript) return;
        const query = `mutation AnalyzeText($text: String!) { analyzeText(text: $text) { keyInsights { title points } summaryContent { title subheader points } } }`;
        try {
            const response = await sendGraphQLRequest(query, { text: transcript });
            if (response && response.keyInsights) setKeyInsights(response.keyInsights);
            if (response && response.summaryContent) setSummaryContent(response.summaryContent);
        } catch (e) {
            console.error('Retry analysis failed', e);
            alert('Failed to re-run analysis. Check logs.');
        }
    }, [transcript, sendGraphQLRequest]);

    const getDummySummaryJSX = useCallback((content) => {
        const currentThemeColors = theme === 'dark' ? darkThemeColors : lightThemeColors;
        return (
            <>
                <h4 className={`text-xl font-bold mb-3 ${currentThemeColors.blueText}`}>The Future of Renewable Energy: A Summary</h4>
                {content ? (
                    <p className="whitespace-pre-wrap">{content}</p>
                ) : (
                    <>
                        <h5 className={`text-lg font-semibold mt-4 mb-2 ${currentThemeColors.textPrimary}`}>Key Advancements</h5>
                        <p className="mb-3">The presentation highlights significant progress in both solar and wind power. Solar panel efficiency is increasing due to new materials, while wind turbines are becoming larger and more effective, especially in offshore farms.</p>
                        <h5 className={`text-lg font-semibold mt-4 mb-2 ${currentThemeColors.textPrimary}`}>Supporting Technologies</h5>
                        <p className="mb-3">Battery storage, particularly innovations in lithium-ion, is identified as critical for grid stability. The integration of AI-powered smart grids is also essential for managing diverse and distributed energy sources efficiently.</p>
                        <h5 className={`text-lg font-semibold mt-4 mb-2 ${currentThemeColors.textPrimary}`}>Policy and Collaboration</h5>
                        <p className="mb-3">Government policies and international collaboration are crucial drivers for the adoption of renewable energy. These incentives and partnerships are necessary to overcome challenges and accelerate the transition to a sustainable energy future.</p>
                    </>
                )}
            </>
        );
    }, [theme]);

    const rightPanelTabs = [
        { name: 'Transcript', icon: <FileText size={16} /> },
        { name: 'Generate', icon: <Sparkles size={16} /> },
    ];

    // --- CONSOLIDATED THEME DEFINITIONS ---
    const commonColors = {
        blueText: theme === 'dark' ? 'text-[#0ea5e9]' : 'text-cyan-500',
        yellowText: theme === 'dark' ? 'text-[#facc15]' : 'text-yellow-500',
        greenText: theme === 'dark' ? 'text-[#2dd4bf]' : 'text-green-500',
    };

    const darkThemeColors = {
        quickbg: 'bg-[#1e293b]',
        appBackground: 'bg-[#0f172a]',
        app2Background: 'bg-[#0f172a]',
        panelBackground: 'bg-[#1e293b]',
        panelBorder: 'border-[#334155]',
        border: 'border-[#334155]',
        cardBg: 'bg-[#1e293b]',
        cardBorder: 'border-[#334155]',
        headerBackground: 'bg-gray-800',
        headerBorder: 'border-[#334155]',
        headerText: 'text-[#f1f5f9]',
        headingColor: 'text-[#94a3b8]',
        iconColor: 'text-white',
        hoverBg: 'hover:bg-[#334155]',
        textPrimary: 'text-[#f1f5f9]',
        textSecondary: 'text-[#94a3b8]',
        textSecondary2: 'text-gray-300',
        buttonPrimaryBg: 'bg-[#0ea5e9]',
        buttonPrimaryHoverBg: 'hover:bg-[#0284c7]',
        buttonDeleteBg: 'bg-red-600',
        buttonDeleteHoverBg: 'hover:bg-red-700',
        buttonDisabledBg: 'bg-[#0ea5e9]',
        buttonDisabledText: 'text-gray-300',
        inputBg: 'bg-[#0f172a]',
        inputBorder: 'border-[#334155]',
        inputPlaceholder: 'placeholder-[#94a3b8]',
        inputFocusRing: 'focus:ring-[#0ea5e9]',
        inputFocusBorder: 'focus:border-[#0ea5e9]',
        tabActiveText: 'text-[#0ea5e9]',
        tabInactiveText: 'text-[#94a3b8]',
        tabHoverText: 'hover:text-[#f1f5f9]',
        tabActiveBorder: 'border-[#0ea5e9]',
        tabActiveBackground: 'bg-[#0ea5e9]',
        chatUserBg: 'bg-[#0ea5e9]',
        chatUserText: 'text-white',
        chatBotBg: 'bg-[#1e293b]',
        chatBotText: 'text-[#f1f5f9]',
        chatInputBg: 'bg-[#1e293b]/50',
        chatInputBorder: 'ring-white/20',


        loaderColor: 'text-[#0ea5e9]',
        welcomeIconColor: 'text-[#00c6ff]',
        welcomeHeadline: 'bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text',
        welcomeDescription: 'text-gray-300',
        dashedBorderDefaultColor: 'border-gray-500',
        dashedBorderHoverColor: 'hover:border-[#00c6ff]',
        uploadCardBg: 'bg-gray-800',
        uploadCardBorder: 'border-[#3f4a6c]',
        uploadIconColor: 'text-[#00c6ff]',
        uploadPlaceholderColor: 'text-gray-500',
        uploadSelectedFileBg: 'bg-[#293256]',
        uploadSelectedFileBorder: 'border-[#3f4a6c]',
        uploadSelectedFileText: 'text-gray-200',
        uploadSelectedFileHover: 'hover:text-red-400',
        uploadCardShadow: 'shadow-xl shadow-[#00c6ff]/50',
        uploadCardLiftedGlow: 'shadow-2xl shadow-[#00c6ff]/70 transform scale-[1.02] translate-y-[-10px] ring-2 ring-[#00c6ff]',
        splitterColor: 'bg-gray-700',
        guidingCardBg: 'bg-[#1f2641]',
        guidingCardBorder: 'border-[#3f4a6c]',
        guidingCardHoverBg: 'hover:bg-[#293256]',
        guidingCardShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        textGradient: 'bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text',
        getStartedGradient: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
        analyseSeoGradientFrom: 'from-[#4F46E5]',
        analyseSeoGradientTo: 'to-[#7C3AED]',
        generatePostGradientFrom: 'from-[#10B981]',
        generatePostGradientTo: 'to-[#047857]',
        positiveChange: 'text-[#2dd4bf]',
        negativeChange: 'text-[#f43f5e]',
        neutralChange: 'text-[#64748b]',
        chartGridColor: '#334155',
        chartAxisColor: '#94a3b8',
        chartStrokeColor: "#0ea5e9",
        chartFillColor1: "#0ea5e9",
        chartFillColor2: "#1e293b",
        suggestionCardBg: 'bg-[#1e293b]',
        originalText: 'text-[#94a3b8]',
        suggestionText: 'text-[#2dd4bf]',
        tooltipBg: '#1e293b',
        tooltipBorder: '#334155',
        progressBar: 'bg-[#0ea5e9]',
        progressBg: 'bg-[#334155]',
        playerBorder: 'border-[#334155]',
        playerBg: 'bg-black',
        keywordCardBg: 'bg-[#1e293b]',
        keywordCardBorder: 'border-[#334155]',
        keywordTextColor: 'text-gray-300',
        keywordIconColor: 'text-[#94a3b8]',
        keywordHoverBg: 'hover:bg-[#2e3a4d]',
        keywordActiveBorder: 'border-[#0ea5e9]',

    };

    const lightThemeColors = {
        quickbg: 'bg-white',
        appBackground: 'bg-[#f9f9f9]',
        app2Background: 'bg-gray-100',
        panelBackground: 'bg-[#ffffff]',
        panelBorder: 'border-gray-400/50',
        cardBg: 'bg-white',
        cardBorder: 'border-gray-300',
        headerBackground: 'bg-gray-100/10',
        headerBorder: 'border-gray-300',
        border: 'border-gray-50',
        headerText: 'text-gray-900',
        headingColor: 'text-gray-800',
        iconColor: 'text-gray-500',
        hoverBg: 'hover:bg-gray-100',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-500',
        textSecondary2: 'text-gray-600',
        buttonPrimaryBg: 'bg-gradient-to-r from-blue-500 to-purple-600',
        buttonPrimaryHoverBg: 'hover:from-cyan-600 to-purple-600',
        buttonDeleteBg: 'bg-red-500',
        buttonDeleteHoverBg: 'hover:bg-red-600',
        buttonDisabledBg: 'bg-gradient-to-r from-cyan-500 to-purple-600',
        buttonDisabledText: 'text-gray-200',
        inputBg: 'bg-white',
        inputBorder: 'border-gray-300',
        inputPlaceholder: 'placeholder-gray-400',
        inputFocusRing: 'focus:ring-cyan-500',
        inputFocusBorder: 'focus:border-cyan-500',
        tabActiveText: 'text-violet-500 ',
        tabInactiveText: 'text-gray-900',
        tabHoverText: 'hover:text-gray-700',
        tabActiveBorder: 'border-purple-600',
        tabActiveBackground: 'bg-blue-500',
        chatUserBg: 'bg-cyan-500',
        chatUserText: 'text-white',
        chatBotBg: 'bg-gray-100',
        chatBotText: 'text-gray-900',
        chatInputBg: 'bg-white/80',
        chatInputBorder: 'ring-gray-200',
        loaderColor: 'text-cyan-500',
        welcomeIconColor: 'text-purple-600',
        welcomeHeadline: 'text-gray-900',
        welcomeDescription: 'text-gray-700',
        dashedBorderDefaultColor: 'border-gray-400',
        dashedBorderHoverColor: 'hover:border-violet-400',
        uploadCardBg: 'bg-gray-50/20',
        uploadCardBorder: 'border-gray-300',
        uploadIconColor: 'text-violet-500',
        uploadPlaceholderColor: 'text-gray-800',
        uploadSelectedFileBg: 'bg-gray-100',
        uploadSelectedFileBorder: 'border-gray-300',
        uploadSelectedFileText: 'text-gray-700',
        uploadSelectedFileHover: 'hover:text-red-600',
        uploadCardShadow: 'shadow-md shadow-gray-400/70',
        uploadCardLiftedGlow: 'shadow-2xl shadow-purple-400/70 transform scale-[1.02] translate-y-[-10px] ring-2 ring-purple-100',
        splitterColor: 'bg-gray-400',
        guidingCardBg: 'bg-white',
        guidingCardBorder: 'border-gray-200',
        guidingCardHoverBg: 'hover:bg-gray-100',
        guidingCardShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        textGradient: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text',
        getStartedGradient: 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white',
        analyseSeoGradientFrom: 'from-indigo-600',
        analyseSeoGradientTo: 'to-blue-700',
        generatePostGradientFrom: 'from-green-600',
        generatePostGradientTo: 'to-teal-700',
        positiveChange: 'text-green-500',
        negativeChange: 'text-red-500',
        neutralChange: 'text-gray-500',
        chartGridColor: '#e2e8f0',
        chartAxisColor: '#4a5568',
        chartStrokeColor: "#a78bfa",
        chartFillColor1: "#c578f1ff",
        chartFillColor2: "#a78bfa",
        suggestionCardBg: 'bg-white',
        originalText: 'text-gray-700',
        suggestionText: 'text-green-600',
        tooltipBg: '#FFFFFF',
        tooltipBorder: '#E2E8F0',
        progressBar: 'bg-indigo-500',
        progressBg: 'bg-gray-200',
        playerBorder: 'border-gray-200',
        playerBg: 'bg-white',
        keywordCardBg: 'bg-gray-50',
        keywordCardBorder: 'border-gray-200',
        keywordTextColor: 'text-gray-800',
        keywordIconColor: 'text-gray-500',
        keywordHoverBg: 'hover:bg-gray-100',
        keywordActiveBorder: 'border-cyan-500',
    };

    const currentThemeColors = theme === 'dark' ? { ...darkThemeColors, ...commonColors } : { ...lightThemeColors, ...commonColors };
    // --- END CONSOLIDATED THEME DEFINITIONS ---


    useEffect(() => {
        if (isGeneratedView) {
            const sessionData = {
                transcript,
                transcriptTimestamps,
                summaryContent,
                keyInsights,
                youtubeVideoId,
                videoUrl,
                uploadedFile,
                activeTab,
                rightPanelTab,
                transcriptViewTab,
                leftPanelView,
                copilotMessages,
            };
            try {
                localStorage.setItem('currentTranscriptSession', JSON.stringify(sessionData));
            } catch (error) {
                console.error("Failed to save current session to localStorage:", error);
            }
        } else if (isInitialView) {
            try {
                localStorage.removeItem('currentTranscriptSession');
            } catch (error) {
                console.error("Failed to clear current session from localStorage:", error);
            }
        }
    }, [
        transcript, transcriptTimestamps, summaryContent, keyInsights,
        youtubeVideoId, videoUrl, uploadedFile, activeTab, rightPanelTab,
        transcriptViewTab, leftPanelView, copilotMessages,
        isGeneratedView, isInitialView
    ]);

    useEffect(() => {
        if (location.state && location.state.fromHistory) {
            const {
                transcriptContent, transcriptTimestamps, summaryContent: navSummaryContent, analysis, insights,
                youtubeVideoId: navYoutubeVideoId, uploadedFile: navUploadedFile, activeTab: navActiveTab
            } = location.state;

            setTranscript('');
            setTranscriptTimestamps([]);
            setSummaryContent({ title: null, subheader: null, points: [] });
            setUploadedFile(null);
            setVideoUrl('');
            setYoutubeVideoId('');
            setActiveTab('file');
            setRightPanelTab('Transcript');
            setLeftPanelView('insights');
            setCopilotMessages([]);

            // Analysis data removed — we only load key insights now

            if (insights) {
                setKeyInsights(insights);
            } else {
                setKeyInsights(null);
            }

            if (transcriptContent) setTranscript(transcriptContent);
            if (transcriptTimestamps) setTranscriptTimestamps(transcriptTimestamps);

            // Check if navSummaryContent is a valid object and set the state
            if (navSummaryContent && typeof navSummaryContent === 'object' && navSummaryContent.title) {
                setSummaryContent(navSummaryContent);
                setTranscriptViewTab('summary');
            }


            if (navYoutubeVideoId) {
                setYoutubeVideoId(navYoutubeVideoId);
                setVideoUrl(`youtube.com2{navYoutubeVideoId}`);
                setActiveTab('video');
            } else if (navUploadedFile) {
                setUploadedFile(navUploadedFile);
                setActiveTab('file');
            }

            if (analysis && Object.keys(analysis).length > 0) {
                setRightPanelTab('Analysis');
            } else if (insights && insights.points && insights.points.length > 0) {
                setLeftPanelView('insights');
            }

            navigate(location.pathname, { replace: true, state: { ...location.state, fromHistory: false } });
        }
    }, [location.state, navigate, location.pathname]);

    useEffect(() => {
        socket.current = io(BACKEND_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        socket.current.on('connect', () => {
            console.log('Connected to Socket.IO backend');
        });

        socket.current.on('progress_update', (data) => {
            console.log('Progress Update:', data);
            setDetailedProgressStatus(data.status);
            if (data.type === 'overall' && data.percentage !== null) {
                setProgress(Math.round(data.percentage));
            }
        });

        socket.current.on('disconnect', () => {
            console.log('Disconnected from Socket.IO backend');
            setDetailedProgressStatus('Disconnected from server.');
            setIsTranscribing(false);
            setProgress(0);
        });

        socket.current.on('error', (error) => {
            console.error('Socket.IO Error:', error);
            setDetailedProgressStatus(`Socket.IO connection error: ${error.message || error}`);
            alert(`Socket.IO connection error: ${error.message || error}`);
            setIsTranscribing(false);
            setProgress(0);
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [BACKEND_URL]);

    const handleMouseMove = useCallback((e) => {
        if (!isResizingRef.current || !resizableAreaRef.current) return;
        const containerRect = resizableAreaRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        if (newLeftWidth > 20 && newLeftWidth < 80) {
            setLeftPanelWidth(newLeftWidth);
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isResizingRef.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }, [handleMouseMove]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        isResizingRef.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // sendGraphQLRequest is defined earlier via useCallback to avoid TDZ issues

    const getFileTypeCategory = (file) => {
        if (!file) return 'none';

        const mimeType = file.type;
        const fileNameLower = file.name.toLowerCase();

        if (mimeType.startsWith('video/') ||
            fileNameLower.endsWith('.mp4') ||
            fileNameLower.endsWith('.mov') ||
            fileNameLower.endsWith('.avi') ||
            fileNameLower.endsWith('.webm')) {
            return 'videoFile';
        }
        if (mimeType.startsWith('audio/') ||
            fileNameLower.endsWith('.mp3') ||
            fileNameLower.endsWith('.wav') ||
            fileNameLower.endsWith('.ogg')) {
            return 'audioFile';
        }
        if (mimeType === 'application/pdf' ||
            fileNameLower.endsWith('.pdf') ||
            mimeType === 'application/msword' ||
            fileNameLower.endsWith('.doc') ||
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileNameLower.endsWith('.docx') ||
            mimeType.startsWith('text/') ||
            fileNameLower.endsWith('.txt')) {
            return 'documentFile';
        }
        return 'file';
    };

    const handleFileChange = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedFile(file);
            setYoutubeVideoId('');
            setVideoUrl('');
            setSearchTerm('');
            setProgress(0);
            setDetailedProgressStatus('');
            setIsTranscribing(false);
            // analysisData cleared (no analysis tab)
            setKeyInsights(null);
        }
    }, []);

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files[0];
        if (file) {
            setUploadedFile(file);
            setYoutubeVideoId('');
            setVideoUrl('');
            setSearchTerm('');
            setProgress(0);
            setDetailedProgressStatus('');
            setIsTranscribing(false);
            // analysisData cleared (no analysis tab)
            setKeyInsights(null);
        }
    }, []);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const getYouTubeVideoId = (url) => {
        const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
        const match = url.match(regExp);
        return (match && match[1].length === 11) ? match[1] : null;
    };

    const handleVideoUrlChange = useCallback((event) => {
        const url = event.target.value;
        setVideoUrl(url);
        const id = getYouTubeVideoId(url);
        setYoutubeVideoId(id || '');
        if (id) {
            setUploadedFile(null);
            setSearchTerm('');
            setProgress(0);
            setDetailedProgressStatus('');
            setIsTranscribing(false);
            // analysis data removed
            setKeyInsights(null);
        }
    }, []);

    const handleGenerateTranscript = useCallback(async () => {
        if (!uploadedFile && !youtubeVideoId) {
            alert("Please upload a file or enter a YouTube URL.");
            return;
        }

        setTranscript('');
        setTranscriptTimestamps([]);
        setSummaryContent({ title: null, subheader: null, points: [] });
        // analysis data removed
        setKeyInsights(null);
        setCopilotMessages([]);

        setIsTranscribing(true);
        setProgress(0);
        setDetailedProgressStatus('Initiating transcription...');

        let mutationName = '';
        let variables = {};
        let query = '';
        let currentFileSource = '';
        let currentFileMimeType = '';
        let historyEntryTitle = '';
        let result = null;

        const baseQueryFields = `
            timestamps {
                time
                text
            }
            fullTranscriptContent
            keyInsights {
                title
                points
            }
            summaryContent {
                title
                subheader
                points
            }
        `;

        try {
            if (activeTab === 'file' && uploadedFile) {
                mutationName = 'transcribeFile';
                currentFileSource = getFileTypeCategory(uploadedFile);
                currentFileMimeType = uploadedFile.type;
                historyEntryTitle = uploadedFile.name;

                const reader = new FileReader();
                await new Promise((resolve, reject) => {
                    reader.onload = async (e) => {
                        const base64Content = e.target.result;
                        variables = {
                            fileContent: base64Content,
                            fileName: uploadedFile.name,
                            fileMimeType: uploadedFile.type
                        };
                        query = `
                            mutation ${mutationName}($fileContent: String!, $fileName: String!, $fileMimeType: String!) {
                                ${mutationName}(fileContent: $fileContent, fileName: $fileName, fileMimeType: $fileMimeType) {
                                    ${baseQueryFields}
                                }
                            }
                        `;
                        result = await sendGraphQLRequest(query, variables);
                        resolve();
                    };
                    reader.onerror = (error) => {
                        console.error("Error reading file:", error);
                        alert("Error reading file.");
                        setDetailedProgressStatus('Error reading file.');
                        setProgress(0);
                        setIsTranscribing(false);
                        reject(error);
                    };
                    reader.readAsDataURL(uploadedFile);
                });
            } else if (activeTab === 'video' && youtubeVideoId) {
                mutationName = 'transcribeVideo';
                currentFileSource = 'youtube';
                historyEntryTitle = youtubeVideoId;
                variables = { url: videoUrl };
                query = `
                    mutation ${mutationName}($url: String!) {
                        ${mutationName}(url: $url) {
                            ${baseQueryFields}
                        }
                    }
                `;
                result = await sendGraphQLRequest(query, variables);
            } else {
                alert("Invalid input. Please try again.");
                setDetailedProgressStatus('Invalid input.');
                setProgress(0);
                setIsTranscribing(false);
            }

            if (result) {
                setTranscript(result.fullTranscriptContent);
                setTranscriptTimestamps(result.timestamps || []);
                // Analysis feature removed; only set key insights and summary
                setKeyInsights(result.keyInsights);
                setSummaryContent(result.summaryContent);

                const isDocument = (uploadedFile && (uploadedFile.type.startsWith('application/') || uploadedFile.type.startsWith('text/')));
                // Logic to set the initial tab to summary if a document is processed
                if (isDocument && result.summaryContent && result.summaryContent.title) {
                    setTranscriptViewTab('summary');
                } else if (!isDocument && result.fullTranscriptContent) {
                    setTranscriptViewTab('transcript');
                } else {
                    setSummaryContent({ title: null, subheader: null, points: [] });
                    setTranscriptViewTab('transcript');
                }

                const newEntry = {
                    id: Date.now(),
                    title: historyEntryTitle,
                    source: currentFileSource,
                    fileMimeType: currentFileMimeType,
                    timestamp: new Date().toISOString(),
                    transcriptContent: result.fullTranscriptContent,
                    transcriptTimestamps: result.timestamps || [],
                    summaryContent: result.summaryContent,
                    // analysis removed
                    insights: result.keyInsights,
                    youtubeVideoId: currentFileSource === 'youtube' ? youtubeVideoId : undefined,
                    uploadedFile: currentFileSource !== 'youtube' ? uploadedFile : undefined,
                    activeTab: activeTab
                };
                setTranscriptHistory(prevHistory => [newEntry, ...prevHistory]);

                setDetailedProgressStatus('Redirecting to transcript...');
                setIsRedirecting(true);
                navigate('/transcript/view');
                setRightPanelTab('Transcript');
                setIsTranscribing(false);
            }
        } catch (error) {
            console.error("Caught error in handleGenerateTranscript:", error);
            setDetailedProgressStatus(`Error during transcription: ${error.message}`);
            setIsTranscribing(false);
            setProgress(0);
        }
    }, [activeTab, uploadedFile, youtubeVideoId, videoUrl, BACKEND_URL, sendGraphQLRequest, navigate, setRightPanelTab, setTranscriptViewTab, setTranscriptHistory]);

    const handleCopilotRequest = useCallback(async (userMessageText) => {
        if (!userMessageText.trim()) return;

        const userMessage = { id: Date.now(), sender: 'user', text: userMessageText };
        setCopilotMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsThinking(true);

        setDetailedProgressStatus('Sending chat command to AI...');
        setProgress(0);

        try {
            const query = `
            mutation ProcessChatCommand($userMessage: String!, $currentTranscript: String, $youtubeUrl: String) {
                processChatCommand(userMessage: $userMessage, currentTranscript: $currentTranscript, youtubeUrl: $youtubeUrl) {
                    aiChatMessage
                    processedContent
                }
            }
        `;
            const variables = {
                userMessage: userMessageText,
                currentTranscript: transcript,
                youtubeUrl: youtubeVideoId ? `youtube.com/${youtubeVideoId}` : null // Corrected URL format
            };

            const response = await fetch(`${BACKEND_URL}/graphql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('GraphQL HTTP Error for chat:', response.status, errorData);
                throw new Error(`GraphQL network error: ${response.status} - ${errorData.errors ? errorData.errors.map(e => e.message).join(', ') : 'Unknown error'}`);
            }

            const result = await response.json();

            if (result.errors) {
                console.error('GraphQL Errors:', result.errors);
                const errorMessage = result.errors.map(err => err.message).join(', ');
                const botErrorMsg = { id: Date.now() + 1, sender: 'bot', text: `Error: ${errorMessage}` };
                setCopilotMessages(prev => [...prev, botErrorMsg]);
                setDetailedProgressStatus(`Chat error: ${errorMessage}`);
                return;
            }

            const { aiChatMessage, processedContent } = result.data.processChatCommand;

            const botTextMessage = { id: Date.now() + 1, sender: 'bot', text: aiChatMessage };
            setCopilotMessages(prev => [...prev, botTextMessage]);

            if (processedContent) {
                const contentTitle = userMessageText.length > 30 ? userMessageText.substring(0, 27) + "..." : userMessageText;
                const botMainContentMessage = {
                    id: Date.now() + 2,
                    sender: 'bot',
                    text: processedContent,
                    isMainContent: true,
                    title: `Result for: "${contentTitle}"`,
                    timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                };
                setCopilotMessages(prev => [...prev, botMainContentMessage]);
            }
            setDetailedProgressStatus('Chat response received.');
            setProgress(100);
        } catch (error) {
            console.error('Failed to send chat command to backend:', error);
            const botErrorMsg = { id: Date.now() + 1, sender: 'bot', text: `I apologize, but I couldn't process your request due to a network error or an issue with the AI: ${error.message}` };
            setCopilotMessages(prev => [...prev, botErrorMsg]);
            setDetailedProgressStatus(`Chat processing failed: ${error.message}`);
            setProgress(0);
        } finally {
            setIsThinking(false);
        }
    }, [transcript, youtubeVideoId, BACKEND_URL]);

    const handleNewChat = useCallback(() => {
        setCopilotMessages([]);
        setChatInput('');
        setIsTranscriptOpen(false);
        setDetailedProgressStatus('');
        setProgress(0);
    }, []);

    const handleSeek = useCallback((timeInSeconds) => {
        if (activeVideoPlayerRef.current) {
            if (youtubeVideoId) {
                const youtubeSrc = `https://www.youtube.com/embed/${youtubeVideoId}?start=${Math.floor(timeInSeconds)}&autoplay=1`;
                activeVideoPlayerRef.current.src = youtubeSrc;
            } else if (uploadedFile && activeVideoPlayerRef.current instanceof HTMLMediaElement) {
                activeVideoPlayerRef.current.currentTime = timeInSeconds;
                activeVideoPlayerRef.current.play();
            }
        }
    }, [youtubeVideoId, uploadedFile]);

    useEffect(() => {
        if (!searchTerm || transcriptTimestamps.length === 0) {
            setSearchResults([]);
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const newResults = [];

        transcriptTimestamps.forEach((segment, index) => {
            const segmentText = segment.text || '';
            const lowerCaseSegmentText = segmentText.toLowerCase();

            let lastIndex = 0;
            while ((lastIndex = lowerCaseSegmentText.indexOf(lowerCaseSearchTerm, lastIndex)) !== -1) {
                const contextWindow = 30;
                const startContext = Math.max(0, lastIndex - contextWindow);
                const endContext = Math.min(segmentText.length, lastIndex + lowerCaseSearchTerm.length + contextWindow);

                let preview = segmentText.substring(startContext, endContext);
                const actualMatchStartIndex = lastIndex - startContext;
                const actualMatchEndIndex = actualMatchStartIndex + lowerCaseSearchTerm.length;

                newResults.push({
                    segmentTime: segment.time,
                    preview: preview,
                    matchStartIndex: actualMatchStartIndex,
                    matchEndIndex: actualMatchEndIndex
                });
                lastIndex += lowerCaseSearchTerm.length;
            }
        });

        setSearchResults(newResults);
    }, [searchTerm, transcriptTimestamps]);

    useEffect(() => {
        if (copilotChatContainerRef.current) {
            copilotChatContainerRef.current.scrollTop = copilotChatContainerRef.current.scrollHeight;
        }
    }, [copilotMessages]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target)) {
                setShowDownloadMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const resetApp = useCallback(() => {
        setActiveTab('file');
        setUploadedFile(null);
        setVideoUrl('');
        setYoutubeVideoId('');
        setProgress(0);
        setDetailedProgressStatus('');
        setIsTranscribing(false);
        setTranscript('');
        setTranscriptTimestamps([]);
        setSummaryContent({ title: null, subheader: null, points: [] });
        setSearchTerm('');
        setSearchResults([]);
        setChatInput('');
        setRightPanelTab('Transcript');
        setTranscriptViewTab('transcript');
        setCopilotMessages([]);
        setIsTranscriptOpen(false);
        activeVideoPlayerRef.current = null;
        // analysis data removed
        setKeyInsights(null);
        setIsRedirecting(false);
        try {
            localStorage.removeItem('currentTranscriptSession');
        } catch (error) {
            console.error("Failed to clear current session from localStorage on reset:", error);
        }
        navigate('/transcript/upload');
    }, [navigate]);

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };


    const renderContent = () => {
        if (isInitialView) {
            return (
                <InitialAndUploadingView
                    theme={theme}
                    setTheme={setTheme}
                    toggleTheme={toggleTheme}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    uploadedFile={uploadedFile}
                    youtubeVideoId={youtubeVideoId}
                    videoUrl={videoUrl}
                    handleVideoUrlChange={handleVideoUrlChange}
                    handleFileChange={handleFileChange}
                    handleDrop={handleDrop}
                    handleDragOver={handleDragOver}
                    fileInputRef={fileInputRef}
                    handleGenerateTranscript={handleGenerateTranscript}
                    setUploadedFile={setUploadedFile}
                    progress={progress}
                    detailedProgressStatus={detailedProgressStatus}
                    isTranscribing={isTranscribing}
                    isRedirecting={isRedirecting}
                    currentThemeColors={currentThemeColors}
                />
            );
        } else if (isGeneratingView) {
            return (
                <GeneratingView
                    theme={theme}
                    progress={progress}
                    detailedProgressStatus={detailedProgressStatus}
                    isTranscribing={isTranscribing}
                    transcript={transcript}
                    summaryContent={summaryContent}
                    navigate={navigate}
                    setIsTranscribing={setIsTranscribing}
                    setDetailedProgressStatus={setDetailedProgressStatus}
                    isRedirecting={isRedirecting}
                    currentThemeColors={currentThemeColors}
                />
            );
        }
        else if (isGeneratedView) {
            if (!transcript && !youtubeVideoId && !uploadedFile) {
                return <Navigate to="/transcript/upload" replace />;
            }
            return (
                <GeneratedView
                    theme={theme}
                    toggleTheme={toggleTheme} // Pass toggleTheme down
                    leftPanelWidth={leftPanelWidth}
                    handleMouseDown={handleMouseDown}
                    setLeftPanelView={setLeftPanelView}
                    youtubeVideoId={youtubeVideoId}
                    uploadedFile={uploadedFile}
                    videoUrl={videoUrl}
                    handleVideoUrlChange={handleVideoUrlChange}
                    handleFileChange={handleFileChange}
                    handleDrop={handleDrop}
                    handleDragOver={handleDragOver}
                    fileInputRef={fileInputRef}
                    handleGenerateTranscript={handleGenerateTranscript}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    handleFullscreen={handleFullscreen}
                    rightPanelTabs={rightPanelTabs}
                    rightPanelTab={rightPanelTab}
                    setRightPanelTab={setRightPanelTab}
                    showDownloadMenu={showDownloadMenu}
                    setShowDownloadMenu={setShowDownloadMenu}
                    downloadMenuRef={downloadMenuRef}
                    setGenerateSidebarOpen={setGenerateSidebarOpen}
                    isGenerateSidebarOpen={isGenerateSidebarOpen}
                    setIsTranscriptOpen={setIsTranscriptOpen}
                    isTranscriptOpen={isTranscriptOpen}
                    transcript={transcript}
                    transcriptTimestamps={transcriptTimestamps}
                    copilotChatContainerRef={copilotChatContainerRef}
                    copilotMessages={copilotMessages}
                    handleCopilotRequest={handleCopilotRequest}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    transcriptViewTab={transcriptViewTab}
                    setTranscriptViewTab={setTranscriptViewTab}
                    structuredSummary={summaryContent}
                    currentThemeColors={currentThemeColors}
                    resizableAreaRef={resizableAreaRef}
                    leftPanelView={leftPanelView}
                    setUploadedFile={setUploadedFile}
                    activeVideoPlayerRef={activeVideoPlayerRef}

                    retryAnalysis={retryAnalysis}
                    handleSeek={handleSeek}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchResults={searchResults}
                    resetApp={resetApp}
                    handleNewChat={handleNewChat}

                    keyInsights={keyInsights}
                    isTranscribing={isTranscribing}
                    isThinking={isThinking}
                />
            );
        }
        return <Navigate to="/transcript/upload" replace />;
    };

    return (
        <div className={`min-h-screen font-inter ${currentThemeColors.appBackground}`}>
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://unpkg.com/recharts/umd/Recharts.min.js"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <style>
                {`
        body { font-family: 'Inter', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cccccc; }
        .dark-theme .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #bbbbbb; }
        .dark-theme .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Custom Audio Player Styles */
        /* Webkit (Chrome, Safari, Edge) */
        .custom-audio-player-dark audio::-webkit-media-controls-panel {
            background-color: ${darkThemeColors.panelBackground};
            color: ${darkThemeColors.textPrimary};
            border-radius: 0;
        }
        .custom-audio-player-dark audio::-webkit-media-controls-play-button,
        .custom-audio-player-dark audio::-webkit-media-controls-current-time-display,
        .custom-audio-player-dark audio::-webkit-media-controls-time-remaining-display,
        .custom-audio-player-dark audio::-webkit-media-controls-timeline,
        .custom-audio-player-dark audio::-webkit-media-controls-volume-slider,
        .custom-audio-player-dark audio::-webkit-media-controls-volume-button {
            color: ${darkThemeColors.textPrimary};
        }
        .custom-audio-player-dark audio::-webkit-media-controls-timeline {
            background-color: ${darkThemeColors.progressBg};
        }
        .custom-audio-player-dark audio::-webkit-media-controls-play-button:hover,
        .custom-audio-player-dark audio::-webkit-media-controls-volume-button:hover {
            background-color: ${darkThemeColors.progressBg};
        }

        /* Firefox */
        .custom-audio-player-dark audio {
            --moz-range-thumb-background: ${currentThemeColors.blueText};
            --moz-range-track-background: ${darkThemeColors.progressBg};
            background-color: ${darkThemeColors.panelBackground};
            border-radius: 0;
        }


        /* Light Theme Audio Player Styles */
        /* Webkit (Chrome, Safari, Edge) */
        .custom-audio-player-light audio::-webkit-media-controls-panel {
            background-color: ${lightThemeColors.panelBackground};
            color: ${lightThemeColors.textPrimary};
            border-radius: 0;
        }
        .custom-audio-player-light audio::-webkit-media-controls-play-button,
        .custom-audio-player-light audio::-webkit-media-controls-current-time-display,
        .custom-audio-player-light audio::-webkit-media-controls-time-remaining-display,
        .custom-audio-player-light audio::-webkit-media-controls-timeline,
        .custom-audio-player-light audio::-webkit-media-controls-volume-slider,
        .custom-audio-player-light audio::-webkit-media-controls-volume-button {
            color: ${lightThemeColors.textPrimary};
        }
        .custom-audio-player-light audio::-webkit-media-controls-timeline {
            background-color: ${lightThemeColors.progressBg};
        }
        .custom-audio-player-light audio::-webkit-media-controls-play-button:hover,
        .custom-audio-player-light audio::-webkit-media-controls-volume-button:hover {
            background-color: ${lightThemeColors.hoverBg};
        }

        /* Firefox */
        .custom-audio-player-light audio {
            --moz-range-thumb-background: ${currentThemeColors.blueText};
            --moz-range-track-background: ${lightThemeColors.progressBg};
            background-color: ${lightThemeColors.panelBackground};
            border-radius: 0;
        }
        `}
            </style>
            {isSidebarOpen && (
                <div className={`absolute top-0 left-0 h-full w-64 p-4 transition-transform duration-300 ease-in-out ${currentThemeColors.appBackground} z-30 flex flex-col`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className={`text-xl font-bold ${currentThemeColors.headerText}`}>History</h2>
                        <button onClick={() => setIsSidebarOpen(false)} className={`p-2 rounded-full ${currentThemeColors.iconColor} ${currentThemeColors.hoverBg}`}>
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                        <button
                            onClick={() => { navigate('/transcript/history'); setIsSidebarOpen(false); }}
                            className={`p-2 rounded-md mb-2 w-full text-left flex items-center gap-2 ${currentThemeColors.panelBackground} ${currentThemeColors.textPrimary} ${currentThemeColors.hoverBg}`}
                        >
                            <ListTodo className="h-5 w-5" /> View All Transcripts
                        </button>
                    </div>
                    <div className={`mt-auto pt-4 border-t ${currentThemeColors.panelBorder}`}>
                        <button className={`w-full mb-2 py-2 px-4 rounded-lg text-white font-semibold ${currentThemeColors.buttonPrimaryBg} ${currentThemeColors.buttonPrimaryHoverBg}`}>Settings</button>
                        <button className={`w-full mb-2 py-2 px-4 rounded-lg text-white font-semibold ${currentThemeColors.buttonPrimaryBg} ${currentThemeColors.buttonPrimaryHoverBg}`}>Help</button>
                        <button className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${currentThemeColors.buttonDeleteBg} ${currentThemeColors.buttonDeleteHoverBg}`}>Logout</button>
                    </div>
                </div>
            )}
            {renderContent()}
        </div>
    );
};

export default TranscriptPage;