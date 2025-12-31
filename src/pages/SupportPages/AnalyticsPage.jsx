import React, { useState, useEffect, useCallback } from 'react';
// IMPORTANT: Ensure you have installed @supabase/supabase-js in your project.
// You can install it using npm: npm install @supabase/supabase-js
// Or using yarn: yarn add @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, // Changed LineChart, Line to AreaChart, Area
    PieChart, Pie, Cell, BarChart, Bar, ScatterChart, Scatter
} from 'recharts';
// IMPORTANT: Verify this path is correct. If AnalyticsPage.jsx is in 'src/components/',
// then ThemeContext.jsx should be in 'src/context/'.
import { useTheme } from '../../context/ThemeContext';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'; // Import for the Read More icon and expand/collapse icons

// [NEW] Initialize Supabase Client
// IMPORTANT: Replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY' with your actual Supabase project URL and anon public key.
// The provided key here is a placeholder; ensure it is valid for your Supabase project.
const supabaseUrl = 'https://dpaoeuzsnswflnvzgilg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYW9ldXpzbnN3ZmxudnpnaWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjYwNzUsImV4cCI6MjA2NjQwMjA3NX0.n99iuDKnH9ToisD024kSzTWXkVHCGsfN1p6MttqjuBA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Character limit for truncating transcript_output in the table
const TRANSCRIPT_TRUNCATE_LIMIT = 100;

// Modal component for full transcript output
const TranscriptModal = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay-bg">
            <div className="modal-bg modal-border rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
                <h3 className="text-xl font-bold modal-text mb-4">Full Transcript Output</h3>
                <div className="modal-text text-sm max-h-96 overflow-y-auto custom-scrollbar border modal-border p-3 rounded">
                    <p>{content}</p>
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 w-full py-2 px-4 rounded-lg btn-primary-gradient btn-primary-text font-medium hover:opacity-90 transition-opacity duration-200"
                >
                    Close
                </button>
            </div>
        </div>
    );
};


const AnalyticsPage = () => {
    const { theme } = useTheme();
    const [allTranscriptions, setAllTranscriptions] = useState([]);
    const [generationsOverTime, setGenerationsOverTime] = useState([]);
    const [fileTypeDistribution, setFileTypeDistribution] = useState([]);
    const [selectedFileType, setSelectedFileType] = useState(null);
    const [filteredTranscriptions, setFilteredTranscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
    const [currentTranscriptContent, setCurrentTranscriptContent] = useState('');
    // [NEW] State for table visibility
    const [isTableExpanded, setIsTableExpanded] = useState(false);


    // Dummy data for additional charts (kept as is)
    const dummyWordCountData = [
        { name: 'Mon', 'Word Count': 1200 },
        { name: 'Tue', 'Word Count': 1500 },
        { name: 'Wed', 'Word Count': 900 },
        { name: 'Thu', 'Word Count': 1800 },
        { name: 'Fri', 'Word Count': 1300 },
        { name: 'Sat', 'Word Count': 2000 },
        { name: 'Sun', 'Word Count': 1100 },
    ];

    const dummySentimentData = [
        { x: 100, y: 0.85, z: 20 },
        { x: 150, y: 0.7, z: 30 },
        { x: 80, y: 0.92, z: 15 },
        { x: 200, y: 0.6, z: 40 },
        { x: 120, y: 0.78, z: 25 },
        { x: 90, y: 0.95, z: 18 },
        { x: 180, y: 0.55, z: 35 },
    ];

    // Function to truncate text and add '...'
    const truncateText = (text, limit) => {
        if (!text) return '';
        if (text.length <= limit) return text;
        return text.substring(0, limit) + '...';
    };

    // Handler to open transcript modal
    const handleReadMoreClick = (content) => {
        setCurrentTranscriptContent(content);
        setIsTranscriptModalOpen(true);
    };

    // [NEW] Toggle table visibility
    const toggleTableVisibility = () => {
        setIsTableExpanded(!isTableExpanded);
    };


    // Function to process raw data into chart-friendly formats
    const processTranscriptions = useCallback((data) => {
        // Generations Over Time (Daily Count)
        const dailyCounts = data.reduce((acc, item) => {
            const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        const sortedDailyCounts = Object.keys(dailyCounts)
            .map(date => ({ date, count: dailyCounts[date] }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        setGenerationsOverTime(sortedDailyCounts);

        // File Type Distribution (Pie Chart) - uses file_mime_type
        // [MODIFIED] Using file_mime_type
        const typeCounts = data.reduce((acc, item) => {
            const type = item.file_mime_type || 'Unknown'; // Use file_mime_type, fallback to 'Unknown'
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        const pieData = Object.keys(typeCounts).map(type => ({
            name: type,
            value: typeCounts[type],
        }));
        setFileTypeDistribution(pieData);
    }, []);

    // Fetch data from Supabase
    useEffect(() => {
        const fetchTranscriptions = async () => {
            try {
                const { data, error } = await supabase
                    .from('transcriptions')
                    // Select all relevant fields, including file_mime_type
                    .select('created_at, input_type, file_name, transcript_output, file_mime_type'); // [MODIFIED] Added file_mime_type

                if (error) {
                    throw error;
                }
                setAllTranscriptions(data);
                processTranscriptions(data);
            } catch (err) {
                console.error('Error fetching transcriptions:', err);
                setError('Failed to load data. Please check your Supabase connection and table schema. Error: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTranscriptions();
    }, [processTranscriptions]);

    const handlePieSliceClick = useCallback((data) => { // Removed 'index' as it's not used
        const clickedType = data.name;
        setSelectedFileType(clickedType);
        // [MODIFIED] Filtering by file_mime_type
        const filtered = allTranscriptions.filter(t => (t.file_mime_type || 'Unknown') === clickedType);
        setFilteredTranscriptions(filtered);
        setIsTableExpanded(true); // [NEW] Automatically expand table when a slice is clicked
    }, [allTranscriptions]);

    // Define colors for Pie Chart slices
    const PIE_COLORS = ['#EE58FFFF', '#03FBFFFF', '#FFC44DFF', '#ff7300', '#0088FE', '#3EFF4BFF', '#FFBB28', '#FF8042']; // Added more colors for variety

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="modal-bg p-3 rounded-md shadow-lg border modal-border text-modal-text text-sm">
                    <p className="font-semibold">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color || 'inherit' }}>
                            {`${p.name}: ${typeof p.value === 'number' ? p.value.toLocaleString() : p.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full welcome-section-bg rounded-xl p-8">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin"></div>
                <p className="text-primary-color ml-3">Loading analytics data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full w-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-xl p-8">
                <p className="text-lg font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full p-2 space-y-4 analytics-page-bg rounded-xl custom-scrollbar overflow-y-auto">
            {/* Header */}
            <h1 className="text-3xl font-extrabold text-primary-color text-center mb-6 chat-gradient-highlight">Transcription Analytics Dashboard</h1>
            <p className="text-center text-secondary-color max-w-2xl mx-auto mb-8">
                Gain insights into your transcription usage! This dashboard visualizes the number of transcriptions over time, the distribution of file types, and provides a detailed view of transcriptions based on selected file types.
            </p>

            {/* Main Charts Section - 3 charts in first row, 1 chart + table in second row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Changed to 3 columns on large screens */}
                {/* Chart 1: Generations Over Time (Area Chart) */}
                <div className="card-bg p-6 rounded-xl shadow-lg border card-border">
                    <h2 className="text-xl font-bold text-primary-color mb-4">Transcription Generations Over Time</h2>
                    <p className="text-secondary-color text-sm mb-4">This chart shows the daily count of transcription generations, allowing you to track usage trends.</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={generationsOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}> {/* Changed to AreaChart */}
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'var(--color-table-border)' : 'var(--color-table-border)'} />
                            <XAxis dataKey="date" tick={{ fill: theme === 'dark' ? 'var(--color-table-text)' : 'var(--color-table-text)' }} />
                            <YAxis tick={{ fill: theme === 'dark' ? 'var(--color-table-text)' : 'var(--color-table-text)' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: theme === 'dark' ? 'var(--color-table-text)' : 'var(--color-table-text)' }} />
                            <Area type="monotone" dataKey="count" stroke="#00B3EEFF" fill="#07FFF7FF" fillOpacity={0.3} name="Transcriptions" /> {/* Changed to Area */}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart 2: File Type Distribution (Pie Chart) */}
                <div className="card-bg p-6 rounded-xl shadow-lg border card-border">
                    <h2 className="text-xl font-bold text-primary-color mb-4">File Type Distribution</h2>
                    <p className="text-secondary-color text-sm mb-2">This pie chart illustrates the distribution of transcription files based on their MIME type. Click on a slice to view details for that file type.</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={fileTypeDistribution}
                                cx="50%"
                                cy="50%"
                                outerRadius={90} // Increased outerRadius for more space
                                fill="#E455FAFF"
                                dataKey="value"
                                labelLine={true} // Enabled labelLine for better spacing and connection
                              
                                onClick={handlePieSliceClick}
                            >
                                {fileTypeDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: theme === 'dark' ? 'var(--color-table-text)' : 'var(--color-table-text)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart 3: Word Count Trends (Bar Chart - Dummy Data) */}
                <div className="card-bg p-6 rounded-xl shadow-lg border card-border">
                    <h2 className="text-xl font-bold text-primary-color mb-4">Simulated Word Count Trends</h2>
                    <p className="text-secondary-color text-sm mb-4">This bar chart displays hypothetical word count trends, illustrating potential analytics that could be integrated.</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dummyWordCountData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'var(--color-table-border)' : 'var(--color-table-border)'} />
                            <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? 'var(--color-table-text)' : 'var(--color-table-text)' }} />
                            <YAxis tick={{ fill: theme === 'dark' ? 'var(--color-table-text)' : 'var(--color-table-text)' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: theme === 'dark' ? 'var(--color-table-text)' : 'var(--color-table-text)' }} />
                            <Bar dataKey="Word Count" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Second row for the remaining chart and the table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4"> {/* Two columns in the second row */}
                {/* Chart 4: Sentiment Analysis (Scatter Chart - Dummy Data) */}
                <div className="card-bg p-6 rounded-xl shadow-lg border card-border">
                    <h2 className="text-xl font-bold text-primary-color mb-4">Simulated Sentiment Analysis</h2>
                    <p className="text-secondary-color text-sm mb-4">This scatter chart represents a simulated sentiment analysis, demonstrating how sentiment scores might correlate with word counts.</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'var(--color-table-border)' : 'var(--color-table-border)'} />
                            <XAxis type="number" dataKey="x" name="Word Count" tick={{ fill: theme === 'dark' ? 'var(--color-table-text)' : 'var(--color-table-text)' }} />
                            <YAxis type="number" dataKey="y" name="Sentiment Score" unit="" tick={{ fill: theme === 'dark' ? 'var(--color-table-text)' : 'var(--color-table-text)' }} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: theme === 'dark' ? 'var(--color-table-text)' : 'var(--color-table-text)' }} />
                            <Scatter name="Sentiment Data" data={dummySentimentData} fill="#ffc658" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                {/* Conditional: Details Table for Selected File Type */}
                {selectedFileType && (
                    <div className="card-bg p-6 rounded-xl shadow-lg border card-border">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-primary-color">Details for "{selectedFileType}" Files</h2>
                            {/* [NEW] Expand/Collapse button for the table */}
                            <button
                                onClick={toggleTableVisibility}
                                className="btn-secondary py-1 px-3 rounded-lg flex items-center text-sm font-medium"
                            >
                                {isTableExpanded ? (
                                    <>
                                        <ChevronUp size={16} className="mr-1" /> Collapse Table
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={16} className="mr-1" /> Expand Table
                                    </>
                                )}
                            </button>
                        </div>
                        {isTableExpanded && ( // [NEW] Conditional rendering based on isTableExpanded
                            filteredTranscriptions.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border table-border"> {/* Added table-border */}
                                    <table className="min-w-full divide-y table-border-separate"> {/* Added table-border-separate */}
                                        <thead className="table-header-bg"> {/* Replaced bg-gray-50 */}
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium table-header-text uppercase tracking-wider"> {/* Replaced text-gray-500 */}
                                                    File Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium table-header-text uppercase tracking-wider"> {/* Replaced text-gray-500 */}
                                                    Transcript Output
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium table-header-text uppercase tracking-wider"> {/* Replaced text-gray-500 */}
                                                    Generated At
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="table-body-bg divide-y table-border-separate"> {/* Replaced bg-white and divide-gray */}
                                            {filteredTranscriptions.map((item, index) => (
                                                <tr key={index} className="table-row-hover"> {/* Added table-row-hover */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm table-cell-text-primary">
                                                        {item.file_name || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm table-cell-text-secondary">
                                                        {/* Truncate and add Read More */}
                                                        {item.transcript_output && item.transcript_output.length > TRANSCRIPT_TRUNCATE_LIMIT ? (
                                                            <>
                                                                {truncateText(item.transcript_output, TRANSCRIPT_TRUNCATE_LIMIT)}
                                                                <button
                                                                    onClick={() => handleReadMoreClick(item.transcript_output)}
                                                                    className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium inline-flex items-center text-xs"
                                                                    title="Read More"
                                                                >
                                                                    <BookOpen size={14} className="mr-1" /> Read More
                                                                </button>
                                                            </>
                                                        ) : (
                                                            item.transcript_output || 'No output'
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm table-cell-text-primary">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-secondary-color">No detailed data available for this file type.</p>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* Full Transcript Modal */}
            <TranscriptModal
                isOpen={isTranscriptModalOpen}
                onClose={() => setIsTranscriptModalOpen(false)}
                content={currentTranscriptContent}
            />
        </div>
    );
};

export default AnalyticsPage;