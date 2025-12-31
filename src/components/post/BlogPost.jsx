// src/components/BlogPost.jsx
import React from 'react';
import { BookOpen, CalendarDays, Heart, MessageCircle, Repeat2, Share, UserRound } from 'lucide-react';
import ContentActions from './ContentActions';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

import 'highlight.js/styles/github-dark.css';

const BlogPost = ({ content, blogUrl, onCopy, onSave, onPost, copiedSection, onEdit, isEditing, onContentChange, onSaveEdit, colors, theme }) => {
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
        <div className={`relative ${colors.bgCard} backdrop-blur-md rounded-xl shadow-xl p-8 mb-8 ${colors.border}`}>
            <ContentActions
                content={content}
                type="blog"
                blogUrl={blogUrl}
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
            <div className={`flex items-center ${colors.icon} text-sm mb-6 border-b ${colors.inputBorder} pb-4`}>
                <UserRound size={16} className="mr-2" />
                <span className={`font-semibold mr-4 ${colors.textPrimary}`}>JustSpeak AI</span>
                <CalendarDays size={16} className="mr-2" />
                <span>June 28, 2025</span>
            </div>

            {isEditing ? (
                <textarea
                    className={`w-full h-96 p-4 ${colors.inputBorder} rounded-md resize-y ${colors.inputBg} ${colors.textPrimary} focus:outline-none focus:ring-2 ${colors.inputFocusRing}`}
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    rows={10}
                ></textarea>
            ) : (
                <div className={`prose max-w-none prose-hr:${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} mt-10 ${theme === 'dark' ? 'prose-invert' : ''}`}>
                    <style>{`
                    .prose-light pre { background: transparent !important; }
                    .prose-light pre code { background: #f4f4f5 !important; border-radius: 10px; }
                    .prose-invert pre { background: transparent !important; }
                    .prose-invert pre code { background: #374151 !important; border-radius: 10px; }
                    `}</style>
                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                        {content}
                    </ReactMarkdown>
                </div>
            )}

            {blogUrl && (
                <div className={`mt-8 pt-6 border-t ${colors.inputBorder} text-center`}>
                    <a
                        href={blogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center px-6 py-3 ${colors.buttonPrimaryBg} ${colors.buttonPrimaryText} font-semibold rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 ${colors.inputFocusRing} focus:ring-opacity-50 transition-all duration-300`}
                    >
                        <BookOpen size={20} className="mr-2" /> Read Full Article
                    </a>
                </div>
            )}

            <div className={`flex justify-around items-center border-t ${colors.border} mt-3 pt-3`}>
                <button className={`flex items-center space-x-2 ${colors.buttonSecondaryText} hover:${colors.buttonSecondaryHoverBg} px-3 py-2 rounded-lg transition-colors text-sm font-semibold`}>
                    <Heart size={16} /><span>Like</span>
                </button>
                <button className={`flex items-center space-x-2 ${colors.buttonSecondaryText} hover:${colors.buttonSecondaryHoverBg} px-3 py-2 rounded-lg transition-colors text-sm font-semibold`}>
                    <MessageCircle size={16} /><span>Comment</span>
                </button>
                <button className={`flex items-center space-x-2 ${colors.buttonSecondaryText} hover:${colors.buttonSecondaryHoverBg} px-3 py-2 rounded-lg transition-colors text-sm font-semibold`}>
                    <Repeat2 size={16} /><span>Repost</span>
                </button>
                <button className={`flex items-center space-x-2 ${colors.buttonSecondaryText} hover:${colors.buttonSecondaryHoverBg} px-3 py-2 rounded-lg transition-colors text-sm font-semibold`}>
                    <Share size={16} /><span>Send</span>
                </button>
            </div>
        </div>
    );
};

export default BlogPost;