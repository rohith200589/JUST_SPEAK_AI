// src/components/TwitterPost.jsx
import React from 'react';
import { Twitter, MoreHorizontal, MessageCircle, Repeat2, Heart, Share } from 'lucide-react';
import ContentActions from './ContentActions';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

const TwitterPost = ({ content, image, onCopy, onSave, onPost, copiedSection, onEdit, isEditing, onContentChange, onSaveEdit, colors, theme }) => {
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
                type="twitter"
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
            <div className="flex items-start mb-3">
                <img
                    src="https://placehold.co/40x40/333333/FFFFFF?text=JS"
                    alt="JustSpeak AI"
                    className={`w-10 h-10 rounded-full mr-3 border ${colors.border}`}
                />
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className={`font-bold ${colors.textPrimary} mr-1`}>JustSpeak AI</span>
                            <span className={`${colors.textSecondary} text-sm`}>@JustSpeakAI • 1h</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Post Content - Conditional Rendering */}
            {isEditing ? (
                <textarea
                    className={`w-full h-32 p-3 border rounded-md resize-y ${colors.inputBg} ${colors.textPrimary} focus:outline-none focus:ring-2 ${colors.inputFocusRing}`}
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    rows={4}
                    maxLength={280}
                ></textarea>
            ) : (
                <div className={`prose max-w-none prose-hr:${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} mt-10 ${theme === 'dark' ? 'prose-invert' : ''}`}>
                    <style>{`
                    .prose pre {
                        background: transparent !important;
                    }
                    .prose code {
                        background: ${theme === 'dark' ? '#334155' : '#f4f4f5'} !important;
                        border-radius: 10px;
                        color: ${theme === 'dark' ? 'white' : 'black'};
                    }`}</style>
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
                        alt="Twitter Post Visual"
                        className="w-full h-auto object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x300/e0e0e0/555555?text=Image+Load+Error"; }}
                    />
                </div>
            )}

            {/* Post Actions (Reply, Retweet, Like, Share) */}
            <div className={`flex justify-between items-center ${colors.textSecondary} text-sm mt-3 pt-3 border-t ${colors.border}`}>
                <button className={`flex items-center space-x-1 hover:${colors.iconPrimary} transition-colors`}>
                    <MessageCircle size={16} /><span className="text-xs">0</span>
                </button>
                <button className={`flex items-center space-x-1 hover:${colors.iconGreen} transition-colors`}>
                    <Repeat2 size={16} /><span className="text-xs">0</span>
                </button>
                <button className={`flex items-center space-x-1 hover:${colors.iconRed} transition-colors`}>
                    <Heart size={16} /><span className="text-xs">0</span>
                </button>
                <button className={`flex items-center space-x-1 hover:${colors.iconPrimary} transition-colors`}>
                    <Share size={16} /><span className="text-xs">0</span>
                </button>
            </div>
        </div>
    );
};

export default TwitterPost;