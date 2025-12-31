import React, { useState, useRef, createContext, useContext, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, BarChart, Bar } from 'recharts';
import { Share2, GripVertical, Lightbulb, TrendingUp, BookOpen, BrainCircuit, Search, PackageOpen, Plus, Trash2, Edit, Check, X, Users, ImageOff, Moon, Sun } from 'lucide-react';

// --- THEME & COLOR MANAGEMENT ---
const themes = {
  dark: {
    bgDefault: '#0f172a',
    bgSubtle: '#1e293b',
    bgCard: '#1e293b',
    bgCardHover: '#334155',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    borderDefault: '#334155',
    borderSubtle: '#475569',
    accentPrimary: '#0ea5e9',
    accentPrimaryHover: '#0284c7',
    accentPositive: '#2dd4bf',
    accentNegative: '#f43f5e',
    accentWarning: '#facc15',
    ringFocus: '#0ea5e9',
    greenBg: 'rgba(45, 212, 191, 0.1)',
    greenBorder: 'rgba(45, 212, 191, 0.5)',
    greenText: '#2dd4bf',
    cardShadow: 'none',
    itemShadow: 'none',
  },
  light: {
    bgDefault: '#f3f4f6', // Using gray-100 for a clearer distinction from cards
    bgSubtle: '#f9fafb', // gray-50
    bgCard: '#ffffff',
    bgCardHover: '#f9fafb', // gray-50
    textPrimary: '#1f2937', // gray-800
    textSecondary: '#6b7280', // gray-500
    textMuted: '#9ca3af', // gray-400
    borderDefault: '#e5e7eb', // gray-200
    borderSubtle: '#f3f4f6', // gray-100
    accentPrimary: '#3b82f6',
    accentPrimaryHover: '#2563eb',
    accentPositive: '#10b981', // green-500
    accentNegative: '#ef4444',
    accentWarning: '#f59e0b', // amber-500
    ringFocus: '#3b82f6',
    greenBg: 'rgba(16, 185, 129, 0.1)',
    greenBorder: 'rgba(16, 185, 129, 0.4)',
    greenText: '#047857', // green-700
    cardShadow: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)', // More defined shadow
    itemShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  }
};

const ThemeContext = createContext();
const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    const themeColors = themes[theme];

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, themeColors }}>
            {children}
        </ThemeContext.Provider>
    );
};
const useTheme = () => useContext(ThemeContext);

// --- MOCK DATA ---
const initialKeywords = [
  { id: 1, name: "AI in education", traffic: 25400, trend: [50, 60, 55, 80, 70, 85, 90], prev_traffic: 22100 },
  { id: 2, name: "Student assessment tools", traffic: 9800, trend: [80, 70, 75, 65, 70, 60, 50], prev_traffic: 10500 },
  { id: 3, name: "Gamification in classroom", traffic: 15200, trend: [30, 45, 40, 55, 60, 75, 70], prev_traffic: 13800 },
  { id: 4, name: "Personalized learning", traffic: 12100, trend: [30, 40, 20, 50, 45, 60, 70], prev_traffic: 11000 },
  { id: 5, name: "Virtual reality classroom", traffic: 8900, trend: [40, 50, 60, 55, 70, 65, 75], prev_traffic: 8800 },
  { id: 6, name: "AI Grading Systems", traffic: 8500, trend: [25, 30, 45, 40, 50, 65, 60], prev_traffic: 7200 },
  { id: 7, name: "Classroom Engagement Platforms", traffic: 7600, trend: [60, 65, 70, 68, 75, 80, 82], prev_traffic: 6500 },
];

const suggestedKeywordsData = {
    "AI in education": ["AI for teachers", "EdTech AI solutions", "Smart classroom tech"],
    "Personalized learning": ["Adaptive learning platforms", "Individualized education plans", "Student-centric learning"],
    "Student assessment tools": ["Automated grading software", "Formative assessment online", "Digital portfolio tools"],
    "Gamification in classroom": ["Educational games for students", "Game-based learning benefits", "Classroom reward systems"],
};

const relatedPostsData = {
    "AI in education": [
        { title: "AI Tutors: The Future of Personalized Learning", link: "#", source: "Medium", image: `https://placehold.co/100x100/1e293b/94a3b8?text=AI` },
        { title: "How AI is Grading Essays and What it Means for Teachers", link: "#", source: "Hacker News", image: `https://placehold.co/100x100/1e293b/94a3b8?text=EDU` },
        { title: "Top 5 AI-Powered Tools for Classroom Management", link: "#", source: "Reddit", image: null },
        { title: "Ethical Considerations of AI in Educational Settings", link: "#", source: "Blog", image: null },
        { title: "Another Post to Test Scrolling Behavior", link: "#", source: "Medium", image: `https://placehold.co/100x100/1e293b/94a3b8?text=Test` },
    ],
    "Student assessment tools": [
        { title: "Automating Feedback with Modern Assessment Platforms", link: "#", source: "Blog", image: `https://placehold.co/100x100/1e293b/94a3b8?text=Assess` },
        { title: "The Problem with Standardized Testing in the Digital Age", link: "#", source: "Medium", image: null },
    ],
    "Gamification in classroom": [
        { title: "Level Up Your Lessons: A Guide to Gamification", link: "#", source: "Medium", image: `https://placehold.co/100x100/1e293b/94a3b8?text=Game` },
        { title: "Why Point Systems and Badges Motivate Students", link: "#", source: "Hacker News", image: `https://placehold.co/100x100/1e293b/94a3b8?text=Learn` },
        { title: "Are Leaderboards Helpful or Harmful in the Classroom?", link: "#", source: "Reddit", image: null},
    ],
    "Personalized learning": [ { title: "Adaptive Learning Tech: A 2024 Breakdown", link: "#", source: "Blog", image: `https://placehold.co/100x100/1e293b/94a3b8?text=Adapt` }, ],
    "Virtual reality classroom": [], "AI Grading Systems": [], "Classroom Engagement Platforms": [],
};

const platformTrendData = {
    "AI in education": [ { platform: 'Blog', score: 92 }, { platform: 'YouTube', score: 88 }, { platform: 'Twitter', score: 70 }, { platform: 'LinkedIn', score: 75 } ],
    "Gamification in classroom": [ { platform: 'Blog', score: 85 }, { platform: 'YouTube', score: 95 }, { platform: 'Twitter', score: 78 }, { platform: 'LinkedIn', score: 60 } ],
    "Personalized learning": [ { platform: 'Blog', score: 95 }, { platform: 'YouTube', score: 70 }, { platform: 'Twitter', score: 65 }, { platform: 'LinkedIn', score: 85 } ],
    "Student assessment tools": [ { platform: 'Blog', score: 90 }, { platform: 'YouTube', score: 60 }, { platform: 'Twitter', score: 70 }, { platform: 'LinkedIn', score: 80 } ],
};

// --- MOCK API & DATA HOOK ---
const useSeoData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({ keywords: [], suggested: {}, platformTrends: {}, relatedPosts: {} });

    useEffect(() => {
        const timer = setTimeout(() => {
            setData({
                keywords: initialKeywords,
                suggested: suggestedKeywordsData,
                platformTrends: platformTrendData,
                relatedPosts: relatedPostsData,
            });
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return { data, isLoading };
};

// --- CONTEXT & PROVIDER for State Management ---
const DashboardContext = createContext(null);
const DashboardProvider = ({ children }) => {
    const { data, isLoading } = useSeoData();
    const [keywords, setKeywords] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState(null);

    useEffect(() => {
        if (data.keywords.length > 0) {
            setKeywords(data.keywords);
            if (!selectedKeyword) setSelectedKeyword(data.keywords[0]);
        }
    }, [data.keywords, selectedKeyword]);

    const value = { allData: data, isLoading, keywords, setKeywords, selectedKeyword, setSelectedKeyword };
    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};
const useDashboard = () => useContext(DashboardContext);

// --- CORE & HELPER UI COMPONENTS ---
const Card = ({ className, ...props }) => {
    const { themeColors } = useTheme();
    return <div style={{ boxShadow: themeColors.cardShadow }} className={`bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col rounded-lg ${className}`} {...props} />;
}
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

// --- HEADER COMPONENT ---
const Header = React.memo(() => {
    const { theme, toggleTheme, themeColors } = useTheme();
    return (
        <header style={{boxShadow: themeColors.cardShadow}} className="flex flex-wrap items-center justify-between gap-4 px-4 py-2 bg-[var(--bg-card)] border-b border-[var(--border-default)] sticky top-0 z-30 h-16">
            <h1 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]"><BrainCircuit className="text-[var(--accent-primary)]" /> SEO Dashboard</h1>
            <div className="flex items-center gap-4">
                <button onClick={toggleTheme} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-full hover:bg-[var(--bg-subtle)]">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button className="inline-flex items-center justify-center text-sm font-medium transition-colors px-3 py-1.5 border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] rounded-md">
                    <Share2 className="mr-2 h-4 w-4" /> Export
                </button>
            </div>
        </header>
    );
});

// --- DASHBOARD CARD COMPONENTS ---

const SuggestedKeywordsContent = React.memo(() => {
    const { selectedKeyword, allData, isLoading } = useDashboard();
    const { themeColors } = useTheme();
    if (isLoading) return <div className="flex flex-wrap gap-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-32" />)}</div>;
    
    const suggestions = selectedKeyword ? allData.suggested[selectedKeyword.name] || [] : [];
    
    if (!selectedKeyword || suggestions.length === 0) {
        return (
            <div className="text-center text-[var(--text-muted)] text-sm py-4">
                <p>Select a primary keyword to see suggestions.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {suggestions.map(kw => <span key={kw} style={{backgroundColor: themeColors.greenBg, borderColor: themeColors.greenBorder, color: themeColors.greenText}} className="text-sm border font-medium px-3 py-1.5 rounded-md">{kw}</span>)}
        </div>
    );
});


const KeywordList = React.memo(() => {
    const { keywords, setKeywords, selectedKeyword, setSelectedKeyword, isLoading } = useDashboard();
    const { themeColors } = useTheme();
    const [newKeyword, setNewKeyword] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const draggedItem = useRef(null);
    const addInputRef = useRef(null);
    
    const handleAddKeyword = () => {
        if (newKeyword.trim() === "") return;
        const newEntry = {
            id: Date.now(),
            name: newKeyword.trim(),
            traffic: Math.floor(Math.random() * 5000) + 1000,
            trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 60) + 20),
            prev_traffic: Math.floor(Math.random() * 4000) + 500
        };
        setKeywords(prev => [newEntry, ...prev]);
        setNewKeyword("");
    };

    const handleDelete = (id) => setKeywords(prev => prev.filter(kw => kw.id !== id));
    const handleEdit = (keyword) => { setEditingId(keyword.id); setEditingText(keyword.name); };
    const handleSaveEdit = () => {
        setKeywords(prev => prev.map(kw => kw.id === editingId ? { ...kw, name: editingText } : kw));
        setEditingId(null);
        setEditingText("");
    };

    const handleDragStart = (e, index) => { draggedItem.current = index; };
    const handleDragOver = (e) => { e.preventDefault(); };
    const handleDrop = (index) => {
        if (draggedItem.current === null) return;
        const newKeywords = [...keywords];
        const [reorderedItem] = newKeywords.splice(draggedItem.current, 1);
        newKeywords.splice(index, 0, reorderedItem);
        setKeywords(newKeywords);
        draggedItem.current = null;
    };
    const handlePlusClick = () => addInputRef.current?.focus();

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle><GripVertical className="h-4 w-4 text-[var(--text-muted)]" /> Keyword Priority</CardTitle>
                <button onClick={handlePlusClick} className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors p-1 rounded-full hover:bg-[var(--bg-card-hover)]">
                    <Plus size={18} />
                </button>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-grow max-h-[calc(100vh-26rem)]">
                {isLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
                     keywords.length > 0 ? (
                        <div className="flex flex-col space-y-2">
                            {keywords.map((keyword, index) => (
                                <div key={keyword.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={() => handleDrop(index)} onClick={() => !editingId && setSelectedKeyword(keyword)} style={{boxShadow: themeColors.itemShadow}} className={`p-2.5 bg-[var(--bg-card)] border group flex items-center justify-between transition-all duration-200 cursor-grab rounded-md hover:bg-[var(--bg-card-hover)] ${selectedKeyword?.id === keyword.id ? 'border-[var(--accent-primary)]' : 'border-[var(--border-default)]'}`}>
                                    {editingId === keyword.id ? (
                                        <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSaveEdit()} className="bg-[var(--bg-subtle)] text-sm p-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)] text-[var(--text-primary)]" autoFocus onBlur={handleSaveEdit}/>
                                    ) : (
                                        <span className="font-medium text-sm text-[var(--text-primary)]">{keyword.name}</span>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {editingId === keyword.id ? (
                                            <>
                                                <button onClick={handleSaveEdit} className="text-[var(--accent-positive)] hover:opacity-80"><Check size={16} /></button>
                                                <button onClick={() => setEditingId(null)} className="text-[var(--accent-negative)] hover:opacity-80"><X size={16} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => {e.stopPropagation(); handleEdit(keyword)}} className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"><Edit size={14} /></button>
                                                    <button onClick={(e) => {e.stopPropagation(); handleDelete(keyword.id)}} className="text-[var(--text-secondary)] hover:text-[var(--accent-negative)]"><Trash2 size={14} /></button>
                                                </div>
                                                <GripVertical className="h-4 w-4 text-[var(--text-muted)] cursor-grab" />
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={Search} title="No Keywords" message="Add a keyword below to get started." />
                    )
                )}
            </CardContent>
            <div className="mt-auto">
                <div className="p-4 border-t border-[var(--border-default)]">
                    <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-[var(--accent-warning)]" />Suggested Alternative Keywords</h4>
                    <SuggestedKeywordsContent />
                </div>
                <div className="p-4 border-t border-[var(--border-default)]">
                    <div className="flex gap-2">
                        <input ref={addInputRef} type="text" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddKeyword()} placeholder="Add new keyword..." className="bg-[var(--bg-subtle)] text-sm p-2 rounded-md w-full border border-[var(--border-default)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)] text-[var(--text-primary)]" />
                        <button onClick={handleAddKeyword} className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white p-2 rounded-md transition-colors"><Plus size={16} /></button>
                    </div>
                </div>
            </div>
        </Card>
    );
});

const KeywordTrendChart = React.memo(() => {
    const { keywords, isLoading } = useDashboard();
    const { themeColors } = useTheme();
    if (isLoading) return <Card><CardContent><Skeleton className="h-[290px] w-full" /></CardContent></Card>;

    const topKeywords = keywords.slice(0, 5);
    const trendData = Array.from({ length: 7 }).map((_, i) => {
        const dayData = { name: `Day ${i + 1}` };
        topKeywords.forEach(k => { if(k?.name && k?.trend) dayData[k.name] = k.trend[i] || 0; });
        return dayData;
    });

    const COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444'];

    return (
        <Card>
            <CardHeader><CardTitle><TrendingUp className="h-4 w-4 text-[var(--text-muted)]" />Keyword Trends</CardTitle></CardHeader>
            <CardContent>
                <div className="h-[250px] -mx-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
                            <defs>
                                {topKeywords.map((k, i) => (
                                    k && <linearGradient key={`color-${k.id}`} id={`color-${k.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}/>
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.borderDefault} />
                            <Tooltip contentStyle={{ backgroundColor: themeColors.bgCard, border: `1px solid ${themeColors.borderDefault}`, fontSize: "12px", color: themeColors.textPrimary, borderRadius: '0.5rem' }} cursor={{ stroke: themeColors.textMuted, strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <YAxis stroke={themeColors.textSecondary} fontSize={12} tickLine={false} axisLine={true} />
                            <XAxis dataKey="name" stroke={themeColors.textSecondary} fontSize={12} tickLine={false} axisLine={true} />
                            <Legend wrapperStyle={{ fontSize: "12px", position: 'absolute', bottom: '0px', color: themeColors.textSecondary }} />
                            {topKeywords.map((k, index) => (
                               k && <Area key={k.id} type="monotone" dataKey={k.name} stroke={COLORS[index % COLORS.length]} strokeWidth={2} fillOpacity={1} fill={`url(#color-${k.id})`} />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
});

const PlatformTrendsChart = React.memo(({ className }) => {
    const { selectedKeyword, allData, isLoading } = useDashboard();
    const { themeColors } = useTheme();

    if (isLoading) return <Card><CardContent><Skeleton className="h-full w-full" /></CardContent></Card>;
    
    const chartData = selectedKeyword ? allData.platformTrends[selectedKeyword.name] || [] : [];

    return (
        <Card className={className}>
            <CardHeader><CardTitle><TrendingUp className="h-4 w-4 text-[var(--text-muted)]" />Platform-wise Trend Score</CardTitle></CardHeader>
            <CardContent>
                {selectedKeyword && chartData.length > 0 ? (
                    <div className="h-full -mx-4 -mb-4">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={themeColors.accentPositive} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={themeColors.accentPrimary} stopOpacity={0.8}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.borderDefault} vertical={false} />
                                <XAxis dataKey="platform" stroke={themeColors.textSecondary} fontSize={12} tickLine={false} axisLine={true} />
                                <YAxis type="number" domain={[10, 100]} stroke={themeColors.textSecondary} fontSize={12} tickLine={false} axisLine={true} />
                                <Tooltip contentStyle={{ backgroundColor: themeColors.bgCard, border: `1px solid ${themeColors.borderDefault}`, fontSize: "12px", color: themeColors.textPrimary, borderRadius: '0.5rem' }} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}/>
                                <Bar dataKey="score" fill="url(#colorBar)" background={{ fill: themeColors.bgSubtle }} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-full">
                        <EmptyState icon={PackageOpen} title="No Platform Data" message="Platform trend data for this keyword is unavailable." />
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

const RecentPosts = React.memo(({ className }) => {
    const { allData, isLoading, selectedKeyword } = useDashboard();
    const { themeColors } = useTheme();
    
    const posts = selectedKeyword ? allData.relatedPosts[selectedKeyword.name] || [] : [];

    return (
        <Card className={`${className} flex flex-col`}>
            <CardHeader><CardTitle><BookOpen className="h-4 w-4 text-[var(--text-muted)]" />Related Posts</CardTitle></CardHeader>
            <CardContent className="overflow-y-auto flex-grow">
                {isLoading ? (
                    <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
                ) : (
                    posts.length > 0 ? (
                        <div className="space-y-3">
                            {posts.map((post, index) => (
                                <div key={index} style={{boxShadow: themeColors.itemShadow}} className="flex items-start gap-4 p-3 rounded-lg border bg-[var(--bg-card)] border-[var(--border-default)] transition-colors hover:border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)]">
                                    {post.image ? (
                                        <img src={post.image} alt={post.title} className="w-20 h-20 object-cover rounded-md border border-[var(--border-default)]" 
                                             onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/1e293b/94a3b8?text=Error'; }}
                                        />
                                    ) : (
                                        <div className="w-20 h-20 flex-shrink-0 rounded-md flex items-center justify-center border border-[var(--border-default)] bg-[var(--bg-subtle)]">
                                            <ImageOff className="w-8 h-8 text-[var(--text-muted)]" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm text-[var(--text-primary)] leading-snug">{post.title}</h3>
                                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] text-xs hover:underline">
                                            Visit Link
                                        </a>
                                        <span className="mt-2 block bg-[var(--bg-subtle)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full text-xs font-semibold w-fit">
                                            {post.source}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={Search} title="No Related Posts" message="No posts found for this keyword." />
                    )
                )}
            </CardContent>
        </Card>
    );
});


const KpiCard = ({ title, value, change, Icon, isLoading }) => {
    const isPositive = change >= 0;
    const formattedChange = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;

    if (isLoading) {
        return <Card><CardContent><Skeleton className="h-24 w-full"/></CardContent></Card>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <Icon className="h-5 w-5 text-[var(--text-muted)]" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold font-mono text-[var(--text-primary)]">
                    {value.toLocaleString()}
                </div>
                <p className={`text-sm mt-1 ${isPositive ? 'text-[var(--accent-positive)]' : 'text-[var(--accent-negative)]'}`}>
                    {formattedChange} from last month
                </p>
            </CardContent>
        </Card>
    );
};

// --- MAIN PAGE COMPONENT ---
const SeoDashboardPageContent = () => {
    const { selectedKeyword, isLoading } = useDashboard();

    const volume = selectedKeyword?.traffic || 0;
    const prevVolume = selectedKeyword?.prev_traffic || 0;
    const volumeChange = prevVolume > 0 ? ((volume - prevVolume) / prevVolume) * 100 : 0;

    const trendAvg = selectedKeyword?.trend ? selectedKeyword.trend.reduce((a, b) => a + b, 0) / selectedKeyword.trend.length : 0;
    const prevTrendAvg = trendAvg * (1 - (volumeChange / 100 / 5)); 
    const trendChange = prevTrendAvg > 0 ? ((trendAvg - prevTrendAvg) / prevTrendAvg) * 100 : 0;

    return (
        <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 bg-[var(--bg-default)] text-[var(--text-primary)]">
            <div className="lg:col-span-3 sticky top-20 h-[calc(100vh-6.5rem)] pr-3">
                <div className="h-full flex flex-col gap-6">
                    <KeywordList />
                </div>
            </div>
            <div className="lg:col-span-4 border-l border-[var(--border-default)] px-3">
                <div className="h-[calc(100vh-6.5rem)] overflow-y-auto pr-3">
                    <div className="flex flex-col gap-6 h-full">
                        <KeywordTrendChart />
                        <PlatformTrendsChart className="flex-grow" />
                    </div>
                </div>
            </div>
            <div className="lg:col-span-5 border-l border-[var(--border-default)] pl-3">
                 <div className="h-[calc(100vh-6.5rem)] overflow-y-auto pr-3">
                    <div className="flex flex-col gap-6 h-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <KpiCard title="Search Volume" value={volume} change={volumeChange} Icon={Users} isLoading={isLoading} />
                            <KpiCard title="Avg. 7-Day Trend" value={Number(trendAvg.toFixed(1))} change={trendChange} Icon={TrendingUp} isLoading={isLoading} />
                        </div>
                        <RecentPosts className="flex-grow" />
                    </div>
                </div>
            </div>
        </main>
    );
};

function SeoDashboardPage() {
    const { theme, themeColors } = useTheme();

    const cssVars = Object.entries(themeColors)
        .map(([key, value]) => `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
        .join('');
        
    return (
        <>
            <style>{`
                :root { ${cssVars} }
                body { background-color: var(--bg-default); }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: var(--bg-subtle); }
                ::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: var(--border-default); }
            `}</style>
            <div className={`min-h-screen font-sans flex flex-col ${theme}`}>
                <Header />
                <SeoDashboardPageContent />
            </div>
        </>
    );
}

// App Wrapper
function SEO2() {
    return (
        <ThemeProvider>
            <DashboardProvider>
                <SeoDashboardPage />
            </DashboardProvider>
        </ThemeProvider>
    );
}

// Final export should be the wrapped App
export default SEO2;
