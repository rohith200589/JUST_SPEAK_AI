// src/components/transcript/GeneratedView.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Maximize, Code, Volume2, Copy, Edit, MoreVertical, Menu, X, FileText, Bot, Paperclip, Mic, Send, BarChart, FileSignature, Sun, Moon, PlusSquare, Upload } from 'lucide-react';
import GeneratedContentBlock from './GeneratedContentBlock';
import LeftPanelContent from './LeftPanelContent';
import RightPanelTabs from './RightPanelTabs';
import { useNavigate } from 'react-router-dom';
import { getGlobalTheme, setGlobalTheme } from '../../utils/globalTheme'; // Import global theme utility

const GeneratedView = (
    {
        theme,
        toggleTheme, // Added toggleTheme prop
        leftPanelWidth,
        handleMouseDown,
        setLeftPanelView,
        youtubeVideoId,
        uploadedFile,
        videoUrl,
        handleVideoUrlChange,
        handleFileChange,
        handleDrop,
        handleDragOver,
        fileInputRef,
        handleGenerateTranscript,
        activeTab,
        setActiveTab,
        handleFullscreen,
        rightPanelTabs,
        rightPanelTab,
        setRightPanelTab,
        showDownloadMenu,
        setShowDownloadMenu,
        downloadMenuRef,
        setGenerateSidebarOpen,
        isGenerateSidebarOpen,
        setIsTranscriptOpen,
        isTranscriptOpen,
        transcript,
        transcriptTimestamps,
        copilotChatContainerRef,
        copilotMessages,
        handleCopilotRequest,
        chatInput,
        setChatInput,
        transcriptViewTab,
        setTranscriptViewTab,
        structuredSummary,
        
        currentThemeColors,
        resizableAreaRef,
        leftPanelView,
        setUploadedFile,
        activeVideoPlayerRef,
        handleSeek,
        searchTerm,
        setSearchTerm,
        searchResults,
        resetApp,
        handleNewChat,
        
        keyInsights,
        isTranscribing,
        isThinking,
        
        retryAnalysis
    }) => {
    const transcriptContainerRef = useRef(null);
    const navigate = useNavigate();

    const showLeftPanel = true;

    const renderStructuredSummary = () => {
        if (!structuredSummary || !structuredSummary.title) {
            return <p className={`text-center py-4 ${currentThemeColors.textSecondary}`}>No summary available.</p>;
        }

        return (
            <div className={`leading-relaxed text-base text-justify ${currentThemeColors.textSecondary}`}>
                <h4 className={`text-xl font-bold mb-3 ${currentThemeColors.textPrimary}`}>
                    {structuredSummary.title}
                </h4>
                {structuredSummary.subheader && <p className="mb-3">{structuredSummary.subheader}</p>}
                {structuredSummary.points && structuredSummary.points.length > 0 && (
                    <ul className="list-disc pl-5">
                        {structuredSummary.points.map((point, index) => (
                            <li key={index} className="mb-1">{point}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

  const renderClickableTranscript = () => {
    if (!transcript || !transcriptTimestamps || transcriptTimestamps.length === 0) {
        return <p className={`text-center py-4 ${currentThemeColors.textPrimary}`}>No detailed transcript available.</p>;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    let currentTextIndex = 0;

    // Determine the hover text color based on the current theme
    const hoverTextColor = theme === 'dark' ? 'hover:text-[#0ea5e9]' : 'hover:text-blue-600 ';

    return (
        <p className={`whitespace-pre-wrap leading-relaxed text-base text-justify ${currentThemeColors.textPrimary}`} ref={transcriptContainerRef}>
            {transcriptTimestamps.map((segment, index) => {
                const segmentText = segment.text || '';
                const startTime = segment.time;

                const startIndexInFullTranscript = transcript.indexOf(segmentText, currentTextIndex);

                if (segmentText.trim() === '' || startIndexInFullTranscript === -1) {
                    return (
                        <span
                            key={`seg-${index}`}
                            onClick={() => { handleSeek(startTime); setSearchTerm(segmentText); }}
                            className={`cursor-pointer ${currentThemeColors.textSecondary} ${hoverTextColor}`}
                        >
                            {segmentText + " "}
                        </span>
                    );
                }

                const textBeforeSegment = transcript.substring(currentTextIndex, startIndexInFullTranscript);
                currentTextIndex = startIndexInFullTranscript + segmentText.length;

                const parts = [];
                let lastIndex = 0;
                if (lowerCaseSearchTerm) {
                    let match;
                    const regex = new RegExp(lowerCaseSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                    while ((match = regex.exec(segmentText)) !== null) {
                        if (match.index > lastIndex) {
                            parts.push(segmentText.substring(lastIndex, match.index));
                        }
                        parts.push(
                            <span key={`match-${index}-${match.index}`} className="bg-yellow-300 text-black rounded px-0.5">
                                {match[0]}
                            </span>
                        );
                        lastIndex = regex.lastIndex;
                    }
                }
                if (lastIndex < segmentText.length) {
                    parts.push(segmentText.substring(lastIndex));
                }

                return (
                    <span
                        key={`seg-${index}`}
                        onClick={() => { handleSeek(startTime); setSearchTerm(segmentText); }}
                        className={`cursor-pointer ${currentThemeColors.textSecondary2} ${hoverTextColor}`}
                    >
                        {textBeforeSegment}
                        {parts.length > 0 ? parts : segmentText}
                        {" "}
                    </span>
                );
            })}
        </p>
    );
};


    useEffect(() => {
        if (searchTerm && transcriptContainerRef.current) {
            const matches = transcriptContainerRef.current.querySelectorAll('.bg-yellow-300');
            if (matches.length > 0) {
                matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [searchTerm, transcript, transcriptTimestamps]);


    return (
        <div className={`h-screen font-inter p-4 ${currentThemeColors.app2Background}`}>
            <div className="flex flex-row h-full w-full" ref={resizableAreaRef}>
                <div style={{ width: `calc(${leftPanelWidth}% - 0.5rem)` }}>
                    <div className={`flex flex-col h-full rounded-xl ${currentThemeColors.panelBackground} border ${currentThemeColors.panelBorder}`}>
                        <div className={`flex items-center justify-between py-2 px-4 flex-shrink-0 ${currentThemeColors.headerBackground} border-b ${currentThemeColors.headerBorder} rounded-t-xl`}>
                            <div className="flex items-center gap-2">
                                <h3 className={`text-lg font-bold ${currentThemeColors.headerText}`}>Media & Insights</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={toggleTheme} className={`p-2 rounded-full ${currentThemeColors.iconColor} ${currentThemeColors.hoverBg}`}>
                                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                </button>
                                <button
                                    onClick={resetApp}
                                    className={`p-2 rounded-full ${currentThemeColors.iconColor} ${currentThemeColors.hoverBg}`}
                                    title="Start New Transcription"
                                >
                                    <Upload className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className={`overflow-y-auto no-scrollbar rounded-xl flex-grow shadow-2xl ${currentThemeColors.appBackground}`}>
                            <LeftPanelContent
                                theme={theme}
                                leftPanelView={leftPanelView}
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
                                
                                setUploadedFile={setUploadedFile}
                                activeVideoPlayerRef={activeVideoPlayerRef}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                searchResults={searchResults}
                                handleSeek={handleSeek}
                                    keyInsights={keyInsights}
                                    retryAnalysis={retryAnalysis}
                                isKeyInsightsLoading={isTranscribing}
                                currentThemeColors={currentThemeColors}
                            />
                        </div>
                    </div>
                </div>

                <div className="w-4 flex-shrink-0 cursor-col-resize bg-transparent rounded-xl" onMouseDown={handleMouseDown}></div>

                <div className="flex-1 min-w-0 shadow-md" style={{ width: `calc(${100 - leftPanelWidth}% - 0.5rem)` }}>
                    <div className={`border flex flex-col h-full rounded-xl relative ${currentThemeColors.panelBackground} ${currentThemeColors.panelBorder}`}>
                        <div className={`flex items-center justify-between py-2 px-4 flex-shrink-0 z-10 ${currentThemeColors.headerBackground} border-b ${currentThemeColors.headerBorder} rounded-t-xl`}>
                            <h3 className={`text-lg font-bold flex items-center gap-2 ${currentThemeColors.headerText}`}><Code className="h-5 w-5" /> Script</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={handleFullscreen} className={`p-2 rounded-full ${currentThemeColors.iconColor} ${currentThemeColors.hoverBg}`}>
                                    <Maximize className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className={`flex items-center justify-between border-b px-4  sm:px-6 ${currentThemeColors.headerBackground} ${currentThemeColors.headerBorder}`}>
                            <RightPanelTabs
                                currentThemeColors={currentThemeColors}
                                rightPanelTabs={rightPanelTabs}
                                rightPanelTab={rightPanelTab}
                                setRightPanelTab={setRightPanelTab}
                                theme={theme}
                            />
                            <div ref={downloadMenuRef} className="flex items-center gap-1 relative rounded-xl">
                                {rightPanelTab !== 'Generate' ? (
                                    <>
                                        <button className={`p-2 rounded-full ${currentThemeColors.iconColor} ${currentThemeColors.hoverBg}`}><Volume2 className="h-4 w-4" /></button>
                                        <button className={`p-2 rounded-full ${currentThemeColors.iconColor} ${currentThemeColors.hoverBg}`}><Copy className="h-4 w-4" /></button>
                                        <button className={`p-2 rounded-full ${currentThemeColors.iconColor} ${currentThemeColors.hoverBg}`}><Edit className="h-4 w-4" /></button>
                                        <button onClick={() => setShowDownloadMenu(!showDownloadMenu)} className={`p-2 rounded-full ${currentThemeColors.iconColor} ${currentThemeColors.hoverBg}`}><MoreVertical className="h-4 w-4" /></button>
                                        {showDownloadMenu && (
                                            <div className={`absolute top-full right-0 mt-2 w-48 rounded-md shadow-lg z-20 ${currentThemeColors.panelBackground} border ${currentThemeColors.panelBorder}`}>
                                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                    <a href="#" className={`block px-4 py-2 text-sm ${currentThemeColors.textPrimary} ${currentThemeColors.hoverBg}`} role="menuitem">Download as TXT</a>
                                                    <a href="#" className={`block px-4 py-2 text-sm ${currentThemeColors.textPrimary} ${currentThemeColors.hoverBg}`} role="menuitem">Download as PDF</a>
                                                    <a href="#" className={`block px-4 py-2 text-sm ${currentThemeColors.textPrimary} ${currentThemeColors.hoverBg}`} role="menuitem">Download as DOCX</a>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        onClick={handleNewChat}
                                        className={`p-2 rounded-full ${currentThemeColors.iconColor} ${currentThemeColors.hoverBg}`}
                                        title="Reset Chat"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={`flex-1 flex flex-col overflow-hidden custom-scrollbar relative rounded-xl ${currentThemeColors.appBackground}`}>
                            {rightPanelTab === 'Generate' ? (
                                <div className="flex flex-col h-full p-4 gap-4 relative">
                                    <div className="flex justify-center w-full">
                                        {!isTranscriptOpen ? (
                                            <div className={`flex justify-between items-center w-full  max-w-md rounded-xl p-2 ${currentThemeColors.panelBackground} border ${currentThemeColors.panelBorder}`}>
                                                <div className="flex items-center gap-3">
                                                    <FileText className={`h-5 w-5 ${currentThemeColors.iconColor}`} />
                                                    <div>
                                                        <p className={`font-semibold ${currentThemeColors.textPrimary}`}>Transcript Content</p>
                                                        <p className={`text-xs ${currentThemeColors.textSecondary}`}>Ready to use in chat</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setIsTranscriptOpen(true)}
                                                    className={`py-1.5 px-4 rounded-full text-sm font-semibold transition-colors ${currentThemeColors.buttonPrimaryBg} ${currentThemeColors.buttonPrimaryHoverBg} text-white`}
                                                >
                                                    Open
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`border rounded-xl h-60 flex flex-col mt-4 ${currentThemeColors.panelBorder} ${currentThemeColors.panelBackground}`}>
                                                <div className="flex justify-between items-center p-3 flex-shrink-0">
                                                    <h4 className={`font-semibold ${currentThemeColors.textPrimary}`}>Transcript Content</h4>
                                                    <button onClick={() => setIsTranscriptOpen(false)}>
                                                        <X className={`h-5 w-5 transition-transform ${currentThemeColors.iconColor} hover:text-red-400`} />
                                                    </button>
                                                </div>
                                                <div className={`overflow-y-auto custom-scrollbar p-4 border-t pt-2 ${currentThemeColors.panelBorder}`}>
                                                    <pre className={`whitespace-pre-wrap font-sans text-base leading-relaxed text-justify ${currentThemeColors.textPrimary}`}>
                                                        {transcript}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div ref={copilotChatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-6 w-full max-w-2xl mx-auto">
                                        {copilotMessages.map((msg) => (
                                            <div key={msg.id} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} my-4`}>
                                                {msg.isMainContent ? (
                                                    <GeneratedContentBlock title={msg.title} theme={theme} timestamp={msg.timestamp} currentThemeColors={currentThemeColors}>
                                                        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-justify">{msg.text}</pre>
                                                    </GeneratedContentBlock>
                                                ) : (
                                                    <>
                                                        {msg.sender === 'bot' && <Bot className={`h-6 w-6 flex-shrink-0 mt-1 ${currentThemeColors.blueText}`} />}
                                                        <div className={`p-3 rounded-lg max-w-md text-sm ${msg.sender === 'user' ? `${currentThemeColors.chatUserBg} ${currentThemeColors.chatUserText} rounded-br-none` : `${currentThemeColors.chatBotBg} ${currentThemeColors.chatBotText} rounded-bl-none`}`}>
                                                            {msg.text}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                        {isThinking && (
                                            <div className="flex justify-start my-4">
                                                <Bot className={`h-6 w-6 flex-shrink-0 mt-1 ${currentThemeColors.blueText}`} />
                                                <div className={`p-3 rounded-lg max-w-md text-sm ${currentThemeColors.chatBotBg} ${currentThemeColors.chatBotText} rounded-bl-none`}>
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-shrink-0 w-full max-w-3xl mx-auto">
                                        <div className={`rounded-2xl p-2 ${currentThemeColors.chatInputBg} shadow-2xl ring-1 ${currentThemeColors.chatInputBorder}`}>
                                            <textarea
                                                placeholder="Chat with your transcript..."
                                                className={`w-full border-none focus:ring-0 bg-transparent py-2 px-3 placeholder-gray-400 resize-none font-medium ${currentThemeColors.textPrimary} ${currentThemeColors.inputPlaceholder}`}
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCopilotRequest(chatInput); } }}
                                                rows={1}
                                            />
                                            <div className="flex justify-between items-center mt-1">
                                                <div className="flex items-center gap-2">
                                                    <button className={`p-2 rounded-full transition-colors ${currentThemeColors.iconColor} ${currentThemeColors.hoverBg}`}><Paperclip className="h-4 w-4" /></button>
                                                    <button className={`p-2 rounded-full transition-colors ${currentThemeColors.iconColor} ${currentThemeColors.hoverBg}`}><Mic className="h-4 w-4" /></button>
                                                </div>
                                                <button onClick={() => handleCopilotRequest(chatInput)} className={`p-2 rounded-lg transition-all duration-200 ease-in-out flex-shrink-0 ${chatInput.trim() ? `${currentThemeColors.buttonPrimaryBg} ${currentThemeColors.buttonPrimaryHoverBg} text-white shadow` : `${currentThemeColors.buttonDisabledBg} ${currentThemeColors.buttonDisabledText}`} `} disabled={!chatInput.trim()}><Send className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : rightPanelTab === 'Transcript' ? (
                                <div className={`flex flex-col h-full ${currentThemeColors.textPrimary} `}>
                                    <div className={`flex-1 overflow-hidden px-4 sm:px-6 md:px-8 pt-6 pb-2 flex flex-col ${currentThemeColors.textPrimary}`}>
                                        <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
                                            <div className="flex justify-center mb-6 px-4">
                                            <div
    className={`relative flex items-center w-80 h-12 rounded-2xl p-1 shadow-sm border overflow-hidden ${currentThemeColors.panelBackground} ${currentThemeColors.panelBorder}`}
>
    <div
        className={`absolute top-1 bottom-1 w-[calc(50%-10px)] rounded-xl transition-all duration-300 ease-in-out
        ${currentThemeColors.tabActiveBackground}`}
        style={{
            left: transcriptViewTab === 'transcript' ? '6px' : 'calc(50% + 6px)',
        }}
    />

    <button
        onClick={() => setTranscriptViewTab('transcript')}
        className="relative z-10 w-1/2 h-full flex items-center justify-center text-sm font-medium"
    >
        <span
            className={`${transcriptViewTab === 'transcript' ? 'text-white' : currentThemeColors.textSecondary}`}
        >
            Transcript
        </span>
    </button>

    <button
        onClick={() => setTranscriptViewTab('summary')}
        className="relative z-10 w-1/2 h-full flex items-center justify-center text-sm font-medium"
    >
        <span
            className={`${transcriptViewTab === 'summary' ? 'text-white' : currentThemeColors.textSecondary}`}
        >
            Summary
        </span>
    </button>
</div>
                                             </div>

                                            <div className={`border-1 rounded-xl shadow-xl flex-1 overflow-y-auto custom-scrollbar ${currentThemeColors.cardBg}  ${currentThemeColors.cardBorder} ${currentThemeColors.textPrimary}`}>
                                                <div className="p-4">
                                                    <div className={`${currentThemeColors.textPrimary}`}>
                                                        {transcriptViewTab === 'transcript'
                                                            ? renderClickableTranscript()
                                                            : renderStructuredSummary()
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`flex-shrink-0 flex justify-center items-center gap-6 px-4 py-8`}>
                                        <button
                                            onClick={() => {
                                                navigate("/seo/chat/main", { state: { initiateAutoSend: true, transcriptContent: transcript } });
                                            }}
                                            className={`flex items-center gap-2 transition-all duration-200 py-2.5 px-5 rounded-lg text-base font-semibold text-white bg-gradient-to-r ${currentThemeColors.analyseSeoGradientFrom} ${currentThemeColors.analyseSeoGradientTo} ${currentThemeColors.buttonPrimaryHoverBg} shadow-lg`}
                                        >
                                            <BarChart className="-ms-1 opacity-60" size={16} aria-hidden="true" />
                                            Analyse SEO
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/generate-post/generate', { state: { transcriptContent: transcript } });
                                            }}
                                            className={`flex items-center gap-2 transition-all duration-200 py-2.5 px-5 rounded-lg text-base font-semibold text-white bg-gradient-to-r ${currentThemeColors.generatePostGradientFrom} ${currentThemeColors.generatePostGradientTo} ${currentThemeColors.buttonPrimaryHoverBg} shadow-lg`}
                                        >
                                            <FileSignature className="-ms-1 opacity-60" size={16} aria-hidden="true" />
                                            Generate Post
                                        </button>
                                    </div>
                                </div>
                                ) : (
                                    // Default to Transcript view if an unknown tab is selected
                                    <div className="flex flex-col h-full p-6">
                                        <p className={`text-sm ${currentThemeColors.textSecondary}`}>Select a tab to view content.</p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneratedView;