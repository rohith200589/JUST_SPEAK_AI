// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Import your page components
import HomePage from './pages/Homepage';
import SEO, { DashboardProvider } from './pages/SEO';
import TranscriptPage from './pages/Transcript';
import PostPage from './pages/Post';
import MainLayout from './components/MainLayout';
import ToasterProvider from './components/Toaster';
import ServerStatusChecker from './components/ServerStatusChecker';
import Mindmap from './pages/mindmap';
import AnalyticsPage from './pages/SupportPages/AnalyticsPage';
import SettingsPage from './pages/SupportPages/SettingsPage';
import ProfilePage from './pages/SupportPages/profilepage';
import HelpAndSupportPage from './pages/SupportPages/helpandSupport';
import SEO2 from './components/seo_2';
import TranscriptHistory from './components/transcript/TranscriptHistory';
import Mark from './Mark';

// Import ThemeProvider from its correct, central location
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const navigate = useNavigate();

  const [transcriptHistory, setTranscriptHistory] = useState(() => {
    try {
      const storedHistory = localStorage.getItem('transcriptHistory');
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error("Failed to parse transcript history from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('transcriptHistory', JSON.stringify(transcriptHistory));
    } catch (error) {
      console.error("Failed to save transcript history to localStorage:", error);
    }
  }, [transcriptHistory]);

  const onLoadHistoryItem = useCallback((item) => {
    navigate('/transcript/view', {
      state: {
        transcriptContent: item.transcriptContent,
        transcriptTimestamps: item.transcriptTimestamps || [],
        summaryContent: item.summaryContent || '',
        analysis: item.analysis || null,
        insights: item.insights || null,
        youtubeVideoId: item.source === 'youtube' ? item.title : '',
        videoUrl: item.source === 'youtube' ? `https://www.youtube.com/watch?v=${item.title}` : '',
        uploadedFile: item.source.includes('File') ? { name: item.title, type: item.fileMimeType || '' } : null,
        fromHistory: true
      }
    });
  }, [navigate]);

  return (
    <ThemeProvider>
      <DashboardProvider transcriptHistory={transcriptHistory} setTranscriptHistory={setTranscriptHistory}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<MainLayout />}>
            <Route path="/seo" element={<Navigate to="/seo/chat" replace />} />
            <Route path="/seo/dashboard" element={<SEO />} />
            <Route path="/seo/chat" element={<SEO />} />
            <Route path="/seo/chat/main" element={<SEO />} />

            {/* Transcript Routes - No theme props passed here */}
            <Route
              path="/transcript/upload"
              element={<TranscriptPage
                transcriptHistory={transcriptHistory}
                setTranscriptHistory={setTranscriptHistory}
              />}
            />
            <Route
              path="/transcript/view"
              element={<TranscriptPage
                transcriptHistory={transcriptHistory}
                setTranscriptHistory={setTranscriptHistory}
              />}
            />

            <Route
              path="/transcript/history"
              element={<TranscriptHistory
                transcriptHistory={transcriptHistory}
                setTranscriptHistory={setTranscriptHistory}
                navigate={navigate}
                onLoadHistoryItem={onLoadHistoryItem}
              />}
            />

            <Route path="/transcribe" element={<Navigate to="/transcript/upload" replace />} />
            <Route path="/transcript/script" element={<Navigate to="/transcript/view" replace />} />

            <Route path="/visualizer" element={<Mindmap />} />
            <Route path="/generate-post" element={<Navigate to="/generate-post/welcome" replace />} />
            <Route path="/generate-post/welcome" element={<PostPage transcriptHistory={transcriptHistory} />} />
            <Route path="/generate-post/generate" element={<PostPage transcriptHistory={transcriptHistory} />} />

            <Route path="/transcribe/insights" element={<AnalyticsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help-support" element={<HelpAndSupportPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/seo2" element={<SEO2 />} />
          </Route>
          <Route path="/generate-post/chat" element={<Navigate to="/generate-post/generate" replace />} />
          <Route path="/mark" element={<Mark />} />
        </Routes>
      </DashboardProvider>
    </ThemeProvider>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <ToasterProvider>
        <ServerStatusChecker />
        <App />
      </ToasterProvider>
    </Router>
  );
}