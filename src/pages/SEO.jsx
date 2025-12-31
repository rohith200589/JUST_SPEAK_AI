// src/pages/SEO.jsx

import React, { useState, createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Upload, MessageSquareText, Youtube, Plus, XCircle, PanelRightClose, PanelRightOpen, MonitorPlay, Send, Headphones, Wrench, Clock, PackageOpen, Rocket, ArrowRight, BrainCircuit, TrendingUp, Lightbulb, Users, History, Share2, ArrowLeft } from 'lucide-react';
import { Sun, Moon } from 'lucide-react';

import Header from '../components/seo/Header.jsx';
import DashboardPage from '../components/seo/DashboardPage.jsx';
import IntroPage from '../components/seo/IntroPage.jsx';
import ChatPage from '../components/seo/ChatPage.jsx';
import { setGlobalTheme, getGlobalTheme, subscribeToThemeChange } from '../utils/globalTheme';
import { SEO_URL } from '../config';

// --- THEME & COLOR MANAGEMENT ---
const themes = {
    dark: {
        bgDefault: '#0f172a',
        bgSubtle: '#1e293b',
        bgCard: '#1e293b',
        border: 'border-gray-800',
        bgCardHover: '#334155',
        textPrimary: '#f1f5f9',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',
        borderDefault: '#334155',
        borderSubtle: '#475569',
        accentPrimaryGraph: '#0ea5e9',
        accentPrimary: '#0ea5e9',
        accentPrimaryHover: '#0284c7',
        accentPositive: '#2dd4bf',
        accentNegative: '#f43f5e',
        accentWarning: '#facc15',
        ringFocus: '#0ea5e9',
        greenBg: 'rgba(45, 212, 191, 0.1)',
        greenBorder: 'rgba(45, 212, 191, 0.5)',
        greenText: '#2dd4bf',
        cardShadow: 'none',
        itemShadow: 'none',
        neoBlueHighlight: '#00c6ff',
        purpleAccent: '#8b5cf6',
        cyanAccent: '#06b6d4',
        orangeAccent: '#f97316',
        accentPrimaryIcon: '#0ea5e9',
        accentPrimaryHoverIcon: '#0284c7',
        accentPositiveIcon: '#2dd4bf',
        accentNegativeIcon: '#f43f5e',
        accentWarningIcon: '#facc15',
        ringFocusIcon: '#0ea5e9',
        neoBlueHighlightIcon: '#00c6ff',
        purpleAccentIcon: '#8b5cf6',
        cyanAccentIcon: '#06b6d4',
        orangeAccentIcon: '#f97316',
        pinkAccentIcon: '#f43f5e',
        loaderColor: '#0ea5e9',
        loaderPulse: 'rgba(14, 165, 233, 0.5)',
        youtubeErrorBg: '#1e293b',
        youtubeErrorText: '#94a3b8',
        chartColors: ['#0ea5e9', '#2dd4bf', '#a855f7', '#facc15', '#f43f5e'],
        gradientPrimary: 'linear-gradient(135deg, #0ea5e9, #a855f7)',
    },
    light: {
        bgDefault: '#fcfcfc',
        bgSubtle: '#f9fafb',
        bgCard: '#ffffff',
        border: 'border-gray-100',
        bgCardHover: '#f5f5f6',
        textPrimary: '#161618',
        textSecondary: '#6b7280',
        textMuted: '#a3a3a3',
        borderDefault: '#e5e7eb',
        borderSubtle: '#f3f4f6',
        accentPrimary: '#A100FF',
        accentPrimaryHover: '#6a00c2',
        accentPrimaryGraph: '#0ea5e9',
        accentPrimaryHoverGraph: '#0284c7',
        accentPositive: '#10b981',
        accentNegative: '#ef4444',
        accentWarning: '#eab308',
        ringFocus: '#00C6FF',
        greenBg: 'rgba(16, 185, 129, 0.1)',
        greenBorder: 'rgba(16, 185, 129, 0.4)',
        greenText: '#047857',
        cardShadow: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        itemShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        neoBlueHighlight: '#00C6FF',
        purpleAccent: '#A100FF',
        cyanAccent: '#00C6FF',
        orangeAccent: '#f97316',
        pinkAccent: '#f43f5e',
        neoBlueHighlightIcon: '#00C6FF',
        purpleAccentIcon: '#A100FF',
        cyanAccentIcon: '#00C6FF',
        orangeAccentIcon: '#f97316',
        pinkAccentIcon: '#f43f5e',
        accentPositiveIcon: '#10b981',
        accentNegativeIcon: '#ef4444',
        accentWarningIcon: '#eab308',
        ringFocusIcon: '#00C6FF',
        accentPrimaryIcon: '#5b86ffff',
        loaderColor: '#00C6FF',
        loaderPulse: 'rgba(0, 198, 255, 0.5)',
        youtubeErrorBg: '#e5e7eb',
        youtubeErrorText: '#a3a3a3',
        chartColors: ['#00C6FF', '#10b981', '#a855f7', '#f59e0b', '#ef4444'],
        gradientPrimary: 'linear-gradient(135deg, #00C6FF, #A100FF)',
        gradientPrimaryHeader: 'linear-gradient(135deg, #4c00ffff, #9f00fcff,#4c00ffff)',
    }
};

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

const DashboardContext = createContext(null);
export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
    const getInitialStateFromLocalStorage = (key, defaultValue) => {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.error("Failed to parse state from localStorage:", error);
            return defaultValue;
        }
    };

    const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
    const [isLoadingDetailedData, setIsLoadingDetailedData] = useState(false);

    const [allDashboardSessions, setAllDashboardSessions] = useState(() => getInitialStateFromLocalStorage('allDashboardSessions', []));

    const [currentSessionId, setCurrentSessionId] = useState(() => {
        const sessions = getInitialStateFromLocalStorage('allDashboardSessions', []);
        return sessions.length > 0 ? sessions[sessions.length - 1].id : null;
    });

    const currentSession = currentSessionId ? allDashboardSessions.find(s => s.id === currentSessionId) : null;

    const [keywords, setKeywords] = useState(currentSession?.allData?.keywords || []);
    const [selectedKeyword, setSelectedKeyword] = useState(currentSession?.selectedKeyword || null);
    const [lastUserMessage, setLastUserMessage] = useState(currentSession?.lastUserMessage || '');
    const [allData, setAllData] = useState(currentSession?.allData || {
        keywords: [],
        suggested: {},
        platformTrends: {},
        relatedPosts: {},
    });
    const [userActivityTrendsData, setUserActivityTrendsData] = useState(currentSession?.userActivityTrendsData || []);
    const [generationTypeBreakdownData, setGenerationTypeBreakdownData] = useState(currentSession?.generationTypeBreakdownData || []);
    const [recentGenerations, setRecentGenerations] = useState(currentSession?.recentGenerations || []);

    const [uploadedTranscripts, setUploadedTranscripts] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadedYoutubeUrl, setUploadedYoutubeUrl] = useState(null);

    const currentDetailedJobIdRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('allDashboardSessions', JSON.stringify(allDashboardSessions));
        const lastSessionId = allDashboardSessions.length > 0 ? allDashboardSessions[allDashboardSessions.length - 1].id : null;
        if (currentSessionId !== lastSessionId) {
            setCurrentSessionId(lastSessionId);
        }
    }, [allDashboardSessions]);

    useEffect(() => {
        if (currentSession) {
            setKeywords(currentSession.allData.keywords || []);
            setSelectedKeyword(currentSession.selectedKeyword || null);
            setLastUserMessage(currentSession.lastUserMessage || '');
            setAllData(currentSession.allData || { keywords: [], suggested: {}, platformTrends: {}, relatedPosts: {} });
            setUserActivityTrendsData(currentSession.userActivityTrendsData || []);
            setGenerationTypeBreakdownData(currentSession.generationTypeBreakdownData || []);
            setRecentGenerations(currentSession.recentGenerations || []);
        } else {
            setKeywords([]);
            setSelectedKeyword(null);
            setLastUserMessage('');
            setAllData({ keywords: [], suggested: {}, platformTrends: {}, relatedPosts: {} });
            setUserActivityTrendsData([]);
            setGenerationTypeBreakdownData([]);
            setRecentGenerations([]);
        }
    }, [currentSession]);


    const saveDashboardSession = useCallback((newSessionData) => {
        setAllDashboardSessions(prevSessions => {
            const existingIndex = prevSessions.findIndex(s => s.id === newSessionData.id);
            if (existingIndex !== -1) {
                const updatedSessions = [...prevSessions];
                updatedSessions[existingIndex] = { ...updatedSessions[existingIndex], ...newSessionData };
                return updatedSessions;
            } else {
                return [...prevSessions, newSessionData];
            }
        });
    }, []);

    const loadDashboardSessionById = useCallback((id) => {
        setCurrentSessionId(id);
    }, []);

    const deleteDashboardSession = useCallback((id) => {
        setAllDashboardSessions(prevSessions => {
            const updatedSessions = prevSessions.filter(s => s.id !== id);

            // If the current active session is the one being deleted, switch to the last session in the array
            if (currentSessionId === id && updatedSessions.length > 0) {
                setCurrentSessionId(updatedSessions[updatedSessions.length - 1].id);
            } else if (currentSessionId === id && updatedSessions.length === 0) {
                setCurrentSessionId(null);
            }

            return updatedSessions;
        });
    }, [currentSessionId]);

    const updateSessionWithDetailedData = useCallback((sessionId, newRelatedPosts) => {
        setAllDashboardSessions(prevSessions =>
            prevSessions.map(session =>
                session.id === sessionId
                    ? {
                        ...session,
                        allData: {
                            ...session.allData,
                            relatedPosts: newRelatedPosts
                        }
                    }
                    : session
            )
        );
    }, []);


    useEffect(() => {
        if (allDashboardSessions.length > 0) {
            setIsLoadingInitialData(false);
            return;
        }

        const fetchInitialDashboardDataFromBackend = async () => {
            setIsLoadingInitialData(true);
            try {
                const query = `
                    query GetAllData {
                        getAllDashboardData {
                            keywords {
                                id
                                name
                                traffic
                                prevTraffic
                                trend
                                suggestions
                            }
                            suggested {
                                keyword
                                suggestions
                            }
                            platformTrendsInitial {
                                keywordName
                                trends {
                                    platform
                                    score
                                }
                            }
                            relatedPostsInitial {
                                keywordName
                                posts {
                                    title
                                    link
                                    source
                                    image
                                }
                            }
                        }
                        getUserActivityTrends {
                            name
                            interactions
                            chats
                            uploads
                        }
                        getGenerationTypeBreakdown {
                            name
                            value
                        }
                    }
                `;

                const response = await fetch(`${SEO_URL}/graphql`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query }),
                });
                const result = await response.json();

                if (result.errors) {
                    console.error("GraphQL errors fetching ALL initial dashboard data:", result.errors);
                    throw new Error(result.errors[0].message);
                }

                const data = result.data;
                const dashboardData = data.getAllDashboardData || {};

                const transformedSuggested = (dashboardData.suggested || []).reduce((acc, item) => {
                    acc[item.keyword] = item.suggestions;
                    return acc;
                }, {});
                const fetchedKeywords = dashboardData.keywords || [];
                const transformedPlatformTrends = (dashboardData.platformTrendsInitial || []).reduce((acc, item) => {
                    if (item.keywordName) {
                        acc[item.keywordName] = item.trends || [];
                    }
                    return acc;
                }, {});
                const transformedRelatedPosts = (dashboardData.relatedPostsInitial || []).reduce((acc, item) => {
                    if (item.keywordName) {
                        acc[item.keywordName] = item.posts || [];
                    }
                    return acc;
                }, {});

                const newAllData = {
                    keywords: fetchedKeywords,
                    suggested: transformedSuggested,
                    platformTrends: transformedPlatformTrends,
                    relatedPosts: transformedRelatedPosts,
                };

                const newSession = {
                    id: `session-${Date.now()}`,
                    name: 'Initial Dashboard Data',
                    lastUserMessage: 'Initial data load',
                    allData: newAllData,
                    selectedKeyword: fetchedKeywords[0] || null,
                    userActivityTrendsData: data.getUserActivityTrends || [],
                    generationTypeBreakdownData: data.getGenerationTypeBreakdown || [],
                    recentGenerations: [{ id: Date.now(), name: 'Initial Data', type: 'initial', timestamp: Date.now() }],
                };

                setAllDashboardSessions([newSession]);
                setCurrentSessionId(newSession.id);

            } catch (error) {
                console.error("Error fetching ALL initial dashboard data:", error);
            } finally {
                setIsLoadingInitialData(false);
            }
        };

        fetchInitialDashboardDataFromBackend();

    }, [allDashboardSessions.length]);

    const refetchRecentGenerations = useCallback(() => {
        console.log("Recent Generations update is now handled locally.");
    }, []);

    const progressIntervalRef = useRef(null);
    const maxDuration = 20000;
    const updateInterval = 200;
    const progressIncrement = (100 / (maxDuration / updateInterval));
    const [progress, setProgress] = useState(0);

    const startProgressSimulation = useCallback(() => {
        setProgress(0);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = setInterval(() => {
            setProgress(prevProgress => {
                const newProgress = Math.min(prevProgress + progressIncrement, 100);
                if (newProgress >= 100) clearInterval(progressIntervalRef.current);
                return newProgress;
            });
        }, updateInterval);
    }, [progressIncrement, updateInterval]);

    const stopProgressSimulation = useCallback(() => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
        setProgress(0);
    }, []);

    const updateSessionField = useCallback((field, updaterOrValue) => {
        setAllDashboardSessions(prevSessions =>
            prevSessions.map(s => {
                if (s.id !== currentSessionId) return s;
                const nextValue = typeof updaterOrValue === 'function' ? updaterOrValue(s[field]) : updaterOrValue;
                return { ...s, [field]: nextValue };
            })
        );
    }, [currentSessionId]);

    const updateAllData = useCallback((updaterOrValue) => {
        setAllData(prev => {
            const nextAllData = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
            updateSessionField('allData', nextAllData);
            return nextAllData;
        });
    }, [updateSessionField]);

    const updateKeywords = useCallback((updaterOrValue) => {
        setKeywords(prev => {
            const nextKeywords = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
            updateAllData(prevAllData => ({ ...prevAllData, keywords: nextKeywords }));
            return nextKeywords;
        });
    }, [updateAllData]);

    const updateSelectedKeyword = useCallback((updaterOrValue) => {
        setSelectedKeyword(prev => {
            const nextSelected = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
            updateSessionField('selectedKeyword', nextSelected);
            return nextSelected;
        });
    }, [updateSessionField]);

    const updateRecentGenerations = useCallback((updaterOrValue) => {
        setRecentGenerations(prev => {
            const nextGenerations = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
            updateSessionField('recentGenerations', nextGenerations);
            return nextGenerations;
        });
    }, [updateSessionField]);

    const updateLastUserMessage = useCallback((updaterOrValue) => {
        setLastUserMessage(prev => {
            const nextMessage = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
            updateSessionField('lastUserMessage', nextMessage);
            return nextMessage;
        });
    }, [updateSessionField]);

    const value = {
        allDashboardSessions,
        currentSessionId,
        saveDashboardSession,
        loadDashboardSessionById,
        deleteDashboardSession,
        updateSessionWithDetailedData,

        allData,
        setAllData: updateAllData,
        isLoadingInitialData,
        setIsLoadingInitialData,
        isLoadingDetailedData,
        setIsLoadingDetailedData,
        currentDetailedJobIdRef,
        keywords,
        setKeywords: updateKeywords,
        selectedKeyword,
        setSelectedKeyword: updateSelectedKeyword,
        uploadedTranscripts, setUploadedTranscripts,
        uploadedFiles, setUploadedFiles,
        uploadedYoutubeUrl, setUploadedYoutubeUrl,
        recentGenerations,
        setRecentGenerations: updateRecentGenerations,
        userActivityTrendsData,
        generationTypeBreakdownData,
        refetchRecentGenerations: refetchRecentGenerations,
        progress,
        startProgressSimulation,
        stopProgressSimulation,
        lastUserMessage,
        setLastUserMessage: updateLastUserMessage,
    };
    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};

function SEO() {
    const [theme, setTheme] = useState(getGlobalTheme());

    useEffect(() => {
        subscribeToThemeChange(setTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setGlobalTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme]);

    const themeColors = themes[theme];

    const location = useLocation();
    const navigate = useNavigate();

    const isDashboardView = location.pathname === '/seo/dashboard';
    const isIntroPage = location.pathname === '/seo/chat';
    const isChatPage = location.pathname === '/seo/chat/main';

    const cssVars = Object.entries(themeColors)
        .map(([key, value]) => `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
        .join('');

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, themeColors }}>
            <style>{`
                :root { ${cssVars} }
                body { background-color: var(--bg-default); }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: var(--bg-subtle); }
                ::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: var(--border-default); }
            `}</style>
            <div className={`min-h-screen font-sans flex flex-col ${theme}`}>
                <Header currentPath={location.pathname} navigate={navigate} />
                {isIntroPage ? (
                    <IntroPage navigate={navigate} />
                ) : isChatPage ? (
                    <ChatPage navigate={navigate} />
                ) : isDashboardView ? (
                    <DashboardPage />
                ) : (
                    <div>404 SEO Page Not Found or Redirecting...</div>
                )}
            </div>
        </ThemeContext.Provider>
    );
}

export default SEO;