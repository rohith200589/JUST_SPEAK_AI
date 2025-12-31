// src/HistoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext'; // Assuming ThemeContext is in src/context/ThemeContext.js

// Setup Supabase Client (make sure these match your project's credentials)
const supabaseUrl = 'https://dpaoeuzsnswflnvzgilg.supabase.co'; // Replace with your actual Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYW9ldXpzbnN3ZmxudnpnaWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjYwNzUsImV4cCI6MjA2NjQwMjA3NX0.n99iuDKnH9ToisD024kSzTWXkVHCGsfN1p6MttqjuBA'; // Replace with your actual Supabase Anon Key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const HistoryPage = () => {
    const { theme } = useTheme();
    const [transcriptions, setTranscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    const fetchTranscriptions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all columns, including 'file_name' and 'file_mime_type' for comprehensive display
            const { data, error: fetchError } = await supabase
                .from('transcriptions')
                .select('id, input_type, input_value, transcript_output, file_name, file_mime_type, created_at')
                .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

            if (fetchError) {
                console.error("Error fetching transcriptions:", fetchError);
                setError("Failed to load transcriptions: " + fetchError.message);
            } else {
                setTranscriptions(data || []);
            }
        } catch (err) {
            console.error("Unexpected error fetching transcriptions:", err);
            setError("An unexpected error occurred: " + err.message);
        } finally {
            setLoading(false);
        }
    }, [sortConfig]); // Re-fetch when sort config changes

    useEffect(() => {
        fetchTranscriptions();
    }, [fetchTranscriptions]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const TruncatedText = ({ text, maxLength = 50 }) => {
        const [isHovered, setIsHovered] = useState(false);
        const display = text.length > maxLength && !isHovered ? `${text.substring(0, maxLength / 2)}...${text.substring(text.length - maxLength / 2)}` : text;

        return (
            <span
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="cursor-help"
                title={text} // Show full text on native tooltip
            >
                {display}
            </span>
        );
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return null;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    };

    return (
        <div className={`min-h-screen p-8 ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-gray-100'}`}>
            <div className={`container mx-auto p-6 rounded-xl shadow-2xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h1 className="text-3xl font-bold mb-8 text-center">Transcription History</h1>

                {loading && (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="animate-spin text-blue-500 mr-3" size={36} />
                        <span className="text-xl">Loading transcriptions...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {!loading && !error && transcriptions.length === 0 && (
                    <div className="text-center py-10 text-xl text-gray-500">
                        No transcriptions found. Start transcribing some content!
                    </div>
                )}

                {!loading && !error && transcriptions.length > 0 && (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                                        onClick={() => requestSort('input_value')}
                                    >
                                        <div className="flex items-center">
                                            Input (URL/File) {getSortIcon('input_value')}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                                        onClick={() => requestSort('transcript_output')}
                                    >
                                        <div className="flex items-center">
                                            Transcription Content {getSortIcon('transcript_output')}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                                        onClick={() => requestSort('input_type')}
                                    >
                                        <div className="flex items-center">
                                            Type {getSortIcon('input_type')}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                                        onClick={() => requestSort('created_at')}
                                    >
                                        <div className="flex items-center">
                                            Created At {getSortIcon('created_at')}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {transcriptions.map((transcription) => (
                                    <tr key={transcription.id} className="hover:bg-gray-700 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-300">
                                            {transcription.input_type === 'youtube' ? (
                                                <a href={transcription.input_value} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    <TruncatedText text={transcription.input_value} maxLength={40} />
                                                </a>
                                            ) : (
                                                <TruncatedText text={transcription.file_name || transcription.input_value} maxLength={40} />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            <TruncatedText text={transcription.transcript_output} maxLength={60} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {transcription.input_type === 'file' ? transcription.file_mime_type : transcription.input_type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {new Date(transcription.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;