// src/pages/PostPage.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    Sparkles, X, File, Send, Podcast, Menu, Loader2, FileText, Youtube, Sun, Moon, ArrowRight, UploadCloud, SlidersHorizontal, MicIcon, MessageSquareText
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import AdvancedGenerationOptions from '../components/post/GenerationOptions';
import BrowserFrame from '../components/post/BrowserFrame';
import LinkedInPost from '../components/post/LinkedInPost';
import TwitterPost from '../components/post/TwitterPost';
import BlogPost from '../components/post/BlogPost';
import NewsletterPost from '../components/post/NewsletterPost';
import { useLocation, useNavigate } from 'react-router-dom';
import { setGlobalTheme, getGlobalTheme, subscribeToThemeChange } from '../utils/globalTheme';

// Supabase Configuration
const supabaseUrl = 'https://dpaoeuzsnswflnvzgilg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYW9ldXpzbnN3ZmxudnpnaWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjYwNzUsImV4cCI6MjA2NjQwMjA3NX0.n99iuDKnH9ToisD024kSzTWXkVHCGsfN1p6MttqjuBA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Predefined loading messages
const loadingMessages = [
    "Analyzing Content...",
    "Analyzing Post Trends...",
    "Gathering SEO metrics...",
    "Crafting Humanized Tone...",
    "Generating Keywords...",
    "Finalizing Posts...",
    "Optimizing content for virality...",
    "Integrating backlinks...",
    "Cross-referencing SEO data...",
    "Fine-tuning for audience engagement...",
    "Adding platform-specific formatting...",
    "Reviewing final output...",
    "Preparing for display..."
];

const TypewriterText = ({ theme, themeColors, colors }) => {
  const messages = [
    "Turn your ideas into something viral.",
    "Upload a podcast, video, or transcript.",
    "Watch as AI transforms it into LinkedIn posts, blogs, and newsletters.",
    "SEO-friendly. Audience-focused. Ready to publish.",
    "Start your journey now."
  ];

  const [index, setIndex] = React.useState(0);
  const [text, setText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [fadeClass, setFadeClass] = React.useState("fade-in");

  React.useEffect(() => {
    const current = messages[index];
    const speed = isDeleting ? 20 : 50;

    const timer = setTimeout(() => {
      if (!isDeleting && text.length < current.length) {
        setText(current.slice(0, text.length + 1));
      } else if (isDeleting && text.length > 0) {
        setText(current.slice(0, text.length - 1));
      } else if (!isDeleting && text.length === current.length) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && text.length === 0) {
        setFadeClass("fade-out");
        setTimeout(() => {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % messages.length);
          setFadeClass("fade-in");
        }, 500);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, index, messages]);

  return (
    <section className="flex flex-col items-center justify-center h-full" style={{ overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap');
        .elegant-font {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.5px;
        }
        .fade-in { opacity: 1; transition: opacity 0.5s ease-in; }
        .fade-out { opacity: 0; transition: opacity 0.5s ease-out; }
        .cursor { border-right: 2px solid currentColor; animation: blink 0.8s infinite; }
        @keyframes blink { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0; } }
      `}</style>

      {/* Logo Above Text */}
      <div className="flex items-center space-x-2 mb-6 ml-10">
        <span className="font-extrabold uppercase text-3xl" style={{ fontFamily: '"Montserrat", sans-serif' }}>Just</span>
        <Podcast size={20} className={colors.brandPrimary} />
        <span className="font-extrabold uppercase text-3xl" style={{ fontFamily: '"Montserrat", sans-serif' }}>Speak</span>
      </div>

      {/* Typing Text */}
      <h2 className={`elegant-font text-center ml-8 ${fadeClass} ${colors.text}`}>
        {text}
        <span className="cursor"></span>
      </h2>
    </section>
  );
};

const PostPage = ({ transcriptHistory }) => {
    // Hooks and Context
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const chatMessagesEndRef = useRef(null);
    
    // Global theme state management
    const [theme, setTheme] = useState(getGlobalTheme());

    useEffect(() => {
        subscribeToThemeChange(setTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setGlobalTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme]);
    // End global theme state management

    // View State Management
    const isWelcomeView = location.pathname === '/generate-post/welcome';
    const isGenerateView = location.pathname === '/generate-post/generate';

    // Core State Management
    const [isLoading, setIsLoading] = useState(false);
    const [copiedSection, setCopiedSection] = useState(null);
    const [activeTab, setActiveTab] = useState('blog');

    // Pop-up Message State
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');

    // Content Input State
    const [chatInput, setChatInput] = useState('');
    const [selectedTranscripts, setSelectedTranscripts] = useState([]);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [youtubeFile, setYoutubeFile] = useState(null);
    const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
    const [showYoutubeInput, setShowYoutubeInput] = useState(false);
    
    // Generated Content State
    const [generatedContent, setGeneratedContent] = useState({
        blog: null,
        linkedin: null,
        newsletter: null,
        twitter: null,
        linkedinImage: null,
        twitterImage: null,
        blogUrl: null,
    });

    // Modals and Options State
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isAdvancedOptionsModalOpen, setIsAdvancedOptionsModalOpen] = useState(false);
    // Corrected State Initialization
    const [generationOptions, setGenerationOptions] = useState({
    selectedPostType: 'All',
    All: {
        wordCount: 600,
        characterCount: 1500,
        targetAudience: 'General',
        language: 'English',
        toneStyle: 'Professional',
        formality: 50,
        creativityLevel: 50,
        focusKeywords: '',
        keywordDensity: 1.5,
    },
    Blog: {
        wordCount: 500,
        characterCount: 0,
        targetAudience: 'General',
        language: 'English',
        toneStyle: 'Informative',
        formality: 70,
        creativityLevel: 60,
        focusKeywords: '',
        keywordDensity: 1.8,
    },
    LinkedIn: {
        wordCount: 100,
        characterCount: 600,
        targetAudience: 'Professional',
        language: 'English',
        toneStyle: 'Professional',
        formality: 80,
        creativityLevel: 40,
        focusKeywords: '',
        keywordDensity: 1.0,
    },
    Newsletter: {
        wordCount: 50,
        characterCount: 200,
        targetAudience: 'Subscribers',
        language: 'English',
        toneStyle: 'Friendly',
        formality: 60,
        creativityLevel: 70,
        focusKeywords: '',
        keywordDensity: 1.2,
    },
    Twitter: {
        wordCount: 30,
        characterCount: 100,
        targetAudience: 'General',
        language: 'English',
        toneStyle: 'Concise',
        formality: 40,
        creativityLevel: 80,
        focusKeywords: '',
        keywordDensity: 0.5,
    },
});


    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [activeEditedContentType, setActiveEditedContentType] = useState(null);

    // YouTube Preview State
    const [displayedYoutubeVideoId, setDisplayedYoutubeVideoId] = useState('');
    const [youtubeVideoTitle, setYoutubeVideoTitle] = useState('');
    const [isYoutubePreviewMode, setIsYoutubePreviewMode] = useState(false);

    // Other Utility States
    const [chatHistory, setChatHistory] = useState([
        { id: 1, text: "Hello! I'm your AI Copilot. How can I assist you today?", sender: 'ai' }
    ]);
    const [pendingFileReads, setPendingFileReads] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [dotCount, setDotCount] = useState(1);

    // Data Fetching and Side Effects
    const getYoutubeVideoId = (url) => {
        const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([a-zA-Z0-9_-]{11})(?:\S+)?/;
        const match = url.match(regExp);
        return (match && match[1].length === 11) ? match[1] : null;
    };

    const simulateYoutubeTitleFetch = async (videoId) => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(`Simulated Title for Video ID: ${videoId}`);
            }, 100);
        });
    };

    useEffect(() => {
        if (location.state) {
            if (location.state.prompt) {
                const transcriptContent = location.state.prompt;
                const mockTranscript = [{ 
                    id: 'seo-dashboard-transcript', 
                    name: 'Content from SEO Dashboard', 
                    content: transcriptContent 
                }];
                setSelectedTranscripts(mockTranscript);
                setChatInput('');
            }
            if (location.state.focusKeywords) {
                const rawKeywords = location.state.focusKeywords;
                setGenerationOptions(prevOptions => ({
                    ...prevOptions,
                    All: { ...prevOptions.All, focusKeywords: rawKeywords },
                }));
            }
            // Clear the state after processing to prevent re-processing
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);

    useEffect(() => {
        const hasContent = generatedContent.blog || generatedContent.linkedin || 
                        generatedContent.newsletter || generatedContent.twitter;
        
        if (hasContent) {
            if (generatedContent.blog) setActiveTab('blog');
            else if (generatedContent.linkedin) setActiveTab('linkedin');
            else if (generatedContent.newsletter) setActiveTab('newsletter');
            else if (generatedContent.twitter) setActiveTab('twitter');
        }
    }, [generatedContent]);

    useEffect(() => {
        if (!isEditing && generatedContent[activeTab] && 
            editedContent !== generatedContent[activeTab]) {
            setEditedContent(generatedContent[activeTab]);
        }
    }, [activeTab, generatedContent, isEditing, editedContent]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const videoId = getYoutubeVideoId(youtubeUrlInput);
            if (videoId && videoId !== displayedYoutubeVideoId) {
                setDisplayedYoutubeVideoId(videoId);
                setIsYoutubePreviewMode(true);
                simulateYoutubeTitleFetch(videoId).then(title => {
                    setYoutubeVideoTitle(title);
                });
            } else if (!videoId && displayedYoutubeVideoId) {
                setDisplayedYoutubeVideoId('');
                setYoutubeVideoTitle('');
                setIsYoutubePreviewMode(false);
            }
        }, 300); // 300ms debounce
    
        return () => clearTimeout(timeoutId);
    }, [youtubeUrlInput, displayedYoutubeVideoId]);

    const scrollToBottom = useCallback(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessagesEndRef]);

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, scrollToBottom]);

    // Loader and Progress Effects
    useEffect(() => {
        let intervalId;
        let messageIntervalId;
        let timeoutId;

        if (isLoading) {
            // Blinking dots for the button
            intervalId = setInterval(() => {
                setDotCount(prev => (prev % 3) + 1);
            }, 500);

            // Rotating messages for the right panel
            let messageIndex = 0;
            messageIntervalId = setInterval(() => {
                setProgressMessage(loadingMessages[messageIndex]);
                messageIndex = (messageIndex + 1) % loadingMessages.length;
            }, 3000);

            // Timeout for network delay message (30 seconds)
            timeoutId = setTimeout(() => {
                if (isLoading) {
                    setProgressMessage("Network is slow. The generation might take a little longer...");
                }
            }, 30000); // 30 seconds

        } else {
            clearInterval(intervalId);
            clearInterval(messageIntervalId);
            clearTimeout(timeoutId);
            setProgressMessage('');
            setDotCount(1);
        }

        return () => {
            clearInterval(intervalId);
            clearInterval(messageIntervalId);
            clearTimeout(timeoutId);
        };
    }, [isLoading]);
    
    // Popup message effect
    useEffect(() => {
    let timer;
    let showDelay;

    if (showPopup) {
        // Delay showing the popup by 0.5s
        showDelay = setTimeout(() => {
            timer = setTimeout(() => {
                setShowPopup(false);
                setPopupMessage('');
            }, 3000); // Hide after 3 seconds
        }, 500); // Delay before showing
    }

    return () => {
        clearTimeout(showDelay);
        clearTimeout(timer);
    };
}, [showPopup]);


    // Action Handlers
    // FIX: Removed useCallback to avoid stale state issues.
  const handleGenerationOptionsChange = (newOptions) => {
    console.log('Updating generation options:', newOptions); // Debug log
    setGenerationOptions(prevOptions => ({
        ...prevOptions,
        ...newOptions
    }));
};

    const handleSelectTranscripts = (selectedItems) => {
        const formattedTranscripts = selectedItems.map(item => ({
            id: String(item.id),
            name: item.title,
            content: item.transcriptContent
        }));
        setSelectedTranscripts(formattedTranscripts);
        setIsOptionsModalOpen(false);
        if (location.pathname !== '/generate-post/generate') {
            navigate('/generate-post/generate', { replace: true });
        }
    };
    
    const handleFileUpload = useCallback((event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            setPendingFileReads(files.length);
            
            const filePromises = files.map(file => {
                return new Promise((resolve) => {
                    const fileReader = new FileReader();
                    fileReader.onload = (e) => {
                        resolve({
                            id: String(Date.now() + Math.random()),
                            name: file.name,
                            content: e.target.result,
                        });
                    };
                    fileReader.readAsDataURL(file);
                });
            });

            Promise.all(filePromises).then(fileData => {
                setAttachedFiles(prev => [...prev, ...fileData]);
                setPendingFileReads(0);
                
                if (location.pathname !== '/generate-post/generate') {
                    navigate('/generate-post/generate', { replace: true });
                }
            });
        }
        
        event.target.value = '';
    }, [location.pathname, navigate]);
    
    const handleYoutubeUrlSubmit = useCallback(() => {
        if (youtubeUrlInput.trim()) {
            const videoId = getYoutubeVideoId(youtubeUrlInput);
            if (videoId) {
                const simulatedTitle = youtubeVideoTitle || 
                    `YouTube Video (${videoId.substring(0, 5)}...)`;
                
                setYoutubeFile({ 
                    id: String(videoId), 
                    name: simulatedTitle, 
                    url: youtubeUrlInput 
                });
                
                setIsYoutubePreviewMode(false);
                setShowYoutubeInput(false);
                
                if (location.pathname !== '/generate-post/generate') {
                    navigate('/generate-post/generate', { replace: true });
                }
            } else {
                setPopupMessage('Please enter a valid YouTube URL.');
                setShowPopup(true);
            }
        }
    }, [youtubeUrlInput, youtubeVideoTitle, location.pathname, navigate]);

    const handleRemoveAttachedItem = useCallback((type, id) => {
        if (type === 'transcript') {
            setSelectedTranscripts(prev => prev.filter(t => t.id !== id));
        } else if (type === 'file') {
            setAttachedFiles(prev => prev.filter(f => f.id !== id));
        } else if (type === 'youtube') {
            setYoutubeFile(null);
            setYoutubeUrlInput('');
            setIsYoutubePreviewMode(false);
            setDisplayedYoutubeVideoId('');
            setYoutubeVideoTitle('');
            setShowYoutubeInput(false);
        }
    }, []);

   const handleSendChatMessage = async () => {
    const effectivePrompt = chatInput.trim();
    const hasSourceContent = selectedTranscripts.length > 0 || attachedFiles.length > 0 || youtubeFile;

    if (!effectivePrompt && !hasSourceContent) {
        setPopupMessage('Please provide a prompt or attach content.');
        setShowPopup(true);
        return;
    }
    
    const attachmentsToSend = {
        selectedTranscripts: selectedTranscripts,
        attachedFiles: attachedFiles,
        youtubeFile: youtubeFile,
    };

    setIsLoading(true);
    setGeneratedContent({ blog: null, linkedin: null, newsletter: null, twitter: null });
    setChatHistory(prev => [...prev, { id: Date.now(), text: effectivePrompt, sender: 'user' }]);
    setChatInput('');
    setSelectedTranscripts([]);
    setAttachedFiles([]);
    setYoutubeFile(null);
    setYoutubeUrlInput('');
    setShowYoutubeInput(false);

    try {
        const payload = {
            prompt: effectivePrompt,
            generation_options: generationOptions, // This now includes the full structure
            selected_transcripts: attachmentsToSend.selectedTranscripts,
            attached_files: attachmentsToSend.attachedFiles,
            youtube_file: attachmentsToSend.youtubeFile,
        };

        console.log('Sending payload to backend:', payload); // Debug log

        const response = await fetch('http://localhost:5050/generate-posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.message || `Failed to generate posts: ${response.status}`;
            throw new Error(errorMessage);
        }

        const generatedData = await response.json();

        setGeneratedContent({
            blog: generatedData.blog,
            linkedin: generatedData.linkedin,
            newsletter: generatedData.newsletter,
            twitter: generatedData.twitter,
        });
        
        setIsLoading(false);
        setPopupMessage('All posts generated successfully!');
        setShowPopup(true);
        const aiResponseText = "I've generated multi-platform content based on your request. Check the right panel!";
        setChatHistory(prev => [...prev, { id: Date.now() + 1, text: aiResponseText, sender: 'ai' }]);
        
    } catch (error) {
        console.error('Failed to generate posts:', error);
        setIsLoading(false);
        setPopupMessage(`Error: ${error.message}`);
        setShowPopup(true);
        setChatHistory(prev => [...prev, { id: Date.now() + 1, text: `Error: ${error.message}. Please check the backend.`, sender: 'ai' }]);
    }
};

    const handlePromptKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendChatMessage();
        }
    };
    
    const handleEditContent = useCallback((type) => {
        setIsEditing(true);
        setActiveEditedContentType(type);
        setEditedContent(generatedContent[type] || '');
    }, [generatedContent]);

    const handleContentChange = useCallback((newContent) => {
        setEditedContent(newContent);
    }, []);

    const handleSaveEditedContent = useCallback(() => {
        setGeneratedContent(prev => ({
            ...prev,
            [activeEditedContentType]: editedContent
        }));
        setIsEditing(false);
        setActiveEditedContentType(null);
        setPopupMessage(`${activeEditedContentType.charAt(0).toUpperCase() + activeEditedContentType.slice(1)} content updated!`);
        setShowPopup(true);
    }, [editedContent, activeEditedContentType]);

    const handlePost = async (content, type) => {
        console.log(`Attempting to post ${type} content:`, content);
        setPopupMessage('');
        if (type === 'blog') {
            try {
                const blogTitle = content.split('\n')[0].replace(/^[#\s]*/, '') || 'AI Generated Blog Post';
                const rawKeywords = generationOptions?.All?.focusKeywords || generationOptions?.Blog?.focusKeywords || 'ai, content, generation, justspeak';
                const tags = rawKeywords
                    .split(',')
                    .map(tag => tag.trim())
                    .map(tag => tag.replace(/\s+/g, '-'))
                    .map(tag => tag.replace(/[^a-zA-Z0-9-]/g, ''))
                    .map(tag => tag.substring(0, 30))
                    .filter(tag => tag)
                    .slice(0, 4);
                const mutation = `
                    mutation PostBlog($title: String!, $content: String!, $tags: [String!], $published: Boolean) {
                        postBlogToDevTo(title: $title, content: $content, tags: $tags, published: $published) {
                            blogUrl
                        }
                    }
                `;
                const response = await fetch('http://localhost:5050/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: mutation, variables: { title: blogTitle, content: content, tags: tags, published: true } }),
                });
                const result = await response.json();
                if (result.errors) {
                    setPopupMessage(`Error posting blog: ${result.errors[0].message || 'Unknown error'}`);
                    setShowPopup(true);
                } else if (result.data?.postBlogToDevTo?.blogUrl) {
                    const postedUrl = result.data.postBlogToDevTo.blogUrl;
                    setGeneratedContent(prev => ({ ...prev, blogUrl: postedUrl }));
                    setPopupMessage(`Blog posted successfully! View here: ${postedUrl}`);
                    setShowPopup(true);
                    window.open(postedUrl, '_blank');
                } else {
                    setPopupMessage('Failed to post blog to Dev.to. No URL received.');
                    setShowPopup(true);
                }
            } catch (error) {
                setPopupMessage(`An unexpected error occurred: ${error.message}`);
                setShowPopup(true);
            }
        } else {
            setPopupMessage(`${type} content posted (Simulated)`);
            setShowPopup(true);
        }
    };

    const handleCopyContent = useCallback((content, type) => {
        navigator.clipboard.writeText(content).then(() => {
            setPopupMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} content copied!`);
            setShowPopup(true);
            setCopiedSection(type);
            setTimeout(() => { setCopiedSection(null); }, 3000);
        }).catch(err => {
            console.error('Failed to copy content: ', err);
            setPopupMessage(`Failed to copy content. Please try again.`);
            setShowPopup(true);
        });
    }, []);

    const handleSaveContent = useCallback((content, type) => {
        setPopupMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} content saved (simulated)!`);
        setShowPopup(true);
    }, []);

    // Component Rendering
    const renderActiveContentSection = () => {
        const contentToDisplay = isEditing && activeEditedContentType === activeTab ? editedContent : generatedContent[activeTab];
        const actionsColors = themeColors[theme].contentActions;

        const commonProps = {
            theme: theme,
            colors: actionsColors,
            content: contentToDisplay,
            onCopy: handleCopyContent,
            onSave: handleSaveContent,
            onPost: handlePost,
            onEdit: handleEditContent,
            isEditing: isEditing && activeEditedContentType === activeTab,
            onContentChange: handleContentChange,
            onSaveEdit: handleSaveEditedContent,
            copiedSection: copiedSection,
            blogUrl: generatedContent.blogUrl,
        };

        if (!contentToDisplay) {
            return <p className={`text-center ${colors.textSecondary}`}>No {activeTab} content generated yet.</p>;
        }

        const postColors = themeColors[theme][`${activeTab}Post`];

        switch (activeTab) {
            case 'blog': return <BlogPost {...commonProps} colors={postColors} />;
            case 'linkedin': return <LinkedInPost {...commonProps} colors={postColors} image={generatedContent.linkedinImage} />;
            case 'newsletter': return <NewsletterPost {...commonProps} colors={postColors} />;
            case 'twitter': return <TwitterPost {...commonProps} colors={postColors} image={generatedContent.twitterImage} />;
            default: return <p className={`text-center ${colors.textSecondary}`}>Select a content type.</p>;
        }
    };
    
    const handleInitialCardClick = (type) => {
        if (type === "transcript") {
            setIsOptionsModalOpen(true);
        } else if (type === "file_upload") {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        } else if (type === "youtube_analyze") {
            setShowYoutubeInput(true);
        } else if (type === "nlp_chat") {
            navigate('/generate-post/generate');
        }
    };

    const handleExploreFeaturesClick = () => {
        navigate('/generate-post/generate');
        if (youtubeVideoTitle && youtubeUrlInput && displayedYoutubeVideoId) {
            setChatInput(`Analyze this YouTube video URL: ${youtubeUrlInput}`);
        }
    };

    // Styling Data
    const uploadOptions = [
        { name: "Choose Transcripts", icon: FileText, description: "Extract key SEO insights from audio/video transcripts.", type: "transcript" },
        { name: "Upload Files", icon: UploadCloud, description: "Upload articles, documents, or reports for SEO analysis.", type: "file_upload" },
        { name: "Generate Insights", icon: MessageSquareText, description: "Engage in natural language processing chat for instant insights.", type: "nlp_chat" },
        { name: "Upload YouTube URL", icon: Youtube, description: "Gain SEO insights directly from YouTube video URLs.", type: "youtube_analyze" },
    ];
    
    const themeColors = {
        light: {
    page: {
        bgBody: 'bg-[#fefefe]',
        bg: 'bg-gray-50', // Main page background - pure white
        bgSecondary: 'bg-gray-100', // Left panel background
        bgSecondary2: 'bg-[#f0f0f0]',
        bgHead:'bg-[#fefefe]', // Input and attachment containers
        bgPrimary: 'bg-gray-100', // Main page background - pure white
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        border: 'border-gray-300',
        cardBg: 'bg-[#fefefe]', // Card backgrounds in welcome view
        chatBg: 'bg-gray-50',
        chatUserBg: 'bg-purple-500',
        chatUserText: 'text-white',
        chatAIBg: 'bg-gray-200',
        chatAIText: 'text-gray-800',
        brandPrimary: 'text-violet-600',
        brandPrimaryLoader: 'text-[#00c6ff]',
        brandGradient: 'bg-gradient-to-r from-cyan-500 to-purple-600',
        inputBg: 'bg-[#fefefe]',
        inputBorder: 'border-gray-300',
        LoaderText: 'text-white'
    },
    browserFrame: {
        bgPrimary: 'bg-[#f0f0f0]', // Browser frame header
        bgSecondary: 'bg-[#fefefe]', // Browser frame content area
        border: 'border-gray-300',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-500',
    },
    contentActions: {
        bg: 'bg-[#fefefe]',
        bgButton: 'bg-gray-100',
        bgButtonHover: 'bg-gray-200',
        textButton: 'text-gray-700',
        border: 'border-gray-300',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-500',
        activeBg: 'bg-blue-500',
        activeText: 'text-white',
        copySuccessBg: 'bg-green-500',
        copySuccessText: 'text-white',
        voiceListBg: 'bg-[#fefefe]',
        voiceListHover: 'bg-gray-100',
        voiceListActive: 'bg-gray-100',
        messageBg: 'bg-green-100',
        messageText: 'text-green-800',
    },
    blogPost: {
        bgCard: 'bg-[#fefefe]',
        border: 'border-gray-300',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-600',
        inputBg: 'bg-[#fefefe]',
        inputBorder: 'border-gray-300',
        inputFocusRing: 'ring-blue-500',
        buttonPrimaryBg: 'bg-blue-600',
        buttonPrimaryText: 'text-white',
        buttonSecondaryHoverBg: 'bg-gray-200',
        buttonSecondaryText: 'text-gray-700',
        icon: 'text-gray-500',
    },
    linkedinPost: {
        bgCard: 'bg-[#fefefe]',
        bgCardBorder: 'border-gray-300',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-500',
        border: 'border-gray-300',
        inputBg: 'bg-[#fefefe]',
        inputBorder: 'border-gray-300',
        inputFocusRing: 'ring-blue-500',
        buttonHoverBg: 'bg-gray-100',
        iconPrimary: 'text-blue-700',
    },
    newsletterPost: {
        bgCard: 'bg-[#fefefe]',
        bgCardBorder: 'border-gray-300',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-600',
        border: 'border-gray-300',
        inputBg: 'bg-[#fefefe]',
        inputBorder: 'border-gray-300',
        inputFocusRing: 'ring-blue-500',
        link: 'text-blue-600',
        codeBg: '#f4f4f5',
    },
    twitterPost: {
        bgCard: 'bg-[#fefefe]',
        bgCardBorder: 'border-gray-300',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-500',
        border: 'border-gray-300',
        inputBg: 'bg-[#fefefe]',
        inputBorder: 'border-gray-300',
        inputFocusRing: 'ring-blue-500',
        buttonHoverBg: 'bg-gray-100',
        iconPrimary: 'text-blue-500',
        iconSecondary: 'text-gray-500',
        iconGreen: 'text-green-500',
        iconRed: 'text-red-500',
    },
    generationOptions: {
        bg: 'bg-[#fefefe]',
        bgCard: 'bg-gray-100',
        border: 'border-gray-300',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-600',
        buttonDefaultBg: 'bg-[#fefefe]',
        buttonDefaultText: 'text-gray-700',
        buttonDefaultHover: 'bg-gray-200',
        buttonActiveBg: 'bg-blue-600',
        buttonActiveText: 'text-white',
        inputBg: 'bg-[#fefefe]',
        inputBorder: 'border-gray-300',
        inputFocusRing: 'ring-blue-500',
        rangeBg: 'bg-gray-200',
        rangeThumb: 'bg-blue-600',
        brandPrimary: 'text-blue-600',
        brandGradient: 'bg-gradient-to-br from-purple-600 to-purple-800',
    },
},
        dark: {
            page: {
                 // Dark header background
                bgBody: 'bg-[#0f172a]',
                bg: 'bg-[#0f172a]',
                bgSecondary: 'bg-[#1E293B]',
                bgHead: 'bg-[#1E293B]',
                bgSecondary2: 'bg-[#1E293B]',
                bgPrimary: 'bg-[#1E293B]',
                text: 'text-white',
                textSecondary: 'text-[#94A3B8]',
                border: 'border-gray-800',
                cardBg: 'bg-[#1E293B]',
                chatBg: 'bg-[#0F172A]',
                chatUserBg: 'bg-[#00c6ff]',
                chatUserText: 'text-white',
                chatAIBg: 'bg-[#1E293B]',
                chatAIText: 'text-white',
                brandPrimary: 'text-[#00c6ff]',
                brandPrimaryLoader: 'text-[#00c6ff]',
                brandGradient: 'bg-gradient-to-br from-[#00c6ff] to-[#0072ff]',
                inputBg: 'bg-[#1E293B]',
                inputBorder: 'border-[#334155]',
                LoaderText:'text-white'
            },
            browserFrame: {
                bgPrimary: 'bg-[#1E293B]',
                bgSecondary: 'bg-[#0F172A]',
                border: 'border-gray-800',
                textPrimary: 'text-white',
                textSecondary: 'text-[#94A3B8]',
            },
            contentActions: {
                bg: 'bg-[#1E293B]',
                bgButton: 'bg-[#1E293B]',
                bgButtonHover: 'bg-[#334155]',
                textButton: 'text-gray-200',
                border: 'border-[#334155]',
                textPrimary: 'text-white',
                textSecondary: 'text-[#94A3B8]',
                activeBg: 'bg-blue-500',
                activeText: 'text-white',
                copySuccessBg: 'bg-green-500',
                copySuccessText: 'text-white',
                voiceListBg: 'bg-gray-700',
                voiceListHover: 'bg-gray-600',
                voiceListActive: 'bg-gray-600',
                messageBg: 'bg-green-800',
                messageText: 'text-green-200',
            },
            blogPost: {
                bgCard: 'bg-gray-700/30',
                border: 'border-white/10',
                textPrimary: 'text-white',
                textSecondary: 'text-[#94A3B8]',
                inputBg: 'bg-slate-800',
                inputBorder: 'border-slate-700',
                inputFocusRing: 'ring-blue-500',
                buttonPrimaryBg: 'bg-blue-600',
                buttonPrimaryText: 'text-white',
                buttonSecondaryHoverBg: 'bg-[#334155]',
                buttonSecondaryText: 'text-[#94A3B8]',
                icon: 'text-gray-200',
            },
            linkedinPost: {
                bgCard: 'bg-gray-700/30',
                bgCardBorder: 'border-white/10',
                textPrimary: 'text-white',
                textSecondary: 'text-[#94A3B8]',
                border: 'border-white/10',
                inputBg: 'bg-gray-700',
                inputBorder: 'border-white/10',
                inputFocusRing: 'ring-blue-500',
                buttonHoverBg: 'bg-[#334155]',
                iconPrimary: 'text-indigo-600',
            },
            newsletterPost: {
                bgCard: 'bg-gray-700/30',
                bgCardBorder: 'border-white/10',
                textPrimary: 'text-white',
                textSecondary: 'text-[#94A3B8]',
                border: 'border-white/10',
                inputBg: 'bg-gray-700',
                inputBorder: 'border-white/10',
                inputFocusRing: 'ring-blue-500',
                link: 'text-blue-400',
                codeBg: 'white',
            },
            twitterPost: {
                bgCard: 'bg-gray-700/30',
                bgCardBorder: 'border-white/10',
                textPrimary: 'text-white',
                textSecondary: 'text-[#94A3B8]',
                border: 'border-white/10',
                inputBg: 'bg-gray-700',
                inputBorder: 'border-white/10',
                inputFocusRing: 'ring-blue-500',
                buttonHoverBg: 'bg-[#334155]',
                iconPrimary: 'text-blue-400',
                iconSecondary: 'text-gray-400',
                iconGreen: 'text-green-400',
                iconRed: 'text-red-400',
            },
            generationOptions: {
                bg: 'bg-[#1E293B]',
                bgCard: 'bg-[#1E293B]',
                border: 'border-[#334155]',
                textPrimary: 'text-white',
                textSecondary: 'text-[#94A3B8]',
                buttonDefaultBg: 'bg-[#1E293B]',
                buttonDefaultText: 'text-[#94A3B8]',
                buttonDefaultHover: 'bg-[#334155]',
                buttonActiveBg: 'bg-gradient-to-br from-[#00c6ff] to-[#0072ff]',
                buttonActiveText: 'text-white',
                inputBg: 'bg-[#1E293B]',
                inputBorder: 'border-[#334155]',
                inputFocusRing: 'ring-[#3B82F6]',
                rangeBg: 'bg-gray-700',
                rangeThumb: 'bg-gradient-to-br from-[#00c6ff] to-[#0072ff]',
                brandPrimary: 'text-[#00c6ff]',
                brandGradient: 'bg-gradient-to-br from-[#00c6ff] to-[#0072ff]',
            },
        }
    };
    const colors = themeColors[theme].page;
    const Card = ({ className, ...props }) => {
        const cardHoverBg = theme === 'dark' ? '': 'bg-gray-50';
        return (
            <div
                className={`${colors.cardBg} ${colors.border} flex flex-col rounded-lg ${className} ${cardHoverBg} transition-colors cursor-pointer hover:transform hover:-translate-y-2 transition-transform duration-300`}
                {...props}
            />
        );
    };

    const AdvancedOptionsModal = ({ isOpen, onClose, children }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative shadow-lg w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                        title="Close"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                    {children}
                </div>
            </div>
        );
    };

    const TranscriptSelectionModal = ({ isOpen, onClose, onSelect, transcriptsToDisplay }) => {
        const [selectedIds, setSelectedIds] = useState([]);
        const handleCheckboxChange = (id) => {
            setSelectedIds(prev => prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]);
        };
        const handleSubmit = () => {
            const selectedItems = transcriptsToDisplay.filter(t => selectedIds.includes(t.id));
            onSelect(selectedItems);
            onClose();
        };
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`${colors.bg} ${colors.border} rounded-xl shadow-lg w-full max-w-md max-h-[80vh] flex flex-col p-6`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-xl font-semibold ${colors.text}`}>Select Transcripts</h3>
                        <button onClick={onClose} className={`text-gray-400 hover:${colors.text}`}><X size={20} /></button>
                    </div>
                    <div className="flex-grow overflow-y-auto space-y-3">
                        {transcriptsToDisplay.length === 0 ? (
                            <div className="text-center text-gray-500 p-4">No transcripts available</div>
                        ) : (
                            transcriptsToDisplay.map(t => (
                                <label key={t.id} className={`flex items-center p-3 rounded-md border ${colors.border} ${theme === 'dark' ? 'bg-[#0F172A] hover:bg-[#334155]' : 'bg-[#fefefe] hover:bg-gray-100'} cursor-pointer`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(t.id)}
                                        onChange={() => handleCheckboxChange(t.id)}
                                        className="mr-3 h-4 w-4 accent-blue-600"
                                    />
                                    <span className={`text-sm font-medium ${colors.text}`}>{t.title}</span>
                                </label>
                            ))
                        )}
                    </div>
                    <div className={`p-4 border-t ${colors.border} flex justify-end gap-2`}>
                        <button onClick={onClose} className={`px-4 py-2 text-sm font-medium rounded-md ${colors.border} ${colors.text} hover:${colors.bgSecondary}`}>Cancel</button>
                        <button
                            onClick={handleSubmit}
                            disabled={selectedIds.length === 0}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${colors.brandGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800`}
                        >
                            Submit ({selectedIds.length})
                        </button>
                    </div>
                </div>
            </div>
        );
    };

   const PopupMessage = () => {
    const bgColor = 'bg-green-500/85 dark:bg-green-500/85 backdrop-blur-';
    const textColor = 'text-white';
    const transitionClass = showPopup
        ? 'translate-y-0 opacity-100'
        : '-translate-y-8 opacity-0';

    return (
        <div
            className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-500 ease-out ${transitionClass}`}
        >
            <div
                className={`
                    px-8 py-3
                    min-w-[300px] max-w-[90vw]
                    rounded-lg shadow-lg
                    text-lg font-medium text-center
                    ${bgColor} ${textColor}
                `}
            >
                {popupMessage}
            </div>
        </div>
    );
};

    return (
        
        <div className={`flex flex-col h-screen overflow-y-auto font-sans ${colors.bg} ${colors.text}`}>
            {isWelcomeView && (
                <main className={`flex-1 flex flex-col items-center ${colors.bg} ${colors.text} relative min-h-screen overflow-y-auto`}>
                    <header className={`w-full ${colors.bgHead} py-4 flex justify-between items-center px-8 shadow-md border-b${colors.border}`}>
                        <div className="flex items-center">
                            <Sparkles className={`h-6 w-6 mr-3 ${colors.brandPrimary}`} />
                            <span className={`text-xl font-semibold font-sans`}>Media Posts</span>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={toggleTheme}
                                className={`p-1 rounded-full hover:${colors.bgSecondary} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                                title="Toggle Theme"
                            >
                                {theme === 'dark' ? <Sun size={20} className={`text-gray-400`} /> : <Moon size={20} className={`text-gray-400`} />}
                            </button>
                        </div>
                    </header>
                    <section className="relative w-full py-18 px-4 text-center z-0 flex flex-col items-center justify-start">
                        <div className="relative z-10 max-w-6xl mx-auto">
                            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 ${colors.text}`}>
                                Scrolling Fingers Pause as <span className={`${colors.brandPrimary}`}> Our Posts Speak</span>
                            </h2>
                            <p className={`text-xl md:text-2xl ${colors.textSecondary} mb-12 max-w-3xl mx-auto`}>
                                Effectively transform any source of inspiration audio video or text into trending posts designed to foster significant engagement.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-18">
                                {uploadOptions.map((option, index) => (
                                    <Card
                                        key={index}
                                        className={`items-center p-6 text-center h-full border light:border-gray-50 rounded-2xl hover:${colors.bgSecondary} transition-colors cursor-pointer shadow-sm`}
                                        onClick={() => handleInitialCardClick(option.type)}
                                    >
                                        {option.type === 'transcript' && <FileText size={38} className={`text-[#60A5FA] mb-6`} />}
                                        {option.type === 'file_upload' && <UploadCloud size={38} className={`text-[#34D399] mb-6`} />}
                                        {option.type === 'nlp_chat' && <MessageSquareText size={38} className={`text-[#FBBF24] mb-6`} />}
                                        {option.type === 'youtube_analyze' && <Youtube size={38} className={`text-[#EF4444] mb-6`} />}
                                        <h3 className={`font-semibold text-xl ${colors.text} mb-2`}>{option.name}</h3>
                                        <p className={`${colors.textSecondary} text-sm`}>{option.description}</p>
                                    </Card>
                                ))}
                            </div>
                            <button
                                className={`${colors.brandGradient} text-white text-lg font-bold px-10 py-4 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mx-auto transform hover:scale-105`}
                                onClick={handleExploreFeaturesClick}
                            >
                                Start Generating <ArrowRight size={20} />
                            </button>
                        </div>
                    </section>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".doc,.docx,.pdf,.txt"
                        style={{ display: 'none' }}
                    />
                    <section className="py-16 px-4 w-full max-w-4xl mx-auto text-center">
                        <h2 className={`text-3xl font-bold ${colors.text} mb-6`}>Analyze YouTube Video by URL</h2>
                        <p className={`text-lg ${colors.textSecondary} mb-8`}>Enter a YouTube video URL to analyze its content and generate insights.</p>
                        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
                            <input
                                type="text"
                                className={`flex-grow p-3 rounded-lg ${colors.bgSecondary} ${colors.border} ${colors.text} placeholder:${colors.textSecondary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="Paste YouTube URL here..."
                                value={youtubeUrlInput}
                                onChange={(e) => setYoutubeUrlInput(e.target.value)}
                            />
                            <button
                                className={`${colors.brandGradient} text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200`}
                                onClick={handleYoutubeUrlSubmit}
                            >
                                Analyze & Go to Chat
                            </button>
                        </div>
                        {displayedYoutubeVideoId && (
                            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${displayedYoutubeVideoId}`}
                                    title={youtubeVideoTitle || "YouTube video player"}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                                {youtubeVideoTitle && (
                                    <p className={`text-md mt-2 font-medium ${colors.text}`}>{youtubeVideoTitle}</p>
                                )}
                            </div>
                        )}
                    </section>
                    <footer className={`w-full text-center py-8 border-t ${colors.bgCardBorder} mt-16 ${colors.textSecondary} text-sm`}>
                        <p>© {new Date().getFullYear()} AI SEO Assistant. All rights reserved.</p>
                    </footer>
                </main>
            )}
            {isGenerateView && (
                
                <div className="flex h-full w-full pl-3 pt-6 pr-3 pb-3 ">
                    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap');
        .elegant-font {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.5px;
        }
      `}</style>
                    <div className={`w-full lg:w-2/7 h-full border-3 flex flex-col ${colors.border} rounded-xl ${colors.bg} shadow-2xl`}>
                        <div className={`flex items-between justify-between p-4 border-b ${colors.border} ${colors.bgSecondary2} rounded-t-xl rounded-b-none`}>
                            <div className="relative flex items-center justify-between w-full">
                                <button
                                    onClick={""}
                                    className={`p-1 rounded-full hover:${colors.bgSecondary} focus:outline-none transition-colors duration-200`}
                                    title="Toggle Menu"
                                >
                                    <Menu size={20} className={`${colors.text}`} />
                                </button>
                                <h2
                                    className={`absolute left-1/2 -translate-x-1/2 text-xl font-bold flex items-center space-x-2 ${colors.text}`}
                                >
                                    <span
                                        className="font-extrabold uppercase"
                                        style={{ fontFamily: '"Montserrat", sans-serif' }}
                                    >
                                        Just
                                    </span>
                                    <Podcast size={17} className={colors.brandPrimary} />
                                    <span
                                        className="font-extrabold uppercase"
                                        style={{ fontFamily: '"Montserrat", sans-serif' }}
                                    >
                                        Speak
                                    </span>
                                </h2>
                                <button
                                    onClick={toggleTheme}
                                    className={`p-1 rounded-full hover:${colors.bgSecondary} focus:outline-none transition-colors duration-200`}
                                    title="Toggle Theme"
                                >
                                    {theme === 'dark' ? <Sun size={20} className={`${colors.text}`} /> : <Moon size={20} className={`${colors.text}`} />}
                                </button>
                            </div>
                        </div>

                        <div className={`flex-grow overflow-y-auto p-4 ${colors.bgBody} custom-scrollbar flex flex-col justify-center`}>
                            <div className="text-center mb-6">
                                <h2 className={`text-2xl font-bold ${colors.text} mb-6 ml-9`}>
                                    Ready to Create? ✍️
                                </h2>
                                <p className={`${colors.textSecondary} italic`}>
                                    Upload or Type it, get trending social media content in seconds!
                                </p>
                            </div>

                            {(selectedTranscripts.length > 0 || attachedFiles.length > 0 || youtubeFile) && (
                                <div className={`mb-6 p-4 rounded-lg border ${colors.border} ${colors.bgSecondary}`}>
                                    <h4 className={`font-semibold ${colors.text} mb-2`}>Attached Content:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {selectedTranscripts.map(t => (
                                            <li key={t.id} className={`text-sm ${colors.textSecondary} flex items-center justify-between`}>
                                                <div className="flex items-center">
                                                    <FileText size={16} className={`mr-2 ${colors.brandPrimary}`} />
                                                    {t.name}
                                                </div>
                                                <button onClick={() => handleRemoveAttachedItem('transcript', t.id)} className={`text-red-500 hover:text-red-700`}>
                                                    <X size={16} />
                                                </button>
                                            </li>
                                        ))}
                                        {attachedFiles.map(f => (
                                            <li key={f.id} className={`text-sm ${colors.textSecondary} flex items-center justify-between`}>
                                                <div className="flex items-center">
                                                    <File size={16} className={`mr-2 text-green-500`} />
                                                    {f.name}
                                                </div>
                                                <button onClick={() => handleRemoveAttachedItem('file', f.id)} className={`text-red-500 hover:text-red-700`}>
                                                    <X size={16} />
                                                </button>
                                            </li>
                                        ))}
                                        {youtubeFile && (
                                            <li key={youtubeFile.id} className={`text-sm ${colors.textSecondary} flex items-center justify-between`}>
                                                <div className="flex items-center">
                                                    <Youtube size={16} className={`mr-2 text-red-500`} />
                                                    {youtubeFile.name}
                                                </div>
                                                <button onClick={() => handleRemoveAttachedItem('youtube', youtubeFile.id)} className={`text-red-500 hover:text-red-700`}>
                                                    <X size={16} />
                                                </button>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            <div className={`relative p-4 rounded-lg border ${colors.border} ${colors.bgSecondary}`}>
                                <div className="absolute bottom-2 left-2 p-2">
                                    <button
                                        onClick={() => setIsAdvancedOptionsModalOpen(true)}
                                        className={`p-2 rounded-md ${colors.textSecondary} hover:${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#fefefe]'} hover:${colors.text} transition-colors duration-200`}
                                        title="Customize Post Options"
                                    >
                                        <SlidersHorizontal size={20} />
                                    </button>
                                </div>

                                <div className="absolute bottom-2 right-2 p-2">
                                    {isLoading ? (
                                        <Loader2 size={20} className="animate-spin text-gray-400" />
                                    ) : (
                                        <button
                                            className={`p-2 rounded-md ${colors.textSecondary} hover:${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#fefefe]'} hover:${colors.text} transition-colors duration-200`}
                                            title="Voice Input"
                                        >
                                            <MicIcon size={16} />
                                        </button>
                                    )}
                                </div>

                                <textarea
                                    placeholder="Just speak your mind...."
                                    className={`w-full p-3 h-45 border-none rounded-lg resize-none bg-transparent ${colors.text} placeholder:${colors.textSecondary} focus:outline-none focus:ring-0  ${colors.inputBorder}`}
                                    rows={4}
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={handlePromptKeyDown}
                                />
                            </div>

                            <div className="flex items-center gap-2 mt-5">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`flex-1 flex items-center justify-center p-3 rounded-lg border ${colors.border} ${colors.bgSecondary} ${colors.textSecondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} hover:text-gray-900 transition-colors duration-200`}
                                    title="Upload Documents"
                                >
                                    <UploadCloud size={20} className="mr-2" /> Files
                                </button>
                                <button
                                    onClick={() => setIsOptionsModalOpen(true)}
                                    className={`flex-1 flex items-center justify-center p-3 rounded-lg border ${colors.border} ${colors.bgSecondary} ${colors.textSecondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} hover:text-gray-900 transition-colors duration-200`}
                                    title="Select Transcripts"
                                >
                                    <FileText size={20} className="mr-2" /> Transcripts
                                </button>
                                <button
                                    onClick={() => {
                                        setShowYoutubeInput(true);
                                    }}
                                    className={`flex-1 flex items-center justify-center p-3 rounded-lg border ${colors.border} ${colors.bgSecondary} ${colors.textSecondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} hover:text-gray-900 transition-colors duration-200`}
                                    title="Use YouTube URL"
                                >
                                    <Youtube size={20} className="mr-2" /> YouTube
                                </button>
                            </div>
                            
                            {showYoutubeInput && (
                                <div id="youtube-url-section" className={`mt-4 p-4 rounded-lg border ${colors.border} ${colors.bgSecondary}`}>
                                    <label htmlFor="youtube-url-input" className={`block font-semibold ${colors.text} mb-2`}>
                                        YouTube URL
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            id="youtube-url-input"
                                            type="text"
                                            className={`flex-grow p-2 rounded-lg ${colors.inputBg} ${colors.inputBorder} ${colors.text} placeholder:${colors.textSecondary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="Paste YouTube URL here..."
                                            value={youtubeUrlInput}
                                            onChange={(e) => setYoutubeUrlInput(e.target.value)}
                                        />
                                        <button
                                            className={`shrink-0 p-2 rounded-lg ${colors.brandGradient} text-white transition-colors duration-200`}
                                            onClick={handleYoutubeUrlSubmit}
                                        >
                                            <ArrowRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`shrink-0 p-4 rounded-b-xl border-t ${colors.border} ${colors.bg}`}>
                            <button
                                onClick={handleSendChatMessage}
                                className={`w-full py-3 rounded-lg ${colors.brandGradient} text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:opacity-90 disabled:cursor-not-allowed`}
                                title="Generate Content"
                                disabled={isLoading || (chatInput.trim() === '' && selectedTranscripts.length === 0 && attachedFiles.length === 0 && !youtubeFile)}
                            >
                                {isLoading ? (
                                    <>
                                        <span>Generating Content{''.padEnd(dotCount, '.')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        <span>Generate Content</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div className={`h-full flex flex-col border-1 ${colors.border} rounded-2xl shadow-xl w-full lg:w-5/7 ml-4`}>
                        <BrowserFrame colors={themeColors[theme].browserFrame} theme={theme} activeTabTitle={activeTab === 'blog' ? 'Blog Post' : activeTab === 'linkedin' ? 'LinkedIn' : activeTab === 'newsletter' ? 'Newsletter' : 'Twitter/X'}>
                             {/* Right panel loader and progress text */}
                            {isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-violet-700/10 dark:bg-slate-900/70 z-10 backdrop-blur-sm transition-opacity duration-300">
                                    <Loader2 size={48} className={`animate-spin ${colors.brandPrimaryLoader}`} />
                                    <p className={`mt-4 text-xl font-semibold text-white`}>{progressMessage}</p>
                                </div>
                            )}
                            <div className={`flex-grow overflow-y-auto custom-scrollbar-hide rounded-b-xl ${themeColors[theme].browserFrame.bgSecondary}`}>
                                {isYoutubePreviewMode && displayedYoutubeVideoId ? (
                                    <div className={`p-6 flex-grow relative ${themeColors[theme].browserFrame.bgSecondary} rounded-b-xl overflow-y-auto`}>
                                        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                                            <iframe
                                                className="w-full h-full"
                                                src={`https://www.youtube.com/embed/${displayedYoutubeVideoId}?autoplay=1`}
                                                title={youtubeVideoTitle || "YouTube video player"}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                        {youtubeVideoTitle && (
                                            <p className={`text-md mt-4 font-medium ${colors.text}`}>{youtubeVideoTitle}</p>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {(!generatedContent.blog && !generatedContent.linkedin && !generatedContent.newsletter && !generatedContent.twitter) ? (
                                           <section
  id="how-it-works"
  className={`flex items-center justify-center h-full px-6 py-12 ${themeColors[theme].browserFrame.bgSecondary}`}
  style={{
    overflow: 'hidden' // prevent scroll
  }}
>
  <TypewriterText
    theme={theme}
    themeColors={themeColors}
    colors={colors}
  />
</section>

                                        ) : (
                                            <>
                                                <div className={`flex justify-around border-b ${colors.border} mb-6 overflow-x-auto whitespace-nowrap ${themeColors[theme].page.bgPrimary} ${colors.text}`}>
                                                    <button
                                                        className={`flex-1 py-3 px-2 text-center text-base font-medium relative transition-all duration-300 
                                                        ${activeTab === 'blog' ? `${colors.text} after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-600 dark:after:bg-[#00c6ff]` : `${colors.textSecondary} hover:${colors.text}`}`}
                                                        onClick={() => setActiveTab('blog')}
                                                    >
                                                        Blog Post
                                                    </button>
                                                    <button
                                                        className={`flex-1 py-3 px-2 text-center text-base font-medium relative transition-all duration-300
                                                        ${activeTab === 'linkedin' ? `${colors.text} after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-600 dark:after:bg-[#00c6ff]` : `${colors.textSecondary} hover:${colors.text}`}`}
                                                        onClick={() => setActiveTab('linkedin')}
                                                    >
                                                        LinkedIn Post
                                                    </button>
                                                    <button
                                                        className={`flex-1 py-3 px-2 text-center text-base font-medium relative transition-all duration-300
                                                        ${activeTab === 'newsletter' ? `${colors.text} after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-600 dark:after:bg-[#00c6ff]` : `${colors.textSecondary} hover:${colors.text}`}`}
                                                        onClick={() => setActiveTab('newsletter')}
                                                    >
                                                        Newsletter
                                                    </button>
                                                    <button
                                                        className={`flex-1 py-3 px-2 text-center text-base font-medium relative transition-all duration-300
                                                        ${activeTab === 'twitter' ? `${colors.text} after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-600 dark:after:bg-[#00c6ff]` : `${colors.textSecondary} hover:${colors.text}`}`}
                                                        onClick={() => setActiveTab('twitter')}
                                                    >
                                                        Twitter/X Post
                                                    </button>
                                                </div>
                                                <div className={`p-6 flex-grow relative ${themeColors[theme].browserFrame.bgSecondary} rounded-b-xl overflow-y-auto`}>
                                                    {renderActiveContentSection()}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </BrowserFrame>
                    </div>
                </div>
            )}
            <PopupMessage />
            <TranscriptSelectionModal
                isOpen={isOptionsModalOpen}
                onClose={() => setIsOptionsModalOpen(false)}
                onSelect={handleSelectTranscripts}
                transcriptsToDisplay={transcriptHistory}
            />
            <div>
                <AdvancedOptionsModal
                    isOpen={isAdvancedOptionsModalOpen}
                    onClose={() => setIsAdvancedOptionsModalOpen(false)}
                >
                    <AdvancedGenerationOptions
                        colors={themeColors[theme].generationOptions}
                        currentSettings={generationOptions} // Make sure this prop is correctly named
                        onSettingsChange={handleGenerationOptionsChange}
                    />
                </AdvancedOptionsModal>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple style={{ display: 'none' }} />
        </div>
    );
};
export default PostPage;