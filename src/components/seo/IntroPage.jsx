// src/components/seo/IntroPage.jsx
import React, { useRef } from 'react';
import { FileText, Upload, Headphones, Youtube, ArrowRight, BrainCircuit, TrendingUp, Lightbulb, Users, Rocket, Search, BookOpen, GripVertical, MessageCirclePlus, Target, BarChart } from 'lucide-react';

import { useTheme } from '../../pages/SEO.jsx';

// Internal Common Components
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


// Main Chat Page Component (now acting as the chat guidance landing page)
const IntroPage = React.memo(({ navigate }) => {
    const { theme, themeColors } = useTheme();
    const featuresSectionRef = useRef(null);
    const heroSectionRef = useRef(null);

    const uploadOptions = [
        { name: "Generate From Transcripts", icon: FileText, description: "Extract key SEO insights from audio/video transcripts." },
        { name: "Upload Content Files", icon: Upload, description: "Upload articles, documents, or reports for SEO analysis." },
        { name: "Upload Audio Or Video", icon: Headphones, description: "Transcribe and analyze audio/video files for SEO potential." },
        { name: "Analyze Youtube URL", icon: Youtube, description: "Gain SEO insights directly from YouTube video URLs." },
    ];

    const features = [
        { name: "Real-time Search Volume", icon: Users, description: "Monitor daily keyword search volume for informed strategy." },
        { name: "Keyword Trend Analysis", icon: TrendingUp, description: "Visualize keyword performance and trends over time." },
        { name: "Priority Keyword Management", icon: GripVertical, description: "Organize, prioritize keywords for impactful campaigns." },
        { name: "Platform Performance Insights", icon: Search, description: "Analyze content performance across platforms with detailed trend scores." },
        { name: "Content Discovery", icon: BookOpen, description: "Discover relevant content for new ideas and research." },
        { name: "Keyword Suggestions", icon: Lightbulb, description: "Find high-potential keyword alternatives to expand reach." },
        { name: "Competitor Content Gaps", icon: Target, description: "Identify content gaps in competitor strategies." },
        { name: "SEO Performance Tracking", icon: BarChart, description: "Track your content's SEO performance and ranking changes." },
    ];

    const scrollToFeatures = () => {
        featuresSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const featureIconColors = [
        themeColors.accentPrimaryIcon,
        themeColors.accentPositiveIcon,
        themeColors.accentWarningIcon,
        themeColors.accentNegativeIcon,
        themeColors.purpleAccentIcon,
        themeColors.pinkAccentIcon,
        themeColors.cyanAccentIcon,
        themeColors.orangeAccentIcon
    ];

    return (
        <main className={`flex-1 flex flex-col items-center bg-[var(--bg-default)] text-[var(--text-primary)] relative min-h-screen overflow-hidden`}>
            <section ref={heroSectionRef} className="relative w-full py-20 px-4 text-center bg-[var(--bg-default)] z-0 flex flex-col items-center justify-start">
                <div className="relative z-10 max-w-6xl mx-auto">
                    <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4`}>
                        Win Rankings with
                        <span 
                            style={theme === 'light' ? { background: themeColors.gradientPrimaryHeader, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : { color: themeColors.neoBlueHighlight }}
                        >
                            {' '}Real-Time SEO Analysis
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-12 animate-slide-up">
                        Select an option below to start leveraging AI for powerful SEO insights, content optimization, and search ranking dominance.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-pop-in shadow">
                        {uploadOptions.map((option, index) => (
                            <Card key={index} className="items-center p-6 text-center h-full hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer">
                                <option.icon className={`h-10 w-10`} style={{ color: index === 0 ? themeColors.accentPrimaryIcon : index === 1 ? themeColors.accentPositiveIcon : index === 2 ? themeColors.accentWarningIcon : themeColors.accentNegativeIcon }} />
                                <h3 className="font-semibold text-xl text-[var(--text-primary)] mb-2">{option.name}</h3>
                                <p className="text-[var(--text-secondary)] text-sm">{option.description}</p>
                            </Card>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            className="text-white text-lg font-semibold px-10 py-4 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center gap-2 transform hover:scale-105 animate-pop-in"
                            style={theme === 'light' ? { background: themeColors.gradientPrimary } : { backgroundColor: themeColors.accentPrimary, hover: themeColors.accentPrimaryHover }}
                            onClick={() => navigate('/seo/chat/main')}
                        >
                            Start Analyzing <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </section>

            <section ref={featuresSectionRef} className="py-16 px-4 w-full max-w-7xl">
                <h2 className="text-4xl font-bold text-center mb-12 text-[var(--text-primary)]">
                    Powerful Features Designed For You
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="items-center p-6 text-center h-full hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer">
                            <feature.icon className={`h-10 w-10`} style={{ color: featureIconColors[index] }} />
                            <h3 className="font-semibold text-xl text-[var(--text-primary)] mb-2">{feature.name}</h3>
                            <p className="text-[var(--text-secondary)] text-sm">{feature.description}</p>
                        </Card>
                    ))}
                </div>
            </section>


            <footer className="w-full text-center py-8 border-t border-[var(--border-default)] mt-16 text-[var(--text-muted)] text-sm">
                <p>© {new Date().getFullYear()} AI SEO Assistant. All rights reserved.</p>
            </footer>
        </main>
    );
});

export default IntroPage;