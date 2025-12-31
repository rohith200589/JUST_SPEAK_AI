// src/components/transcript/LeftPanelContent.jsx

import React, { useState, useEffect } from 'react';
import { FileText, Lightbulb, Search, Upload, ArrowLeft, Video, Volume2, Image, File, Loader, MoreVertical } from 'lucide-react';

const LeftPanelContent = React.memo(({
    theme,
    leftPanelView,
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
    
    setUploadedFile,
    activeVideoPlayerRef,
    searchTerm,
    setSearchTerm,
    searchResults,
    handleSeek,
    keyInsights,
    isKeyInsightsLoading,
    retryAnalysis,
    currentThemeColors
}) => {
    // Keyword click/hover state removed since Quick Insights column is removed
    const [documentUrl, setDocumentUrl] = useState(null);

    useEffect(() => {
        if (documentUrl) {
            URL.revokeObjectURL(documentUrl);
        }

        const fileCategory = uploadedFile ? getFileTypeCategory(uploadedFile) : 'none';
        const isBlob = uploadedFile instanceof Blob;

        if (fileCategory === 'document' && uploadedFile.type === 'application/pdf' && isBlob) {
            const newUrl = URL.createObjectURL(uploadedFile);
        currentThemeColors,
        retryAnalysis
        } else {
            setDocumentUrl(null);
        }

        return () => {
            if (documentUrl) {
                URL.revokeObjectURL(documentUrl);
            }
        };
    }, [uploadedFile]);

    const toTitleCase = (str) => {
        if (!str) return '';
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    const getFirstWordAndTitleCase = (str) => {
        if (!str) return '';
        const firstWord = str.split(' ')[0];
        return toTitleCase(firstWord);
    };

    const getFileTypeCategory = (file) => {
        if (!file || !file.name || !file.type) return 'none';

        const mimeType = file.type;
        const fileNameLower = file.name.toLowerCase();

        if (mimeType.startsWith('video/') ||
            fileNameLower.endsWith('.mp4') ||
            fileNameLower.endsWith('.mov') ||
            fileNameLower.endsWith('.avi') ||
            fileNameLower.endsWith('.webm')) {
            return 'video';
        }
        if (mimeType.startsWith('audio/') ||
            fileNameLower.endsWith('.mp3') ||
            fileNameLower.endsWith('.wav') ||
            fileNameLower.endsWith('.ogg')) {
            return 'audio';
        }
        if (mimeType.startsWith('text/') ||
            fileNameLower.endsWith('.txt') ||
            fileNameLower.endsWith('.csv') ||
            fileNameLower.endsWith('.json') ||
            fileNameLower.endsWith('.log')) {
            return 'text';
        }
        if (mimeType.startsWith('image/') ||
            fileNameLower.endsWith('.jpg') ||
            fileNameLower.endsWith('.jpeg') ||
            fileNameLower.endsWith('.png') ||
            fileNameLower.endsWith('.gif')) {
            return 'image';
        }
        if (mimeType === 'application/pdf' ||
            fileNameLower.endsWith('.pdf') ||
            fileNameLower.endsWith('.doc') ||
            fileNameLower.endsWith('.docx')) {
            return 'document';
        }
        return 'other';
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const renderMediaPlayer = () => {
        if (youtubeVideoId) {
            return (
                <div className={`w-full relative overflow-hidden rounded-xl shadow-sm mb-6 border ${currentThemeColors.playerBorder} ${currentThemeColors.playerBg}`} style={{ paddingTop: '56.25%' }}>
                    <iframe
                        ref={activeVideoPlayerRef}
                        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full ">
                    </iframe>
                </div>
            );
        } else if (uploadedFile) {
            const isBlob = uploadedFile instanceof Blob;
            const fileCategory = getFileTypeCategory(uploadedFile);

            switch (fileCategory) {
                case 'video':
                    return (
                        <div className={`w-full relative overflow-hidden rounded-xl shadow-md mb-12 border ${currentThemeColors.playerBorder} ${currentThemeColors.playerBg}`} style={{ paddingTop: '56.25%' }}>
                            <video controls className="absolute top-0 left-0 w-full h-full rounded-xl" ref={activeVideoPlayerRef}>
                                <source
                                    src={isBlob ? URL.createObjectURL(uploadedFile) : uploadedFile}
                                    type={isBlob ? uploadedFile.type : undefined}
                                />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    );
                case 'audio':
                    return (
                        <div className={`w-full rounded-lg shadow-md mb-25 mt-8 p-4 border ${currentThemeColors.cardBg} ${currentThemeColors.cardBorder} flex flex-col items-center justify-center relative overflow-hidden`}>
                            <div className="z-10 text-white flex flex-col items-center">
                                <Volume2 className="h-10 w-10 mb-2" />
                                <p className="font-semibold text-lg mb-4">{uploadedFile.name}</p>
                            </div>
                            <audio controls className={`w-full z-10 custom-audio-player ${theme === 'dark' ? 'custom-audio-player-dark' : 'custom-audio-player-light'}`} ref={activeVideoPlayerRef}>
                                <source
                                    src={isBlob ? URL.createObjectURL(uploadedFile) : uploadedFile}
                                    type={isBlob ? uploadedFile.type : undefined}
                                />
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    );
                case 'image':
                    return (
                        <div className={`p-3 border rounded-xl shadow-sm mb-6 ${currentThemeColors.cardBg} ${currentThemeColors.cardBorder} ${currentThemeColors.textPrimary} flex flex-col items-center`}>
                            <div className="flex items-center gap-3 mb-2">
                                <Image className={`h-5 w-5 ${currentThemeColors.iconColor}`} />
                                <p className="font-semibold">{uploadedFile.name}</p>
                            </div>
                            <img
                                src={isBlob ? URL.createObjectURL(uploadedFile) : uploadedFile}
                                alt="Uploaded preview"
                                className="max-w-full h-auto max-h-48 object-contain rounded-lg border"
                                style={{ borderColor: currentThemeColors.cardBorder }}
                            />
                            <p className={`text-xs text-center mt-2 ${currentThemeColors.textSecondary}`}>Preview of uploaded image</p>
                        </div>
                    );
                case 'document':
                    return (
                        <div className={`p-3 border rounded-xl shadow-sm mb-6 ${currentThemeColors.cardBg} ${currentThemeColors.cardBorder} ${currentThemeColors.textPrimary} flex flex-col items-center`}>
                            <div className="flex items-center gap-3 mb-2">
                                <File className={`h-5 w-5 ${currentThemeColors.iconColor}`} />
                                <p className="font-semibold">{uploadedFile.name}</p>
                            </div>
                            {documentUrl ? (
                                <iframe
                                    key={documentUrl}
                                    src={documentUrl}
                                    title="Document preview"
                                    className="w-[90%] h-64 rounded-lg border"
                                    style={{ borderColor: currentThemeColors.cardBorder }}
                                ></iframe>
                            ) : (
                                <div className={`w-full h-64 flex items-center justify-center text-center ${currentThemeColors.inputBg} rounded-lg border ${currentThemeColors.inputBorder}`}>
                                    <p className={`${currentThemeColors.textSecondary} text-sm`}>
                                        No direct preview available for this document type.<br />
                                        Please download to view.
                                    </p>
                                </div>
                            )}
                            <p className={`text-xs text-center mt-2 ${currentThemeColors.textSecondary}`}>Preview of uploaded document</p>
                        </div>
                    );
                case 'other':
                default:
                    return (
                        <div className={`p-3 border rounded-xl flex items-center justify-between shadow-sm mb-6 ${currentThemeColors.cardBg} ${currentThemeColors.cardBorder} ${currentThemeColors.textPrimary}`}>
                            <span className="truncate flex-1">
                                <FileText className={`inline-block mr-2 h-5 w-5 ${currentThemeColors.iconColor}`} />
                                {uploadedFile.name}
                            </span>
                            <p className={`text-xs ${currentThemeColors.textSecondary} ml-4`}>File type: {uploadedFile.type || 'Unknown'}</p>
                        </div>
                    );
            }
        }
        return null;
    };

    return (
        <div className={`h-full flex flex-col ${currentThemeColors.cardbg}`}>
            <div style={{ display: leftPanelView === 'insights' ? 'block' : 'none' }} className="p-6 lg:p-8 flex flex-col flex-grow">
                {renderMediaPlayer()}
                <div className="flex flex-col gap-6 flex-grow">
                    <div className="w-full flex flex-col">
                        <h3 className={`text-lg font-bold mb-4 flex items-center ${currentThemeColors.headingColor}`}><Search className={`h-5 w-5 mr-2 ${currentThemeColors.yellowText}`} />Search Transcript</h3>
                        <input
                            type="text"
                            placeholder="Search for words..."
                            className={`w-full p-3 border rounded-xl ${currentThemeColors.inputFocusRing} ${currentThemeColors.inputFocusBorder} transition-all duration-300 ease-in-out ${currentThemeColors.inputBg} ${currentThemeColors.inputBorder} ${currentThemeColors.textPrimary}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && searchResults && searchResults.length > 0 && (
                            <div className={`mt-4 p-3 rounded-xl border ${currentThemeColors.cardBg} ${currentThemeColors.cardBorder} overflow-y-auto custom-scrollbar`} style={{ maxHeight: '300px' }}>
                                <p className={`text-sm font-semibold mb-2 ${currentThemeColors.textPrimary}`}>Found {searchResults.length} occurrences:</p>
                                {searchResults.map((result, idx) => (
                                    <div key={idx}
                                        onClick={() => handleSeek(result.segmentTime)}
                                        className={`p-2 mb-2 rounded-lg cursor-pointer ${currentThemeColors.hoverBg} text-sm border-b ${currentThemeColors.cardBorder} last:border-b-0`}
                                    >
                                        <span className={`${currentThemeColors.textPrimary} font-medium`}>
                                            {formatTime(result.segmentTime)}:{" "}
                                        </span>
                                        <span className={`${currentThemeColors.textSecondary}`}>
                                            {result.preview.substring(0, result.matchStartIndex)}
                                            <span className="bg-yellow-300 text-black rounded px-0.5">
                                                {result.preview.substring(result.matchStartIndex, result.matchEndIndex)}
                                            </span>
                                            {result.preview.substring(result.matchEndIndex)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchTerm && searchResults && searchResults.length === 0 && (
                            <p className={`text-sm ${currentThemeColors.textSecondary} mt-2`}>No results found for "{searchTerm}".</p>
                        )}
                        {(!searchTerm && (!searchResults || searchResults.length === 0)) && (
                            <p className={`text-xs text-center mt-2 ${currentThemeColors.textSecondary}`}>Start Searching Your Intended Keywords</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default LeftPanelContent;