// src/components/seo/DashboardPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Users, TrendingUp, BookOpen, PackageOpen, Search, GripVertical, Plus, Trash2, Edit, Check, X, Lightbulb, MessageCirclePlus, ImageOff, Loader2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

import { useDashboard, useTheme } from '../../pages/SEO.jsx';

// --- Internal Common Components ---
const Card = ({ className, ...props }) => {
    const { themeColors } = useTheme();
    return <div style={{ boxShadow: themeColors.cardShadow }} className={`bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col rounded-lg ${className}`} {...props} />;
};
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


// --- Internal Dashboard Specific Components ---

// KpiCard
const KpiCard = React.memo(({ title, value, change, Icon, isLoading }) => {
    const isPositive = change >= 0;
    const formattedChange = `${isPositive ? '+' : ''}${value !== 0 ? change.toFixed(1) : 0}%`;

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
});

// KeywordPriorityPanel
const KeywordPriorityPanel = React.memo(() => {
    const { keywords, setKeywords, selectedKeyword, setSelectedKeyword, isLoadingInitialData, allData } = useDashboard();
    const { themeColors } = useTheme();
    const [newKeyword, setNewKeyword] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const draggedItem = useRef(null);

    const navigate = useNavigate();

    const handleAddKeyword = () => {
        const trimmed = newKeyword.trim();
        if (!trimmed) return;
        
        // Prevent duplicate names
        if (keywords.some(k => k.name.toLowerCase() === trimmed.toLowerCase())) {
            setNewKeyword('');
            return;
        }

        const newEntry = {
            id: Date.now(),
            name: trimmed,
            traffic: Math.floor(Math.random() * 5000) + 1000,
            trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 60) + 20),
            prev_traffic: Math.floor(Math.random() * 4000) + 500,
            suggestions: [`${trimmed} ideas`, `${trimmed} best practices`]
        };
        // Use the safe updater function pattern
        setKeywords(prev => [newEntry, ...prev]);
        setNewKeyword("");
    };

    const handleDelete = (id) => {
        // Use the safe updater function pattern
        setKeywords(prev => {
            const updatedKeywords = prev.filter(kw => kw.id !== id);
            if (selectedKeyword && selectedKeyword.id === id) {
                setSelectedKeyword(updatedKeywords.length > 0 ? updatedKeywords[0] : null);
            }
            return updatedKeywords;
        });
    };
    const handleEdit = (keyword) => { setEditingId(keyword.id); setEditingText(keyword.name); };
    const handleSaveEdit = () => {
        // Use the safe updater function pattern
        setKeywords(prev => prev.map(kw => kw.id === editingId ? { ...kw, name: editingText } : kw));
        if (selectedKeyword && selectedKeyword.id === editingId) {
            setSelectedKeyword(prev => ({ ...prev, name: editingText }));
        }
        setEditingId(null);
        setEditingText("");
    };
    
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingText("");
    };

    const handleDragStart = (e, index) => { draggedItem.current = index; };
    const handleDragOver = (e) => { e.preventDefault(); };
    const handleDrop = (index) => {
        if (draggedItem.current === null || draggedItem.current === index) return;
        
        const newKeywords = [...keywords];
        const [reorderedItem] = newKeywords.splice(draggedItem.current, 1);
        newKeywords.splice(index, 0, reorderedItem);
        
        // Use the safe setter directly
        setKeywords(newKeywords);
        
        draggedItem.current = null;
    };

    const SuggestedKeywordsContent = React.memo(() => {
        const suggestions = selectedKeyword ? allData.suggested[selectedKeyword.name] || [] : [];

        if (isLoadingInitialData) {
            return (
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-28" />
                </div>
            );
        }

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

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle><GripVertical className="h-4 w-4 text-[var(--text-muted)]" /> Keyword Priority</CardTitle>
                <button onClick={() => { navigate('/seo/chat'); }} className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors p-1 rounded-full hover:bg-[var(--bg-card-hover)]">
                    <MessageCirclePlus size={18} />
                </button>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-grow max-h-[calc(100vh-26rem)]">
                {isLoadingInitialData && keywords.length === 0 ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
                     keywords.length > 0 ? (
                        <div className="flex flex-col space-y-2">
                            {keywords.map((keyword, index) => (
                                <div key={keyword.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={() => handleDrop(index)} onClick={() => {
                                    if (editingId) return; // Prevent selection during edit
                                    if (!selectedKeyword || selectedKeyword.id !== keyword.id) {
                                        setSelectedKeyword(keyword);
                                    }
                                }} style={{boxShadow: themeColors.itemShadow}} className={`p-2.5 bg-[var(--bg-card)] border group flex items-center justify-between transition-all duration-200 cursor-grab rounded-md hover:bg-[var(--bg-card-hover)] ${selectedKeyword?.id === keyword.id ? 'border-[var(--accent-primary)]' : 'border-[var(--border-default)]'}`}>
                                    {editingId === keyword.id ? (
                                        <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSaveEdit()} className="bg-[var(--bg-subtle)] text-sm p-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)] text-[var(--text-primary)]" autoFocus onBlur={handleSaveEdit}/>
                                    ) : (
                                        <span className="font-medium text-sm text-[var(--text-primary)]">{keyword.name}</span>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {editingId === keyword.id ? (
                                            <>
                                                <button onClick={handleSaveEdit} className="text-[var(--accent-positive)] hover:opacity-80"><Check size={16} /></button>
                                                <button onClick={handleCancelEdit} className="text-[var(--accent-negative)] hover:opacity-80"><X size={16} /></button>
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
                        <input type="text" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddKeyword()} placeholder="Add new keyword..." className="bg-[var(--bg-subtle)] text-sm p-2 rounded-md w-full border border-[var(--border-default)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-focus)] text-[var(--text-primary)]" />
                        <button onClick={handleAddKeyword} className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white p-2 rounded-md transition-colors"><Plus size={16} /></button>
                    </div>
                </div>
            </div>
        </Card>
    );
});

// KeywordTrendChart
const KeywordTrendChart = React.memo(() => {
    const { keywords, isLoadingInitialData, selectedKeyword } = useDashboard();
    const { theme, themeColors } = useTheme();

    if (isLoadingInitialData && keywords.length === 0) return <Card><CardContent><Skeleton className="h-[290px] w-full" /></CardContent></Card>;

    const allKeywordsForChart = [...keywords];
    let chartKeywords = [];

    if (selectedKeyword) {
        chartKeywords.push(selectedKeyword);
        const otherKeywords = allKeywordsForChart.filter(kw => kw.id !== selectedKeyword.id);
        chartKeywords = chartKeywords.concat(otherKeywords.slice(0, 4));
    } else {
        chartKeywords = allKeywordsForChart.slice(0, 5);
    }

    const trendData = Array.from({ length: 7 }).map((_, i) => {
        const dayData = { name: `Day ${i + 1}` };
        chartKeywords.forEach(k => { if(k?.name && k?.trend) dayData[k.name] = k.trend[i] || 0; });
        return dayData;
    });

    const COLORS = themeColors.chartColors;

    if (chartKeywords.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle><TrendingUp className="h-4 w-4 text-[var(--text-muted)]" />Keyword Trends</CardTitle></CardHeader>
                <CardContent>
                    <EmptyState icon={TrendingUp} title="No Trends Data" message="Add keywords to see their trends." />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader><CardTitle><TrendingUp className="h-4 w-4 text-[var(--text-muted)]" />Keyword Trends</CardTitle></CardHeader>
            <CardContent>
                <div className="h-[250px] -mx-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
                            <defs>
                                {chartKeywords.map((k, i) => (
                                    k && <linearGradient key={`color-${k.id}`} id={`color-${k.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={theme === 'dark' ? 0.4 : 0.2}/>
                                        <stop offset="95%" stopColor={theme === 'dark' ? COLORS[i % COLORS.length] : '#FFFFFF'} stopOpacity={theme === 'dark' ? 0 : 1}/>
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.borderDefault} />
                            <Tooltip contentStyle={{ backgroundColor: themeColors.bgCard, border: `1px solid ${themeColors.borderDefault}`, fontSize: "12px", color: themeColors.textPrimary, borderRadius: '0.5rem' }} cursor={{ stroke: themeColors.textMuted, strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <YAxis stroke={themeColors.textSecondary} fontSize={12} tickLine={false} axisLine={true} />
                            <XAxis dataKey="name" stroke={themeColors.textSecondary} fontSize={12} tickLine={false} axisLine={true} />
                            <Legend wrapperStyle={{ fontSize: "12px", position: 'absolute', bottom: '0px', color: themeColors.textSecondary }} />
                            {chartKeywords.map((k, index) => (
                               k && <Area key={k.id} type="monotone" dataKey={k.name} stroke={COLORS[index % COLORS.length]} strokeWidth={2} fillOpacity={1} fill={`url(#color-${k.id})`} />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
});

// PlatformTrendsChart (Reverted to original behavior for gap/bar width)
const PlatformTrendsChart = React.memo(({ className }) => {
    const { selectedKeyword, allData, isLoadingInitialData } = useDashboard();
    const { themeColors } = useTheme();

    if (isLoadingInitialData && !selectedKeyword) {
        return <Card><CardContent><Skeleton className="h-full w-full" /></CardContent></Card>;
    }

    const chartData = selectedKeyword ? allData.platformTrends[selectedKeyword.name] || [] : [];

    return (
        <Card className={className}>
            <CardHeader><CardTitle><TrendingUp className="h-4 w-4 text-[var(--text-muted)]" />Platform-wise Trend Score</CardTitle></CardHeader>
            <CardContent>
                {selectedKeyword && chartData.length > 0 ? (
                    <div className="h-full -mx-4 -mb-4">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
                                barSize={20}
                            >
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={themeColors.accentPositive} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={themeColors.accentPrimaryGraph} stopOpacity={0.8}/>
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
                        <EmptyState icon={PackageOpen} title="No Platform Data" message="Platform trend data for this keyword is unavailable. Select a keyword to view." />
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

const RecentPosts = React.memo(({ className }) => {
    const { allData, selectedKeyword, isLoadingDetailedData } = useDashboard();
    const { themeColors } = useTheme();
    const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

    const posts = selectedKeyword ? allData.relatedPosts[selectedKeyword.name] || [] : [];
    const imageErrorPlaceholder = `https://placehold.co/100x100/${themeColors.bgSubtle.substring(1)}/${themeColors.textMuted.substring(1)}?text=Error`;


    // Effect to manage the loading timeout
    useEffect(() => {
        let timer;
        if (isLoadingDetailedData) {
            setShowTimeoutMessage(false); // Reset timeout message when loading starts
            timer = setTimeout(() => {
                setShowTimeoutMessage(true);
            }, 30000); // 30 seconds
        } else {
            // If loading finishes or component unmounts, clear the timer and reset timeout message
            clearTimeout(timer);
            setShowTimeoutMessage(false);
        }

        return () => {
            clearTimeout(timer);
        };
    }, [isLoadingDetailedData]); // Re-run this effect whenever isLoadingDetailedData changes

    // Render logic:
    // 1. If actively loading AND NOT timed out, show spinner.
    // 2. Otherwise (not loading, or timed out), show content or empty state.
    if (isLoadingDetailedData && !showTimeoutMessage) {
        return (
            <Card className={`${className} flex flex-col`}>
                <CardHeader><CardTitle><BookOpen className="h-4 w-4 text-[var(--text-muted)]" />Related Posts</CardTitle></CardHeader>
                <CardContent className="overflow-y-auto flex-grow flex flex-col justify-center items-center p-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)] mb-3" />
                    <p className="text-sm text-center text-[var(--accent-primary)] font-semibold animate-pulse">
                        Fetching related posts...
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`${className} flex flex-col`}>
            <CardHeader><CardTitle><BookOpen className="h-4 w-4 text-[var(--text-muted)]" />Related Posts</CardTitle></CardHeader>
            <CardContent className="overflow-y-auto flex-grow">
                {selectedKeyword && posts.length > 0 ? (
                    <div className="space-y-3">
                        {posts.map((post, index) => (
                            <div key={index} style={{boxShadow: themeColors.itemShadow}} className="flex items-start gap-4 p-3 rounded-lg border bg-[var(--bg-card)] border-[var(--border-default)] transition-colors hover:border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)]">
                                {post.image ? (
                                    <img src={post.image} alt={post.title} className="w-20 h-20 object-cover rounded-md border border-[var(--border-default)]"
                                         onError={(e) => { e.target.onerror = null; e.target.src = imageErrorPlaceholder; }}
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
                    <EmptyState
                        icon={BookOpen}
                        title="No Related Posts"
                        message={showTimeoutMessage ? "Could not load related posts within the expected time. Please try another keyword." : "Related posts will appear after AI analysis or are unavailable for this keyword."}
                    />
                )}
            </CardContent>
        </Card>
    );
});


// Main Dashboard Page Component
const DashboardPage = () => {
    const { selectedKeyword, isLoadingInitialData, keywords } = useDashboard();
    const { themeColors } = useTheme();

    const volume = selectedKeyword?.traffic || 0;
    const prevVolume = selectedKeyword?.prev_traffic || 0;
    const volumeChange = prevVolume > 0 ? ((volume - prevVolume) / prevVolume) * 100 : 0;

    const trendAvg = selectedKeyword?.trend ? selectedKeyword.trend.reduce((a, b) => a + b, 0) / selectedKeyword.trend.length : 0;
    const prevTrendAvg = trendAvg / (1 + (volumeChange / 100));
    const trendChange = prevTrendAvg > 0 ? ((trendAvg - prevTrendAvg) / prevTrendAvg) * 100 : 0;


    return (
        <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 bg-[var(--bg-default)] text-[var(--text-primary)]">
            <div className="lg:col-span-3 sticky top-20 h-[calc(100vh-6.5rem)] pr-3">
                <div className="h-full flex flex-col gap-6">
                    <KeywordPriorityPanel />
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
                            <KpiCard title="Search Volume" value={volume} change={volumeChange} Icon={Users} isLoading={isLoadingInitialData && keywords.length === 0} />
                            <KpiCard title="Avg. 7-Day Trend" value={Number(trendAvg.toFixed(1))} change={trendChange} Icon={TrendingUp} isLoading={isLoadingInitialData && keywords.length === 0} />
                        </div>
                        <RecentPosts className="flex-grow" />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default DashboardPage;