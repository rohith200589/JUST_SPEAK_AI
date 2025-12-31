// src/components/seo/ChatPage.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, Upload, MessageSquareText, Youtube, Plus, XCircle, PanelRightClose, PanelRightOpen, MonitorPlay, Send, Headphones, Wrench, Clock, PackageOpen, Mic, Video, Search, ImageIcon, Sparkles, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme, useDashboard } from '../../pages/SEO.jsx';
import { SEO_URL } from '../../config';

// Internal Common Components
const Card = ({ className, ...props }) => {
    const { themeColors } = useTheme();
    return <div style={{ boxShadow: themeColors.cardShadow }} className={`bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col rounded-lg ${className}`} {...props} />;
};
const CardHeader = ({ className, ...props }) => <div className={`flex flex-row items-center justify-between p-4 pb-2 ${className}`} {...props} />;
const CardTitle = ({ className, ...props }) => <h3 className={`text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2 ${className}`} {...props} />;
const CardContent = ({ className, ...props }) => <div className={`p-4 pt-2 flex-grow ${className}`} {...props} />;
const Skeleton = ({ className }) => <div className={`bg-[var(--bg-subtle)] animate-pulse rounded-md ${className}`} />;
const EmptyState = ({ icon: Icon, title, message }) => (
    <div className="flex flex-col items-center justify-center text-center h-full p-4 text-[var(--text-muted)]">
        <Icon className="h-10 w-10 mb-3" />
        <h4 className="font-semibold text-[var(--text-secondary)]">{title}</h4>
        <p className="text-sm mt-1">{message}</p>
    </div>
);

const ChatInterface = React.memo(({ messages, messagesEndRef, onExploreDashboard, progress }) => {
    const { themeColors } = useTheme();
    const defaultMessages = [{
        id: 'welcome-guide',
        text: (
            <>
                Hello! I'm ready to assist you.
                <br /><br />
                You've successfully started a new chat session. Now, tell me what you'd like to do with the attached content or your query!
                <br /><br />
            </>
        ),
        sender: "AI"
    }];

    const displayMessages = messages.length > 0 ? messages : defaultMessages;
    const lastAIMessage = displayMessages.findLast(msg => msg.sender === 'AI');
    const showExploreButton = lastAIMessage && lastAIMessage.initialData && !lastAIMessage.isThinking;

    const ExpandableMessage = React.memo(({ text }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const words = text.split(' ');
        const showExpandButton = words.length > 50;

        const toggleExpansion = () => setIsExpanded(prev => !prev);

        const displayedText = isExpanded || !showExpandButton
            ? text
            : words.slice(0, 50).join(' ') + '...';

        return (
            <>
                <p className="whitespace-pre-wrap">{displayedText}</p>
                {showExpandButton && (
                    <button onClick={toggleExpansion} className="text-xs font-semibold text-white/70 hover:text-white mt-2">
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </>
        );
    });

    return (
        <div className="flex-grow flex flex-col overflow-y-auto px-4 py-2">
            <div className="flex flex-col space-y-3 justify-end">
                {displayMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2.5 rounded-lg text-sm max-w-[80%] ${msg.sender === 'User' ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]'
                            }`}>
                            {msg.sender === 'User' ? (
                                <ExpandableMessage text={msg.text} />
                            ) : (
                                <>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    {msg.sender === 'AI' && msg.isThinking && (
                                        <div className="flex items-center mt-2">
                                            <Loader2 className="h-4 w-4 animate-spin mr-2 text-[var(--accent-primary)]" />
                                            <span className="text-[var(--accent-primary)]">
                                                {msg.processingStep ? `${msg.processingStep}` : 'Processing'} {progress !== undefined ? `(${progress.toFixed(0)}%)` : '...'}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            {showExploreButton && (
                <div className="flex justify-start mt-4 mb-2">
                    <button
                        onClick={() => onExploreDashboard(lastAIMessage.initialData, lastAIMessage.jobId, lastAIMessage.text)}
                        className="flex items-center gap-1 px-4 py-2 text-white rounded-md text-sm hover:bg-[var(--accent-primary-hover)] transition-colors"
                        style={{ background: themeColors.gradientPrimary }}
                    >
                        Explore in Dashboard <ArrowRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
});

const TranscriptSelectionDialog = React.memo(({ onClose, onSubmit, availableTranscripts }) => {
    const [selectedTranscriptIds, setSelectedTranscriptIds] = useState([]);
    const { themeColors } = useTheme();

    const handleCheckboxChange = (id) => setSelectedTranscriptIds(prev =>
        prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );

    const handleSubmit = () => {
        const selected = availableTranscripts.filter(t => selectedTranscriptIds.includes(t.id));
        onSubmit(selected);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>Select Transcripts</CardTitle>
                    <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--accent-negative)] p-1 rounded-full hover:bg-[var(--bg-subtle)]">
                        <XCircle size={20} />
                    </button>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto space-y-3">
                    {availableTranscripts.length > 0 ? (
                        availableTranscripts.map(transcript => (
                            <label key={transcript.id} className="flex items-center p-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedTranscriptIds.includes(transcript.id)}
                                    onChange={() => handleCheckboxChange(transcript.id)}
                                    className="mr-3 h-4 w-4 accent-[var(--accent-primary)]"
                                />
                                <span className="font-medium text-[var(--text-primary)] text-sm">{transcript.name}</span>
                            </label>
                        ))
                    ) : (
                        <EmptyState icon={FileText} title="No Transcripts" message="No available transcripts found." />
                    )}
                </CardContent>
                <div className="p-4 border-t border-[var(--border-default)] flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={selectedTranscriptIds.length === 0}
                        className="px-4 py-2 text-sm font-medium rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--accent-primary-hover)]"
                        style={{ background: themeColors.gradientPrimary }}
                    >
                        Submit ({selectedTranscriptIds.length})
                    </button>
                </div>
            </Card>
        </div>
    );
});

const AudioVideoUnderDevelopmentDialog = React.memo(({ onClose, onRedirectToTranscripts }) => {
    const { themeColors } = useTheme();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm flex flex-col items-center text-center p-6">
                <Wrench className="h-12 w-12 text-[var(--accent-warning)] mb-4" />
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Feature Under Development</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-6">
                    Direct processing of audio and video files is currently under development.
                    <br />
                    For now, please convert your audio/video content into transcripts.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]">
                        Close
                    </button>
                    <button
                        onClick={onRedirectToTranscripts}
                        className="px-4 py-2 text-sm font-medium rounded-md text-white hover:bg-[var(--accent-primary-hover)]"
                        style={{ background: themeColors.gradientPrimary }}
                    >
                        Go to Transcripts
                    </button>
                </div>
            </Card>
        </div>
    );
});

const RecentGenerationsPanel = React.memo(({ toggleRightPanel }) => {
    const { allDashboardSessions, loadDashboardSessionById, deleteDashboardSession } = useDashboard();
    const { themeColors } = useTheme();
    const navigate = useNavigate();

    const handleItemClick = (item) => {
        loadDashboardSessionById(item.id);
        navigate('/seo/dashboard');
    };

    const handleDeleteSession = (e, sessionId) => {
        e.stopPropagation();
        deleteDashboardSession(sessionId);
    };

    const filteredSessions = allDashboardSessions.filter(
        item => item.name !== 'Initial Dashboard Data'
    );

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle><Clock className="h-4 w-4 text-[var(--text-muted)]" /> Recent Activity</CardTitle>
                {toggleRightPanel && (
                    <button onClick={toggleRightPanel} className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-subtle)]" title="Close Recent Activity">
                        <PanelRightClose size={18} />
                    </button>
                )}
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto space-y-3">
                {filteredSessions.length > 0 ? (
                    <div className="flex flex-col space-y-3">
                        {filteredSessions.slice().reverse().map((item) => (
                            <div key={item.id} style={{ boxShadow: themeColors.itemShadow }} className="flex items-center gap-3 p-3 rounded-lg border bg-[var(--bg-card)] border-[var(--border-default)] cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)]">
                                <div className="flex items-center flex-grow" onClick={() => handleItemClick(item)}>
                                    {item.type === 'transcript' && <FileText size={18} className="text-[var(--accent-primary)] flex-shrink-0" />}
                                    {item.type === 'file' && <Upload size={18} className="text-[var(--accent-positive)] flex-shrink-0" />}
                                    {item.type === 'youtube' && <Youtube size={18} className="text-[var(--accent-negative)] flex-shrink-0" />}
                                    {item.type === 'chat' && <MessageSquareText size={18} className="text-[var(--text-muted)] flex-shrink-0" />}
                                    {item.type === 'initial' && <Sparkles size={18} className="text-[var(--accent-primary)] flex-shrink-0" />}
                                    <div className="flex-grow ml-3">
                                        <p className="font-medium text-sm text-[var(--text-primary)] leading-tight">{item.name}</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{new Date(item.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteSession(e, item.id)}
                                    className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--accent-negative)] hover:bg-[var(--bg-subtle)] transition-colors"
                                    title="Delete session"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState icon={PackageOpen} title="No Recent Activity" message="Your recent uploads and generations will appear here." />
                )}
            </CardContent>
        </Card>
    );
});


const ChatPage = React.memo(() => {
    const {
        uploadedTranscripts, setUploadedTranscripts,
        uploadedFiles, setUploadedFiles,
        uploadedYoutubeUrl, setUploadedYoutubeUrl,
        setRecentGenerations,
        setSelectedKeyword,
        setAllData,
        setIsLoadingInitialData,
        setIsLoadingDetailedData,
        currentDetailedJobIdRef,
        refetchRecentGenerations,
        progress,
        startProgressSimulation,
        stopProgressSimulation,
        setLastUserMessage,
        saveDashboardSession,
        currentSessionId,
        updateSessionWithDetailedData,
        setKeywords,
    } = useDashboard();
    const { theme, themeColors } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
    const [activeInputMode, setActiveInputMode] = useState('chat-history');
    const fileInputRef = useRef(null);

    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [youtubePreview, setYoutubePreview] = useState(null);
    const youtubeInputRef = useRef(null);

    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

    const autoSendHandledRef = useRef(false);

    const [localTranscripts, setLocalTranscripts] = useState([]);

    const toggleRightPanel = () => setIsRightPanelOpen(prev => !prev);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('transcriptHistory');
            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);
                const transcripts = parsedHistory.map(item => ({
                    id: item.id,
                    name: item.title,
                    content: item.transcriptContent,
                }));
                setLocalTranscripts(transcripts);
            }
        } catch (error) {
            console.error("Failed to parse transcript history from localStorage:", error);
            setLocalTranscripts([]);
        }
    }, []);

    const handleExploreDashboard = useCallback((initialData, jobId, lastUserMessage) => {
        setIsLoadingInitialData(true);
        setIsLoadingDetailedData(true);
        currentDetailedJobIdRef.current = jobId;

        stopProgressSimulation();

        startProgressSimulation();

        setMessages(prev => prev.map(msg => msg.id === initialData.aiMessageId ? { ...msg, text: "Initial SEO data is ready! Now fetching related posts...", isThinking: true, processingStep: "Fetching related posts", progress: 0 } : msg));

        setTimeout(() => {
            const newKeywordsFromAI = initialData.keywordsData;
            const primaryKeywordName = initialData.primaryKeywordName;
            const newPlatformTrendsMapFromAI = initialData.platformTrendsMap || [];
            const updatedAllData = { keywords: [], suggested: {}, platformTrends: {}, relatedPosts: {} };
            let primarySelectedKeywordObject = null;
            newKeywordsFromAI.forEach((newKwInfo, index) => {
                const newKeywordObject = {
                    id: newKwInfo.id,
                    name: newKwInfo.name,
                    traffic: newKwInfo.traffic,
                    trend: newKwInfo.trend,
                    prev_traffic: newKwInfo.prevTraffic,
                    suggestions: newKwInfo.suggestions || []
                };
                updatedAllData.keywords.push(newKeywordObject);
                const keywordName = newKwInfo.name;
                if (keywordName) {
                    updatedAllData.suggested[keywordName] = newKwInfo.suggestions || [];
                    if (newPlatformTrendsMapFromAI[index]) updatedAllData.platformTrends[keywordName] = newPlatformTrendsMapFromAI[index];
                    else updatedAllData.platformTrends[keywordName] = [];
                }
                if (primaryKeywordName && newKeywordObject.name === primaryKeywordName) primarySelectedKeywordObject = newKeywordObject;
                else if (!primarySelectedKeywordObject && index === 0) primarySelectedKeywordObject = newKeywordObject;
            });

            const newSession = {
                id: jobId || `session-${Date.now()}`,
                name: lastUserMessage.substring(0, 50) + '...',
                type: 'chat',
                timestamp: Date.now(),
                lastUserMessage: lastUserMessage,
                allData: updatedAllData,
                selectedKeyword: primarySelectedKeywordObject || updatedAllData.keywords[0] || null,
            };

            saveDashboardSession(newSession);
            setAllData(updatedAllData);
            setKeywords(updatedAllData.keywords);
            setSelectedKeyword(primarySelectedKeywordObject || updatedAllData.keywords[0] || null);

            setIsLoadingInitialData(false);
            stopProgressSimulation();
            navigate('/seo/dashboard');
        }, 0);

        if (jobId) {
            const pollInterval = setInterval(async () => {
                if (currentDetailedJobIdRef.current !== jobId) {
                    clearInterval(pollInterval);
                    stopProgressSimulation();
                    return;
                }
                try {
                    const query = `query GetDetailedJobResult($jobId: ID!) { getDetailedDashboardJobResult(jobId: $jobId) { jobId status relatedPostsMap { keywordName posts { title link source image } } } }`;
                    const response = await fetch(`${SEO_URL}/graphql`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query, variables: { jobId } })
                    });
                    const result = await response.json();

                    if (result.errors) {
                        clearInterval(pollInterval);
                        stopProgressSimulation();
                        setIsLoadingDetailedData(false);
                        currentDetailedJobIdRef.current = null;
                        setMessages(prev => prev.map(msg => msg.id === initialData.aiMessageId ? { ...msg, text: "Error fetching detailed data.", isThinking: false, processingStep: null, progress: 100 } : msg));
                        return;
                    }

                    const jobResult = result.data.getDetailedDashboardJobResult;
                    if (jobResult.status === "COMPLETED") {
                        clearInterval(pollInterval);
                        stopProgressSimulation();
                        setIsLoadingDetailedData(false);
                        currentDetailedJobIdRef.current = null;

                        const newRelatedPosts = {};
                        (jobResult.relatedPostsMap || []).forEach(item => {
                            if (item.keywordName) newRelatedPosts[item.keywordName] = item.posts;
                        });

                        updateSessionWithDetailedData(jobId, newRelatedPosts);

                        setMessages(prev => prev.map(msg => msg.id === initialData.aiMessageId ? { ...msg, text: "All SEO data loaded successfully!", isThinking: false, processingStep: null, progress: 100 } : msg));
                        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                    } else if (jobResult.status === "FAILED" || jobResult.status === "NOT_FOUND") {
                        clearInterval(pollInterval);
                        stopProgressSimulation();
                        setIsLoadingDetailedData(false);
                        currentDetailedJobIdRef.current = null;
                        setMessages(prev => prev.map(msg => msg.id === initialData.aiMessageId ? { ...msg, text: "Failed to load detailed data.", isThinking: false, processingStep: null, progress: 100 } : msg));
                        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                    }
                } catch (error) {
                    clearInterval(pollInterval);
                    stopProgressSimulation();
                    setIsLoadingDetailedData(false);
                    currentDetailedJobIdRef.current = null;
                    setMessages(prev => prev.map(msg => msg.id === initialData.aiMessageId ? { ...msg, text: "Network error during detailed data fetch.", isThinking: false, processingStep: null, progress: 100 } : msg));
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }
            }, 3000);
        }
    }, [
        navigate, setAllData, setSelectedKeyword, setIsLoadingInitialData, setIsLoadingDetailedData,
        currentDetailedJobIdRef, startProgressSimulation, stopProgressSimulation, setMessages,
        saveDashboardSession, updateSessionWithDetailedData, setKeywords
    ]);

    const handleSendMessage = useCallback(async (messageText) => {
        if (!messageText.trim() && uploadedTranscripts.length === 0 && uploadedFiles.length === 0 && !uploadedYoutubeUrl) return;

        const transcriptsContent = uploadedTranscripts.map(t => localTranscripts.find(lt => lt.id === t.id)?.content).filter(Boolean);
        const filesContent = uploadedFiles.map(f => `Content of file ${f.name} (placeholder for real content)`);
        const youtubeInfo = uploadedYoutubeUrl ? JSON.stringify({ url: uploadedYoutubeUrl.url, name: uploadedYoutubeUrl.name }) : null;

        let finalMessage = messageText.trim();
        let activityName = finalMessage.substring(0, 50) + '...';
        let activityType = 'chat';

        if (!finalMessage && uploadedTranscripts.length > 0) {
            finalMessage = `Analyze the transcripts: ${uploadedTranscripts.map(t => t.name).join(', ')}.`;
            activityName = `Transcript: ${uploadedTranscripts[0].name}`;
            activityType = 'transcript';
        } else if (!finalMessage && uploadedFiles.length > 0) {
            finalMessage = `Generate an SEO analysis based on the following files: ${uploadedFiles.map(f => f.name).join(', ')}.`;
            activityName = `File Upload: ${uploadedFiles[0].name}`;
            activityType = 'file';
        } else if (!finalMessage && uploadedYoutubeUrl) {
            finalMessage = `Generate an SEO analysis based on the following YouTube video: ${uploadedYoutubeUrl.name}.`;
            activityName = `YouTube URL: ${uploadedYoutubeUrl.name}`;
            activityType = 'youtube';
        }

        const userMessageId = Date.now();
        const aiMessageId = userMessageId + 1;

        setMessages(prev => [...prev, { id: userMessageId, text: finalMessage, sender: 'User' }, { id: aiMessageId, text: 'Generating SEO Analysis Report', sender: 'AI', isThinking: true, processingStep: "Generating Analysis", initialData: { aiMessageId }, jobId: null, progress: 0 }]);
        setNewMessage('');
        startProgressSimulation();

        setUploadedTranscripts([]);
        setUploadedFiles([]);
        setUploadedYoutubeUrl(null);
        setActiveInputMode('chat-history');
        setLastUserMessage(finalMessage);

        try {
            const mutation = `mutation SendChat($message: String!, $transcripts: [String], $files: [String], $youtube: String) { sendChatMessage( message: $message, uploadedTranscriptsContent: $transcripts, uploadedFilesContent: $files, youtubeUrlInfo: $youtube ) { jobId initialData { keywordsData { id name traffic prevTraffic trend suggestions } platformTrendsMap { platform score } primaryKeywordName } } }`;
            const response = await fetch(`${SEO_URL}/graphql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: mutation,
                    variables: { message: finalMessage, transcripts: transcriptsContent.length > 0 ? transcriptsContent : null, files: filesContent.length > 0 ? filesContent : null, youtube: youtubeInfo },
                }),
            });
            const result = await response.json();

            if (result.errors) {
                stopProgressSimulation();
                setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: "Backend error: " + result.errors[0].message, isThinking: false, processingStep: null, progress: 100 } : msg));
                return;
            }

            const chatResponseWithJob = result.data.sendChatMessage;
            const receivedInitialData = chatResponseWithJob.initialData;
            const receivedJobId = chatResponseWithJob.jobId;
            receivedInitialData.aiMessageId = aiMessageId;

            const newRecentGeneration = {
                id: receivedJobId,
                name: activityName,
                type: activityType,
                timestamp: Date.now(),
            };
            setRecentGenerations(prev => [...prev, newRecentGeneration]);

            setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, initialData: receivedInitialData, jobId: receivedJobId, isThinking: true, processingStep: "Initial data received, preparing dashboard...", progress: Math.floor(progress) } : msg));
            handleExploreDashboard(receivedInitialData, receivedJobId, finalMessage);
            refetchRecentGenerations();
        } catch (error) {
            stopProgressSimulation();
            setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: "Network error during data generation.", isThinking: false, processingStep: null, progress: 100 } : msg));
        }
    }, [
        uploadedTranscripts, uploadedFiles, uploadedYoutubeUrl, localTranscripts,
        startProgressSimulation, stopProgressSimulation, setMessages, setNewMessage,
        handleExploreDashboard, messagesEndRef, setRecentGenerations, progress,
        setUploadedTranscripts, setUploadedFiles, setUploadedYoutubeUrl, setActiveInputMode,
        saveDashboardSession, refetchRecentGenerations, setLastUserMessage
    ]);

    useEffect(() => {
        if (location.state?.initiateAutoSend && location.state?.transcriptContent) {
            if (autoSendHandledRef.current) {
                return;
            }
            autoSendHandledRef.current = true;
            const transcriptContentToSend = location.state.transcriptContent;
            handleSendMessage(transcriptContentToSend);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, handleSendMessage]);

    useEffect(() => {
        if (refetchRecentGenerations) {
            refetchRecentGenerations();
        }
    }, [refetchRecentGenerations]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showOptionsDropdown && !event.target.closest('.chat-options-dropdown') && !event.target.closest('.plus-button')) {
                setShowOptionsDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptionsDropdown]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, messages[messages.length - 1]?.text]);

    const handleSendMessageButtonClick = () => handleSendMessage(newMessage.trim());
    const handleUploadFiles = (event) => {
        const files = Array.from(event.target.files);
        setUploadedFiles(prev => [...prev, ...files.map(file => ({ id: Date.now() + Math.random(), name: file.name, size: file.size }))]);
        setActiveInputMode('chat-history');
        setMessages([]);
    };
    const handleRemoveUploadedItem = (type, id) => {
        if (type === 'transcript') setUploadedTranscripts(prev => prev.filter(t => t.id !== id));
        else if (type === 'file') setUploadedFiles(prev => prev.filter(f => f.id !== id));
        else if (type === 'youtube') {
            setUploadedYoutubeUrl(null);
            setYoutubeUrl('');
            setYoutubePreview(null);
        }
    };
    const handleYoutubeUrlSubmit = () => {
        if (youtubeUrl.trim()) {
            const videoIdMatch = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|v\/|)([a-zA-Z0-9_-]{11}))/);
            const videoId = videoIdMatch ? videoId[1] : `url_${Date.now()}`;
            const simulatedTitle = `YouTube Video (${videoId ? videoId.substring(0, 5) + '...' : 'Invalid URL'})`;

            const simulatedThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : `https://placehold.co/120x90/${themeColors.youtubeErrorBg.substring(1)}/${themeColors.youtubeErrorText.substring(1)}?text=Error`;

            setYoutubePreview({ title: simulatedTitle, thumbnail: simulatedThumbnail, id: videoId, url: youtubeUrl });
            setMessages([]);
        }
    };
    const handleConfirmYoutubeUpload = () => {
        if (youtubePreview) {
            setUploadedYoutubeUrl({ id: youtubePreview.id, name: youtubePreview.title, url: youtubePreview.url });
            setYoutubeUrl('');
            setYoutubePreview(null);
            setActiveInputMode('chat-history');
        }
    };

    const chatOptions = [
        { name: "Generate From Transcripts", icon: FileText, action: () => { setActiveInputMode('transcripts'); setShowOptionsDropdown(false); } },
        { name: "Upload Content Files", icon: Upload, action: () => { fileInputRef.current?.click(); setShowOptionsDropdown(false); } },
        { name: "Analyze Youtube URL", icon: Youtube, action: () => { setActiveInputMode('youtube-url'); setShowOptionsDropdown(false); } }
    ];

    return (
        <main className={`flex-1 flex flex-col h-full bg-[var(--bg-default)] text-[var(--text-primary)] relative`}>
            <div className={`flex-grow flex flex-col justify-end p-4 pb-20 sm:pb-[calc(8rem+2rem)] lg:pb-20 mx-auto w-full max-w-[720px] relative`}>
                {activeInputMode === 'chat-history' && messages.length === 0 && uploadedTranscripts.length === 0 && uploadedFiles.length === 0 && !uploadedYoutubeUrl ? (
                    <div className="flex-grow flex flex-col justify-center items-center text-center p-4">
                        <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">Hi, How can I help You Today ?</h2>
                    </div>
                ) : activeInputMode === 'youtube-url' ? (
                    <div className="max-w-xl w-full flex-grow flex flex-col justify-center items-center text-center p-4 mx-auto">
                        <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">Enter YouTube URL</h2>
                        <input
                            type="text"
                            ref={youtubeInputRef}
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleYoutubeUrlSubmit()}
                            placeholder="Paste YouTube URL here..."
                            className="w-full bg-[var(--bg-subtle)] text-sm p-3 rounded-md border border-[var(--border-default)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)] text-[var(--text-primary)] placeholder-[var(--text-muted)] mb-4"
                        />
                        <button
                            onClick={handleYoutubeUrlSubmit}
                            disabled={!youtubeUrl.trim()}
                            className="text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={theme === 'light' ? { background: themeColors.gradientPrimary } : { backgroundColor: themeColors.accentPrimary }}
                        >
                            Preview Video
                        </button>
                        {youtubePreview && (
                            <Card className="mt-8 p-4 w-full flex-col items-center">
                                <CardTitle><MonitorPlay className="h-4 w-4 text-[var(--accent-primary)]" /> Video Preview</CardTitle>
                                <CardContent className="w-full flex flex-col items-center">
                                    {youtubePreview.thumbnail && <img src={youtubePreview.thumbnail} alt="Video Thumbnail" className="w-48 h-auto rounded-md mb-3 border border-[var(--border-default)]" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/120x90/${themeColors.youtubeErrorBg.substring(1)}/${themeColors.youtubeErrorText.substring(1)}?text=Error`; }} />}
                                    <h3 className="font-semibold text-[var(--text-primary)] text-lg text-center mb-2">{youtubePreview.title}</h3>
                                    <p className="text-[var(--text-secondary)] text-sm break-all">{youtubePreview.url}</p>
                                    <button onClick={handleConfirmYoutubeUpload} className="mt-4 bg-[var(--accent-positive)] hover:bg-[var(--accent-positive-hover)] text-white px-6 py-2 rounded-md transition-colors">Confirm Upload</button>
                                </CardContent>
                            </Card>
                        )}
                        <button onClick={() => setActiveInputMode('chat-history')} className="mt-6 px-4 py-2 text-sm font-medium rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]">Back to Chat</button>
                    </div>
                ) : activeInputMode === 'transcripts' ? (
                    <TranscriptSelectionDialog onClose={() => setActiveInputMode('chat-history')} onSubmit={(selected) => {
                        setUploadedTranscripts(selected);
                        setActiveInputMode('chat-history');
                        setMessages([]);
                    }} availableTranscripts={localTranscripts} />
                ) : activeInputMode === 'audio-video-dev' ? (
                    <AudioVideoUnderDevelopmentDialog onClose={() => setActiveInputMode('chat-history')} onRedirectToTranscripts={() => {
                        navigate('/transcript/upload');
                        setActiveInputMode('chat-history');
                    }} />
                ) : (
                    <ChatInterface messages={messages} messagesEndRef={messagesEndRef} onExploreDashboard={handleExploreDashboard} progress={progress} />
                )}
            </div>
            <div style={{ boxShadow: 'var(--card-shadow)', backgroundColor: themeColors.bgSubtle, borderColor: themeColors.borderDefault }} className={`absolute bottom-4 left-1/2 -translate-x-1/2 rounded-2xl border flex flex-col p-2 transition-all duration-300 z-10 w-[calc(100%-2rem)] md:w-[min(100%-4rem,720px)] shadow-2xl`}>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowOptionsDropdown(prev => !prev)} className="plus-button bg-transparent hover:bg-[var(--bg-card-hover)] text-[var(--accent-primary)] w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0" title="Attach or choose an option">
                        <Plus size={20} />
                    </button>
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessageButtonClick()}
                        placeholder="Type your message here..."
                        className="flex-grow bg-transparent text-base px-2.5 py-1.5 rounded-md border-none focus:outline-none focus:ring-0 text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none overflow-hidden h-10 max-h-40"
                        rows={1}
                    />
                    <button
                        onClick={handleSendMessageButtonClick}
                        className="send-button text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Send Message"
                        style={theme === 'light' ? { background: themeColors.gradientPrimary } : { backgroundColor: themeColors.accentPrimary }}
                        disabled={!(typeof newMessage === 'string' && newMessage.trim().length > 0) && uploadedTranscripts.length === 0 && uploadedFiles.length === 0 && !uploadedYoutubeUrl}>
                        <Send size={20} />
                    </button>
                </div>
                {showOptionsDropdown && (
                    <div className="chat-options-dropdown absolute bottom-full left-0 mb-2 p-2 rounded-md bg-[var(--bg-card)] border border-[var(--border-default)] shadow-lg z-20 w-64">
                        {chatOptions.map((option, index) => (
                            <button key={index} className="flex items-center gap-2 p-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] w-full text-left rounded-md" onClick={option.action}>
                                <option.icon className="h-4 w-4" /> {option.name}
                            </button>
                        ))}
                    </div>
                )}
                {(uploadedTranscripts.length > 0 || uploadedFiles.length > 0 || uploadedYoutubeUrl) && (
                    <div className="absolute bottom-full left-0 right-0 flex flex-wrap gap-2 mb-2 p-2 rounded-t-lg bg-[var(--bg-card)] border-b border-[var(--border-default)]">
                        {uploadedTranscripts.map(t => (
                            <span key={t.id} className="inline-flex items-center text-xs font-medium bg-[var(--green-bg)] text-[var(--green-text)] px-2.5 py-1 rounded-full border border-[var(--green-border)]">
                                <FileText size={12} className="mr-1" />
                                {t.name.length > 20 ? t.name.substring(0, 17) + '...' : t.name}
                                <button onClick={() => handleRemoveUploadedItem('transcript', t.id)} className="ml-1 text-[var(--green-text)] hover:opacity-70"><XCircle size={12} /></button>
                            </span>
                        ))}
                        {uploadedFiles.map(f => (
                            <span key={f.id} className="inline-flex items-center text-xs font-medium bg-[var(--accent-warning)] text-white px-2.5 py-1 rounded-full">
                                <Upload size={12} className="mr-1" />
                                {f.name.length > 20 ? f.name.substring(0, 17) + '...' : f.name}
                                <button onClick={() => handleRemoveUploadedItem('file', f.id)} className="ml-1 text-white hover:opacity-70"><XCircle size={12} /></button>
                            </span>
                        ))}
                        {uploadedYoutubeUrl && (
                            <span key={uploadedYoutubeUrl.id} className="inline-flex items-center text-xs font-medium bg-[var(--accent-negative)] text-white px-2.5 py-1 rounded-full">
                                <Youtube size={12} className="mr-1" />
                                {uploadedYoutubeUrl.name.length > 20 ? uploadedYoutubeUrl.name.substring(0, 17) + '...' : uploadedYoutubeUrl.name}
                                <button onClick={() => handleRemoveUploadedItem('youtube', uploadedYoutubeUrl.id)} className="ml-1 text-white hover:opacity-70"><XCircle size={12} /></button>
                            </span>
                        )}
                    </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleUploadFiles} multiple style={{ display: 'none' }} />
            </div>
            <div className={`fixed top-[70px] right-0 h-[calc(100vh-70px)] bg-[var(--bg-card)] border-l border-[var(--border-default)] shadow-xl z-30 transition-transform duration-300 ease-in-out ${isRightPanelOpen ? 'translate-x-0 w-[20rem]' : 'translate-x-full w-[20rem]'} hidden lg:block`}>
                <RecentGenerationsPanel toggleRightPanel={toggleRightPanel} />
            </div>
            {!isRightPanelOpen && (
                <div className="fixed right-0 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
                    <button onClick={toggleRightPanel} className="p-2 rounded-l-md bg-[var(--bg-card)] border border-[var(--border-default)] border-r-0 text-[var(--accent-primary)] shadow-lg hover:bg-[var(--bg-subtle)]" title="Open Recent Activity">
                        <PanelRightOpen size={20} />
                    </button>
                </div>
            )}
        </main>
    );
});

export default ChatPage;