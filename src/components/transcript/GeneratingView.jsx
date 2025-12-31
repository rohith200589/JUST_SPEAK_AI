import React, { useEffect } from 'react';
import { Loader } from 'lucide-react';

const GeneratingView = ({ theme, progress, detailedProgressStatus, isTranscribing, transcript, summaryContent, navigate, setIsTranscribing, setDetailedProgressStatus, isRedirecting }) => {

    const darkThemeColors = {
        appBackground: 'bg-[#151a2e]',
        panelBackground: 'bg-[#1f2641]',
        panelBorder: 'border-[#3f4a6c]',
        headerBackground: 'bg-gray-800',
        headerText: 'text-gray-100',
        iconColor: 'text-gray-300',
        hoverBg: 'hover:bg-[#293256]',
        textPrimary: 'text-gray-100',
        textSecondary: 'text-gray-300',
        progressBg: 'bg-[#293256]',
        progressBar: 'bg-[#00c6ff]',
        loaderColor: 'text-[#00c6ff]',
    };

    const lightThemeColors = {
        appBackground: 'bg-gray-100',
        panelBackground: 'bg-white',
        panelBorder: 'border-gray-200',
        headerBackground: 'bg-white',
        headerText: 'text-gray-800',
        iconColor: 'text-gray-500',
        hoverBg: 'hover:bg-gray-100',
        textPrimary: 'text-gray-800',
        textSecondary: 'text-gray-600',
        progressBg: 'bg-gray-200',
        progressBar: 'bg-indigo-500',
        loaderColor: 'text-indigo-500',
    };

    const currentTheme = theme === 'dark' ? darkThemeColors : lightThemeColors;

    useEffect(() => {
        if ((transcript || (summaryContent && summaryContent.title)) && isTranscribing) {
            console.log("Data is ready for GeneratedView. Navigating...");
            setDetailedProgressStatus('Data ready. Redirecting...');
            setTimeout(() => {
                navigate('/transcript/view');
                setIsTranscribing(false);
            }, 500);
        } else if (!isTranscribing && !transcript && !summaryContent && progress === 0 && detailedProgressStatus.includes("Error")) {
            console.log("Error detected in GeneratingView. Redirecting back to upload.");
            setTimeout(() => {
                navigate('/transcript/upload');
            }, 1000);
        }
    }, [transcript, summaryContent, isTranscribing, navigate, setIsTranscribing, setDetailedProgressStatus, progress, detailedProgressStatus]);

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen p-4 font-inter ${currentTheme.appBackground}`}>
            <div className={`rounded-2xl shadow-xl p-8 w-full max-w-sm text-center ${currentTheme.panelBackground} border ${currentTheme.panelBorder}`}>
                <Loader className={`mx-auto h-16 w-16 ${currentTheme.loaderColor} animate-spin mb-6`} />
                <h2 className={`text-2xl font-bold ${currentTheme.textPrimary} mb-3`}>
                    {isTranscribing ? "Generating Transcript..." : "Processing Complete!"}
                </h2>
                <p className={`${currentTheme.textSecondary} mb-6`}>{detailedProgressStatus || "This may take a moment."}</p>
                <div className={`w-full h-3 rounded-full ${currentTheme.progressBg}`}>
                    <div
                        className={`${currentTheme.progressBar} h-3 rounded-full transition-all duration-200 ease-out`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className={`text-sm ${currentTheme.textSecondary} mt-2`}>{progress}% Complete</p>
            </div>
        </div>
    );
};

export default GeneratingView;