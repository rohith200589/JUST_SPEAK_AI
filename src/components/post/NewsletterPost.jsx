// src/components/NewsletterPost.jsx
import React from 'react';
import { Mail, CalendarDays, UserRound, Paperclip } from 'lucide-react';
import ContentActions from './ContentActions';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

const NewsletterPost = ({ content, onCopy, onSave, onPost, copiedSection, onEdit, isEditing, onContentChange, onSaveEdit, colors, theme }) => {
    const lines = content.split('\n');
    const subjectLine = lines[0] && lines[0].startsWith('Subject:') ? lines[0].replace('Subject:', '').trim() : 'No Subject';
    const bodyContent = lines.slice(1).join('\n').trim();

    // FIX: Pass colors and theme to ContentActions
    const contentActionColors = theme === 'dark' ? {
        bgButton: 'bg-gray-700',
        bgButtonHover: 'bg-gray-600',
        textButton: 'text-gray-200',
        activeBg: 'bg-blue-500',
        activeText: 'text-white',
        copySuccessBg: 'bg-green-500',
        copySuccessText: 'text-white',
        voiceListBg: 'bg-gray-700',
        voiceListHover: 'bg-gray-600',
        voiceListActive: 'bg-gray-600',
        messageBg: 'bg-green-800',
        messageText: 'text-green-200',
        border: 'border-gray-600',
    } : {
        bgButton: 'bg-gray-100',
        bgButtonHover: 'bg-gray-200',
        textButton: 'text-gray-700',
        activeBg: 'bg-blue-500',
        activeText: 'text-white',
        copySuccessBg: 'bg-green-500',
        copySuccessText: 'text-white',
        voiceListBg: 'bg-white',
        voiceListHover: 'bg-gray-100',
        voiceListActive: 'bg-gray-100',
        messageBg: 'bg-green-100',
        messageText: 'text-green-800',
        border: 'border-gray-200',
    };

    return (
        <div className={`relative ${colors.bgCard} backdrop-blur-md rounded-xl shadow-xl p-8 mb-8 ${colors.bgCardBorder}`}>
            <ContentActions
                content={content}
                type="newsletter"
                onCopy={onCopy}
                onSave={onSave}
                onPost={onPost}
                copiedSection={copiedSection}
                onEdit={onEdit}
                isEditing={isEditing}
                onSaveEdit={onSaveEdit}
                colors={contentActionColors} // Corrected: Pass the derived colors prop
                theme={theme} // Corrected: Pass the theme prop
            />
            {/* Newsletter Header - mimicking an email client */}
            <div className={`border-b ${colors.border} pb-4 mb-4`}>
                <div className={`flex items-center ${colors.textSecondary} mb-2`}>
                    <span className={`font-semibold mr-2 ${colors.textPrimary}`}>From:</span>
                    <span className="flex items-center">
                        <UserRound size={16} className={`mr-1 ${colors.textPrimary}`} /> JustSpeak AI <span className={`${colors.textSecondary} ml-1`}>&lt;newsletter@justspeakai.com&gt;</span>
                    </span>
                </div>
                <div className={`flex items-center ${colors.textSecondary} mb-2`}>
                    <span className={`font-semibold mr-2 ${colors.textPrimary}`}>To:</span>
                    <span className="flex items-center">
                        <Mail size={16} className={`mr-1 ${colors.textPrimary}`} /> Subscriber <span className={`${colors.textSecondary} ml-1`}>&lt;you@example.com&gt;</span>
                    </span>
                </div>
                <div className={`flex items-center ${colors.textSecondary}`}>
                    <span className={`font-semibold mr-2 ${colors.textPrimary}`}>Date:</span>
                    <span className="flex items-center text-sm">
                        <CalendarDays size={14} className={`mr-1 ${colors.textPrimary}`} /> June 28, 2025 at 12:10 PM
                    </span>
                </div>
                <div className={`flex items-center ${colors.textPrimary} mt-3 text-lg font-bold`}>
                    <span className="font-semibold mr-2">Subject:</span>
                    {isEditing ? (
                        <input
                            type="text"
                            className={`flex-grow p-1 border rounded-md ${colors.inputBg} ${colors.textPrimary} focus:outline-none focus:ring-1 ${colors.inputFocusRing}`}
                            value={subjectLine}
                            onChange={(e) => {
                                const newContent = `Subject: ${e.target.value}\n${bodyContent}`;
                                onContentChange(newContent);
                            }}
                        />
                    ) : (
                        <span className="flex-grow">{subjectLine}</span>
                    )}
                </div>
            </div>

            {/* Newsletter Body - Conditional Rendering */}
            {isEditing ? (
                <textarea
                    className={`w-full h-60 p-3 border rounded-md resize-y ${colors.inputBg} ${colors.textPrimary} focus:outline-none focus:ring-2 ${colors.inputFocusRing}`}
                    value={content}
                    onChange={(e) => {
                        const newContent = `Subject: ${subjectLine}\n${e.target.value}`;
                        onContentChange(newContent);
                    }}
                    rows={10}
                ></textarea>
            ) : (
                <div className={`prose max-w-none prose-hr:${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} mt-10 ${theme === 'dark' ? 'prose-invert' : ''}`}>
                    <style>{`
                    .prose pre {
                        background: transparent !important;
                    }
                    .prose code {
                        background: ${theme === 'dark' ? 'white' : 'gray'} !important;
                        border-radius: 10px;
                    }`}
                    </style>
                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                        {content}
                    </ReactMarkdown>
                </div>
            )}

            {/* Simulated Footer */}
            <div className={`mt-8 pt-6 border-t ${colors.border} text-center ${colors.textSecondary} text-sm`}>
                <p>You received this email because you subscribed to JustSpeak AI updates.</p>
                <p className="mt-2">
                    <a href="#" className={`${colors.link} hover:underline`}>Unsubscribe</a> | <a href="#" className={`${colors.link} hover:underline`}>Manage Preferences</a>
                </p>
                <p className="mt-2">&copy; 2025 JustSpeak AI. All rights reserved.</p>
            </div>
        </div>
    );
};

export default NewsletterPost;