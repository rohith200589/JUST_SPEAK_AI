// src/components/LinkedInPost.jsx
import React from 'react';
import { Linkedin, MoreHorizontal, Globe, ThumbsUp, MessageSquare, Repeat, Send } from 'lucide-react';
import ContentActions from './ContentActions';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

const LinkedInPost = ({ content, image, onCopy, onSave, onPost, copiedSection, onEdit, isEditing, onContentChange, onSaveEdit, colors, theme }) => {
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
                type="linkedin"
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
            {/* Post Header */}
            <div className="flex items-center mb-3">
                <img
                    src="https://placehold.co/40x40/6366F1/FFFFFF?text=JS"
                    alt="JustSpeak AI"
                    className={`w-10 h-10 rounded-full mr-3 border border-indigo-300 dark:border-indigo-600`}
                />
                <div className="flex-grow">
                    <div className="flex items-center">
                        <span className={`font-bold ${colors.textPrimary} mr-1`}>JustSpeak AI</span>
                        <span className={`${colors.textSecondary} text-xs flex items-center`}>
                            <span className="mr-1">•</span> AI Content Creator
                        </span>
                    </div>
                    <div className={`${colors.textSecondary} text-xs flex items-center`}>
                        1h • <Globe size={12} className="ml-1" />
                    </div>
                </div>
            </div>

            {/* Post Content - Conditional Rendering */}
            {isEditing ? (
                <textarea
                    className={`w-full h-40 p-3 border rounded-md resize-y ${colors.inputBg} ${colors.textPrimary} focus:outline-none focus:ring-2 ${colors.inputFocusRing}`}
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    rows={6}
                ></textarea>
            ) : (
                <div className={`prose max-w-none prose-hr:${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} mt-10 ${theme === 'dark' ? 'prose-invert' : ''}`}>
                    <style>{`
                    .prose-light pre { background: transparent !important; }
                    .prose-light pre code { background: #f4f4f5 !important; border-radius: 10px; }
                    .prose-invert pre { background: transparent !important; }
                    .prose-invert pre code { background: white !important; border-radius: 10px; }
                    `}</style>
                    <ReactMarkdown
                        rehypePlugins={[rehypeHighlight]}
                        remarkPlugins={[remarkGfm]}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            )}

            {/* Post Image (optional) */}
            {image && (
                <div className={`mb-3 rounded-lg overflow-hidden border ${colors.border}`}>
                    <img
                        src={image}
                        alt="LinkedIn Post Visual"
                        className="w-full h-auto object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x300/e0e0e0/555555?text=Image+Load+Error"; }}
                    />
                </div>
            )}

            {/* Engagement Buttons */}
            <div className={`flex justify-around items-center border-t ${colors.border} mt-3 pt-3`}>
                <button className={`flex items-center space-x-2 ${colors.textSecondary} hover:${colors.buttonHoverBg} px-3 py-2 rounded-lg transition-colors text-sm font-semibold`}>
                    <ThumbsUp size={16} /><span>Like</span>
                </button>
                <button className={`flex items-center space-x-2 ${colors.textSecondary} hover:${colors.buttonHoverBg} px-3 py-2 rounded-lg transition-colors text-sm font-semibold`}>
                    <MessageSquare size={16} /><span>Comment</span>
                </button>
                <button className={`flex items-center space-x-2 ${colors.textSecondary} hover:${colors.buttonHoverBg} px-3 py-2 rounded-lg transition-colors text-sm font-semibold`}>
                    <Repeat size={16} /><span>Repost</span>
                </button>
                <button className={`flex items-center space-x-2 ${colors.textSecondary} hover:${colors.buttonHoverBg} px-3 py-2 rounded-lg transition-colors text-sm font-semibold`}>
                    <Send size={16} /><span>Send</span>
                </button>
            </div>
        </div>
    );
};

export default LinkedInPost;