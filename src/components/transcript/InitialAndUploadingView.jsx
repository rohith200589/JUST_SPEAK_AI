// src/components/transcript/InitialAndUploadingView.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Upload, FileText, Youtube, Brain, BookText, Share2, Sparkles, Settings, ArrowRight, Loader, BrainCircuit, Sun, Moon, FileClock, History, AlertCircle, Info, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- NEW HEADER COMPONENT ---
const AppHeader = ({ themeColors, toggleTheme, theme }) => {
    const navigate = useNavigate(); // Initialize the useNavigate hook

    const handleHistoryClick = () => {
        navigate('/transcript/history');
    };

    return (

        <header className={`w-full py-4 px-4 md:px-8 lg:px-4 flex justify-between items-center ${themeColors.quickbg} border-b ${themeColors.border} mb-6 shadow-md`}>
            <h2 className={`text-xl font-semibold flex items-center gap-2 ${themeColors.headerText} fontFamily-sans-serif`}>
                <BrainCircuit className={`${themeColors.welcomeIconColor} h-6 w-6`} />
                Transcript

            </h2>

            <div className="flex items-center gap-2">
                {/* File-Clock icon button to redirect to history */}
                <button
                    onClick={handleHistoryClick}
                    className={`rounded-full p-2 ${themeColors.headerBackground} ${themeColors.hoverBg} transition duration-300 ${themeColors.textPrimary}`}
                    title="View Transcript History"
                >
                    <History className="h-5 w-5" />
                </button>

                {/* Theme Toggle Icon Button */}
                <button
                    onClick={toggleTheme}
                    className={`rounded-full p-2 ${themeColors.headerBackground} ${themeColors.hoverBg} transition duration-300 ${themeColors.textPrimary}`}
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-5 w-5" />}
                </button>
            </div>
        </header>
    );
};
// --- END NEW HEADER COMPONENT ---

// --- VIDEO WARNING MODAL ---
const VideoWarningModal = ({ isOpen, onClose, themeColors }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={`${themeColors.panelBackground} ${themeColors.uploadCardBorder} border rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-10`}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-yellow-500/10 p-4 rounded-full mb-4">
                                <Youtube className="h-10 w-10 text-yellow-500" />
                            </div>
                            <h3 className={`text-2xl font-bold ${themeColors.textPrimary} mb-4`}>Feature Limited</h3>
                            <p className={`${themeColors.textPrimary} opacity-90 mb-8 leading-relaxed font-medium`}>
                                We're sorry, but YouTube transcription is currently restricted in the production environment.
                            </p>
                            <div className={`p-4 rounded-xl border ${themeColors.panelBorder} bg-blue-500/5 mb-8 shadow-sm w-full`}>
                                <p className={`text-sm ${themeColors.textPrimary} font-semibold flex items-center justify-center gap-2 mb-4`}>
                                    <Sparkles className="h-4 w-4 text-orange-400" />
                                    Run locally with your API keys for instant results, including YouTube!
                                </p>
                                <a
                                    href="https://github.com/rohith200589/JUST_SPEAK_AI-WORKING-VERSION.git"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium text-sm"
                                >
                                    <Github className="h-4 w-4" />
                                    Download from GitHub
                                </a>
                            </div>
                            <button
                                onClick={onClose}
                                className={`${themeColors.buttonPrimaryBg} ${themeColors.buttonPrimaryHoverBg} text-white font-bold py-3.5 px-8 rounded-xl w-full transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2`}
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
// --- END VIDEO WARNING MODAL ---


const InitialAndUploadingView = ({
    theme,
    toggleTheme, // Added toggleTheme prop
    activeTab,
    setActiveTab,
    uploadedFile,
    youtubeVideoId,
    videoUrl,
    handleFileChange,
    handleDrop,
    handleDragOver,
    fileInputRef,
    handleVideoUrlChange,
    handleGenerateTranscript,
    setUploadedFile,
    progress,
    detailedProgressStatus,
    isTranscribing,
    isRedirecting,
    currentThemeColors
}) => {

    const guidingCards = [
        {
            icon: FileText,
            title: "Effortless Transcription",
            description: "Quickly convert audio and video files into accurate, readable text. Supports various formats for your convenience."
        },
        {
            icon: Brain,
            title: "AI-Powered Insights",
            description: "Leverage advanced AI to extract key themes, summaries, and action items from your transcripts effortlessly."
        },
        {
            icon: Share2,
            title: "Seamless Sharing & Collaboration",
            description: "Easily share your transcripts and insights with teammates or publish them to other platforms directly from the app."
        }
    ];

    const heroRef = useRef(null);
    const otherSectionsRef = useRef(null);
    const [showOtherSections, setShowOtherSections] = useState(false);
    const [uploadCardIsUplifted, setUploadCardIsUplifted] = useState(false);
    const [showVideoWarning, setShowVideoWarning] = useState(false);

    const isProduction = import.meta.env.PROD;

    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                const heroSectionBottom = heroRef.current.getBoundingClientRect().bottom;
                if (heroSectionBottom <= 0 && !showOtherSections) {
                    setShowOtherSections(true);
                } else if (heroSectionBottom > 0 && showOtherSections) {
                    setShowOtherSections(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [showOtherSections]);

    const handleGetStartedClick = () => {
        setUploadCardIsUplifted(true);
        setTimeout(() => {
            setUploadCardIsUplifted(false);
        }, 2000);
    };

    const handleGenerateClick = () => {
        if (isProduction && activeTab === 'video') {
            setShowVideoWarning(true);
            return;
        }
        handleGenerateTranscript();
    };

    const isGenerateButtonEnabledWithProdCheck = () => {
        const hasInput = (activeTab === 'file' && uploadedFile !== null) ||
            (activeTab === 'video' && youtubeVideoId && youtubeVideoId.trim() !== '');
        return hasInput && !isTranscribing;
    };

    const getSimplifiedStage = (status) => {
        if (!status) return "Processing";
        if (status.includes("Downloading audio")) return "Downloading";
        if (status.includes("Chunking audio")) return "Chunking";
        if (status.includes("Transcribing chunk") || status.includes("AI transcription")) return "Transcribing";
        if (status.includes("Extracting text from PDF")) return "Parsing PDF";
        if (status.includes("Extracting text from DOCX")) return "Parsing DOCX";
        if (status.includes("Reading text from TXT")) return "Reading Text";
        if (status.includes("Generating summary")) return "Summarizing";
        if (status.includes("Analyzing your request")) return "Analyzing";
        if (status.includes("File decoded")) return "Processing File";
        if (status.includes("Starting audio download")) return "Downloading";
        if (status.includes("Attempting to fetch YouTube transcript")) return "Fetching Transcript";
        if (status.includes("AI model loaded")) return "Initializing AI";
        if (status.includes("Initiating transcription")) return "Starting";
        if (status.includes("Redirecting To Transcript")) return "Redirecting";
        if (status.includes("Processing complete!")) return "Complete";
        return "Processing";
    };

    const displayStageText = getSimplifiedStage(detailedProgressStatus);


    return (
        <div className={`flex flex-col min-h-screen font-inter ${currentThemeColors.appBackground}`}>
            <AppHeader themeColors={currentThemeColors} theme={theme} toggleTheme={toggleTheme} />

            <div
                ref={heroRef}
                className={`flex flex-col md:flex-row items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-4 lg:px-2 pt-16 pb-8 md:pt-10 md:pb-16 flex-grow min-h-[calc(100vh-80px)] ${currentThemeColors.appBackground}`}
            >
                <div className={`flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left md:pr-16 mb-12 md:mb-0 max-w-xl lg:max-w-2xl font-[system-ui]`}>
                    <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 ${theme === 'dark' ? currentThemeColors.welcomeHeadline : currentThemeColors.textGradient}`}>
                        Unlock the Power of Your Content
                    </h1>
                    <p className={`text-lg sm:text-xl ${currentThemeColors.welcomeDescription} mb-8 max-w-lg`}>
                        Transform audio, video, and text into actionable insights and engaging narratives with our AI-driven platform.
                        Your ideas, amplified.
                    </p>
                    <button
                        onClick={handleGetStartedClick}
                        className={`
                            ${currentThemeColors.buttonPrimaryBg} ${currentThemeColors.buttonPrimaryHoverBg}
                            text-white font-semibold py-3 px-8 rounded-full shadow-lg text-lg
                            transition-all duration-300 ease-in-out flex items-center justify-center
                            group
                        `}>
                        Get Started for Free
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                    <div className="mt-12 text-left">
                        <h3 className={`text-xl font-bold ${currentThemeColors.welcomeHeadline} mb-4`}>Key Features:</h3>
                        <ul className={`space-y-3 ${currentThemeColors.welcomeDescription}`}>
                            <li className="flex items-center">
                                <span className={`text-2xl mr-3 ${currentThemeColors.welcomeIconColor}`}>•</span>
                                AI-powered summarization and keyword extraction.
                            </li>
                            <li className="flex items-center">
                                <span className={`text-2xl mr-3 ${currentThemeColors.welcomeIconColor}`}>•</span>
                                Support for over 50 languages.
                            </li>
                            <li className="flex items-center">
                                <span className={`text-2xl mr-3 ${currentThemeColors.welcomeIconColor}`}>•</span>
                                Export to various formats including PDF and DOCX.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={`
                    ${currentThemeColors.uploadCardBg} ${currentThemeColors.uploadCardBorder}
                    border rounded-3xl p-8 w-full max-w-md md:max-w-lg mt-8 md:mt-0 lg:ml-12
                    flex-shrink-0 relative overflow-hidden flex flex-col
                    transition-all duration-500 ease-in-out
                    ${currentThemeColors.uploadCardShadow}
                    ${uploadCardIsUplifted ? currentThemeColors.uploadCardLiftedGlow : ''}
                    z-10
                    min-h-[400px] sm:min-h-[450px] lg:min-h-[500px]
                `}>
                    <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10 ${currentThemeColors.welcomeIconColor} blur-xl`}></div>
                    <div className={`absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10 ${currentThemeColors.welcomeIconColor} blur-xl`}></div>

                    <div className={`flex items-stretch mb-6 border-b ${currentThemeColors.panelBorder} overflow-hidden relative `}>
                        <button
                            className={`flex-1 relative py-3 px-3 text-xl font-medium transition-colors duration-200
                            ${activeTab === 'file'
                                    ? `border-b-2 ${currentThemeColors.tabActiveBorder} ${currentThemeColors.tabActiveText}`
                                    : `${currentThemeColors.tabInactiveText} ${currentThemeColors.tabHoverText}`}
                            `}
                            onClick={() => setActiveTab('file')}
                        >
                            File Upload
                        </button>

                        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-px ${currentThemeColors.splitterColor}`}></div>

                        <button
                            className={`flex-1 relative py-3 px-3 text-xl font-medium transition-colors duration-200
                            ${activeTab === 'video'
                                    ? `border-b-2 ${currentThemeColors.tabActiveBorder} ${currentThemeColors.tabActiveText}`
                                    : `${currentThemeColors.tabInactiveText} ${currentThemeColors.tabHoverText}`}
                            `}
                            onClick={() => setActiveTab('video')}
                        >
                            Video URL
                        </button>
                    </div>

                    <div className="flex-grow flex flex-col">
                        {activeTab === 'file' ? (
                            <div
                                className={`flex-grow border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 w-full
                                ${currentThemeColors.dashedBorderDefaultColor} ${currentThemeColors.dashedBorderHoverColor} ${currentThemeColors.hoverBg}
                                flex flex-col items-center justify-center`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="audio/*,video/*,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                />
                                <Upload className={`mx-300 h-12 w-12 ${currentThemeColors.uploadIconColor} mb-4 mt-6`} />
                                <p className={`${currentThemeColors.uploadPlaceholderColor} font-medium`}>Drag & drop your file here</p>
                                <p className={`text-sm ${currentThemeColors.uploadPlaceholderColor} mt-1`}>or <span className={`underline ${currentThemeColors.uploadIconColor}`}>click to browse</span></p>
                                <p className={`text-xs ${currentThemeColors.textSecondary} mt-2`}>MP3, WAV, MP4, MOV, PDF, DOCX, etc. (Max 500MB)</p>

                                {uploadedFile && (
                                    <div
                                        className={`mt-auto p-3 rounded-xl flex items-center justify-between shadow-sm ${currentThemeColors.uploadSelectedFileBorder} border ${currentThemeColors.uploadSelectedFileBg} ${currentThemeColors.uploadSelectedFileText} w-full`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span className="truncate flex-1 flex items-center">
                                            <FileText className={`inline-block mr-2 h-5 w-5 ${currentThemeColors.uploadIconColor}`} />
                                            {uploadedFile.name}
                                        </span>
                                        <button
                                            onClick={() => { setUploadedFile(null); }}
                                            className={`ml-4 font-semibold ${currentThemeColors.uploadSelectedFileHover} transition-colors duration-200`}
                                        >
                                            X
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center">

                                <>
                                    <input
                                        type="text"
                                        placeholder="Paste YouTube video URL here"
                                        className={`
                                                    w-full p-4 border rounded-xl ${currentThemeColors.inputFocusBorder} transition-all duration-300 ease-in-out
                                                    ${currentThemeColors.inputBg} ${currentThemeColors.inputBorder} ${currentThemeColors.textPrimary} ${currentThemeColors.inputPlaceholder}
                                                    ${youtubeVideoId ? 'mb-4' : 'mb-0'}
                                                `}
                                        value={videoUrl}
                                        onChange={handleVideoUrlChange}
                                    />

                                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md mt-4 ">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                        ></iframe>
                                    </div>
                                </>


                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleGenerateClick}
                        disabled={!isGenerateButtonEnabledWithProdCheck()}
                        className={`
                            mt-8 w-full px-4 rounded-lg font-bold
                            transition-all duration-300 ease-in-out
                            ${(!isGenerateButtonEnabledWithProdCheck())
                                ? `${currentThemeColors.buttonDisabledBg} ${currentThemeColors.buttonDisabledText}`
                                : (isProduction && activeTab === 'video')
                                    ? 'bg-slate-500 cursor-pointer text-white shadow-md hover:bg-slate-600 transition-colors'
                                    : `${currentThemeColors.buttonPrimaryBg} ${currentThemeColors.buttonPrimaryHoverBg} shadow-xl text-white`
                            }
                            flex items-center justify-center gap-2
                            ${isTranscribing ? 'text-base font-sans py-3' : 'text-xl py-3'}
                        `}
                    >
                        {isTranscribing ? (
                            <>
                                <Loader className="h-6 w-6 animate-spin" />
                                <span>
                                    {isRedirecting ? "Redirecting To Transcript..." : `${displayStageText}... (${progress}%)`}
                                </span>
                            </>
                        ) : (
                            isProduction && activeTab === 'video' ? 'Try Youtube Feature' : 'Generate Transcript'
                        )}
                    </button>
                    <VideoWarningModal
                        isOpen={showVideoWarning}
                        onClose={() => setShowVideoWarning(false)}
                        themeColors={currentThemeColors}
                    />
                    {isTranscribing && (
                        <div className="mt-4 w-full">
                            <p className={`text-base ${currentThemeColors.textSecondary} mt-2 text-center`}>
                                {detailedProgressStatus}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div
                ref={otherSectionsRef}
                className={`w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12 ${currentThemeColors.appBackground}
                ${showOtherSections ? 'block' : 'hidden'}`}
            >
                <h2 className={`text-3xl sm:text-4xl font-bold text-center ${currentThemeColors.welcomeHeadline} mb-8`}>
                    How It Works: Transform Your Content
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    {guidingCards.map((card, index) => (
                        <div key={index}
                            className={`
                                 ${currentThemeColors.guidingCardBg}
                                 ${currentThemeColors.guidingCardBorder}
                                 border rounded-xl p-6 flex flex-col items-start text-left
                                 transition-all duration-300 ease-in-out
                                 ${currentThemeColors.guidingCardHoverBg}
                             `}
                            style={{ boxShadow: currentThemeColors.guidingCardShadow }}
                        >
                            <card.icon className={`h-10 w-10 ${currentThemeColors.welcomeIconColor} mb-4`} />
                            <h3 className={`text-xl font-semibold ${currentThemeColors.textPrimary} mb-2`}>
                                {card.title}
                            </h3>
                            <p className={`text-base ${currentThemeColors.textSecondary}`}>
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InitialAndUploadingView;