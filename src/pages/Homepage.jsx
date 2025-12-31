// src/Home.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Sparkles, BarChart, Users, MessageSquare, Briefcase, ChevronRight, Sun, Moon, Headphones,
    UploadCloud, Edit3, Share2, Menu, X,
    Instagram, Linkedin, Twitter, Target, Heart,
    Image, Film, Lightbulb, TrendingUp, User, Settings, LogOut, Mic,
    Mic2, MicVocalIcon, PodcastIcon, Podcast, MicroscopeIcon, MicVocal, LucidePodcast, LucideReceiptPoundSterling
} from 'lucide-react';
import { useNavigate, Link } from "react-router-dom"; // Link is now directly used
import { useTheme } from '../context/ThemeContext'; // Import the useTheme hook
import "../index.css"; // Import your CSS file for styles
import HeroSVG from '../components/Home/HeroSVG'; // Corrected path
// Removed: import { useAuth } from '../context/AuthContext';
// Removed: import { toast, ToastContainer } from 'react-toastify';
// Removed: import 'react-toastify/dist/ReactToastify.css';

const Homepage = () => {
    // Use theme from context instead of local state
    const { theme, toggleTheme } = useTheme();
    const [isClicked, setIsClicked] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const navigate = useNavigate();
    // Removed: const {signOut, user, loading: authLoading } = useAuth(); // No longer needed

    const handleClick = () => {
        // Updated to navigate to the app's transcribe page as a starting point
        navigate("/transcribe");
    };

    // --- SVG Dimension and Centering Calculations ---
    const svgWidth = 450;
    const svgHeight = 400;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const micInternalCenterX = 70;
    const micInternalCenterY = 75;
    const micTranslateX = centerX - micInternalCenterX;
    const micTranslateY = centerY - micInternalCenterY;

    // Refs for scrolling to sections
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const pricingRef = useRef(null);
    const howItWorksRef = useRef(null);
    const contactRef = useRef(null);

    const profileDropdownRef = useRef(null);
    const mobileNavRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
            if (mobileNavRef.current && !mobileNavRef.current.contains(event.target) && event.target.tagName !== 'BUTTON') {
                const isHamburgerClick = event.target.closest('[aria-label="Toggle navigation"]');
                if (!isHamburgerClick) {
                    setIsNavOpen(false);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Function to scroll to a section
    const scrollToSection = (ref) => {
        if (ref && ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsNavOpen(false); // Close mobile nav after clicking a link
        }
    };

    // Removed: handleLogout function is no longer needed

    // Function to handle SVG click animation
    const handleSvgClick = () => {
        setIsClicked(true);
        setTimeout(() => {
            setIsClicked(false);
        }, 800); // Duration of the animation
    };

    const features = [
        {
            icon: <Sparkles size={40} />,
            title: "AI-Powered Content Generation",
            description: "Generate high-quality articles, social media posts, and more with advanced AI.",
            path: "/app/post", // Placeholder, adjust as needed
        },
        {
            icon: <Headphones size={40} />,
            title: "Audio & Video Transcription",
            description: "Convert audio and video content into accurate, editable text transcripts.",
            path: "/transcribe", // Link to your Transcript page
        },
        {
            icon: <BarChart size={40} />,
            title: "SEO Keyword Optimization",
            description: "Identify and integrate powerful keywords to boost your content's search ranking.",
            path: "/seo", // Link to your SEO page
        },
        {
            icon: <MessageSquare size={40} />,
            title: "NLP Text Modification",
            description: "Refine and rephrase your content with natural language processing tools.",
            path: "/app/post", // Placeholder, adjust as needed
        },
        {
            icon: <Users size={40} />,
            title: "AI Visual Flow Builder",
            description: "Transform summaries into mind maps and flowcharts using a chat-driven interface.",
            path: "/visual-flow-builder", // Placeholder, adjust as needed
        },
        {
            icon: <Briefcase size={40} />,
            title: "Multi-Platform Syndication",
            description: "Effortlessly adapt and publish content across various social media channels.",
            path: "/multi-platform", // Placeholder, adjust as needed
        },
    ];

    const howItWorksSteps = [
        {
            icon: <UploadCloud size={40} />,
            title: "1. Upload Content",
            description: "Start by uploading your audio, video, or text documents. We support various formats.",
        },
        {
            icon: <Sparkles size={40} />,
            title: "2. Generate & Refine",
            description: "Leverage AI to generate transcripts, analyze SEO keywords, and create diverse content.",
        },
        {
            icon: <Share2 size={40} />,
            title: "3. Publish & Share",
            description: "Easily export and share your optimized content across all your preferred platforms.",
        },
    ];

    const supportedPlatforms = [
        { icon: <Instagram size={48} />, name: "Instagram" },
        { icon: <Linkedin size={48} />, name: "LinkedIn" },
        { icon: <Twitter size={48} />, name: "Twitter/X" },
        { icon: <Target size={48} />, name: "Threads" },
        { icon: <Film size={48} />, name: "TikTok" },
    ];

    const templates = [
        { icon: <Lightbulb size={40} />, title: "Business Tips", description: "Concise advice for entrepreneurs." },
        { icon: <Image size={40} />, title: "Memes", description: "Engaging visual content for social media." },
        { icon: <Film size={40} />, title: "Reels Scripts", description: "Short video scripts for dynamic content." },
        { icon: <TrendingUp size={40} />, title: "Trend Analysis", description: "Content based on current popular trends." },
        { icon: <MessageSquare size={40} />, title: "Q&A Posts", description: "Interactive question and answer formats." },
        { icon: <Briefcase size={40} />, title: "Case Studies", description: "Detailed success stories and analyses." },
    ];

    const faqs = [
        {
            question: "Can I export generated content as image/video?",
            answer: "Currently, our platform primarily focuses on text generation and optimization. Image/video export features are on our roadmap for future updates."
        },
        {
            question: "Is the generated content copyright-free?",
            answer: "Yes, all content generated by our AI is original and copyright-free for your use. However, we recommend reviewing any specific platform's terms of service."
        },
        {
            question: "Do I need an account to use the service?",
            answer: "While you can explore some features without an account, a free account is required to save your work, access advanced features, and publish content."
        },
        {
            question: "What languages does the AI support?",
            answer: "Our AI supports content generation and transcription in over 9 Indian languages including English. You can select your preferred language in the generation parameters."
        },
    ];

    return (
        <div className="min-h-screen theme-bg-gradient font-sans text-primary-color">
            {/* Header */}
            <header className="py-4 px-4 sm:px-6 header-bg shadow-sm border-b border-color flex justify-between items-center relative z-20">
                {/* Left Section - Logo */}
                <div className="flex items-center">
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none px-5">
                        <span className={`font-extrabold uppercase ${theme === 'light' ? 'text-black' : 'text-gray-100'}`} style={{ fontFamily: '"Montserrat", sans-serif' }}>
                            Just
                        </span>
                        {/* Podcast icon color conditional on theme */}
                        <Podcast size={28} className={`inline ml-1 ${theme === 'light' ? 'podcast-icon-light' : 'podcast-icon-dark'}`} />
                        <span className={`font-extrabold uppercase ${theme === 'light' ? 'text-black' : 'text-gray-100'}`} style={{ fontFamily: '"Montserrat", sans-serif' }}>
                            Speak
                        </span>
                    </h1>
                </div>

                {/* Right Section - Navigation + Controls */}
                <div className="flex items-center space-x-4">
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-6">
                        <a onClick={() => scrollToSection(featuresRef)} className="font-medium text-base nav-link-text nav-link-hover-text transition-colors duration-200 cursor-pointer">Explore</a>

                        <a onClick={() => scrollToSection(contactRef)} className="font-medium text-base nav-link-text nav-link-hover-text transition-colors duration-200 cursor-pointer">Contact</a>
                    </nav>
                    {/* Removed conditional Sign Up button: !authLoading && !user */}


                    {/* Theme Toggle, Profile & Hamburger */}
                    <div className="flex items-center space-x-4 relative" ref={profileDropdownRef}>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full card-bg text-primary-color hover:border-color transition-colors duration-200"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Profile Dropdown - Simplified or removed if not needed without authentication */}
                        {/* Keeping a placeholder for general user actions if desired, but removed auth-specific items */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="p-2 rounded-full card-bg text-primary-color hover:border-color transition-colors duration-200"
                                title="User Profile"
                            >
                                <User size={20} />
                            </button>
                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 dropdown-bg rounded-md shadow-lg py-1 z-10 border dropdown-border">
                                    <a href="#" className="flex items-center px-4 py-2 text-sm dropdown-text dropdown-hover-bg">
                                        <User size={16} className="mr-2" /> Profile
                                    </a>
                                    <a href="#" className="flex items-center px-4 py-2 text-sm dropdown-text dropdown-hover-bg">
                                        <Settings size={16} className="mr-2" /> Settings
                                    </a>
                                    {/* Removed Logout button if no authentication */}
                                </div>
                            )}
                        </div>

                        {/* Hamburger Icon for Mobile */}
                        <button
                            onClick={() => setIsNavOpen(!isNavOpen)}
                            className="p-2 rounded-full md:hidden card-bg text-primary-color hover:border-color transition-colors duration-200"
                            aria-label="Toggle navigation"
                        >
                            {isNavOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isNavOpen && (
                    <div ref={mobileNavRef} className="absolute top-full left-0 w-full header-bg border-t border-color md:hidden shadow-lg py-4 px-4 z-10">
                        <nav className="flex flex-col space-y-4">
                            <a onClick={() => scrollToSection(heroRef)} className="font-medium text-lg nav-link-text nav-link-hover-text transition-colors duration-200 cursor-pointer">Home</a>
                            <a onClick={() => scrollToSection(featuresRef)} className="font-medium text-lg nav-link-text nav-link-hover-text transition-colors duration-200 cursor-pointer">Features</a>
                            <a onClick={() => scrollToSection(pricingRef)} className="font-medium text-lg nav-link-text nav-link-hover-text transition-colors duration-200 cursor-pointer">Pricing</a>
                            <a onClick={() => scrollToSection(contactRef)} className="font-medium text-lg nav-link-text nav-link-hover-text transition-colors duration-200 cursor-pointer">Contact</a>
                            <button
                                onClick={() => navigate('/login')} // Mobile Sign Up / Login
                                className="btn-primary-gradient btn-primary-text px-4 py-2 rounded-lg font-semibold text-base shadow-md hover:opacity-90 transition-all duration-300 w-full mt-4"
                            >
                                Sign Up / Login
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative py-1 px-4 md:py-30 flex flex-col md:flex-row items-center  md:justify-between max-w-7xl mx-auto">
                {/* Left side: Text and CTA */}
                <div className=" text-center md:text-left mb-12 md:mb-0"> {/* Approx 41.6% */}
                    <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-primary-color fontFamily-sans">
                        <br className="sm:hidden" />
                        <span className="chat-gradient-highlight -ml-10">
                            “Text, Links, or Files”
                        </span>


                        <br />
                        We turn anything into polished Sharable Content
                    </h2>
                    <p className="text-lg md:text-xl max-w-xl mb-8 text-secondary-color">
                        Effortlessly generate, optimize, and distribute engaging content for all your digital platforms.
                    </p>
                    <button
                        onClick={handleClick}
                        className="btn-primary-gradient btn-primary-text px-8 py-3 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-transform duration-300"
                    >
                        Start Creating Now <ChevronRight className="inline-block ml-2" size={20} />
                    </button>
                </div>


                <HeroSVG />
            </section>
            {/* Our Expertise Section (renamed/repurposed to be 'Features') */}
            <section ref={featuresRef} id="features" className="py-16 px-4 section-bg rounded-xl shadow-inner mt-12 border border-color">
                <div className="max-w-7xl mx-auto text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 text-primary-color">Our Core Features</h3>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 text-secondary-color">
                        Achieving Results Through Customized Solutions.
                    </p>


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="p-8 card-bg rounded-xl shadow-lg flex flex-col items-center text-center transition-transform duration-300">
                                {/* The icon-color class has been removed. A hardcoded white color class is now used. */}
                                <div className="p-4 rounded-full feature-icon-bg-gradient mb-6 text-white">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold mb-3 feature-text-color">{feature.title}</h4>
                                <p className="text-base text-secondary-color">{feature.description}</p>
                            </div>
                        ))}
                    </div>


                    <div className="mt-12">
                        <button
                            onClick={handleClick}
                            className="btn-primary-gradient btn-primary-text px-8 py-3 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-transform duration-300"
                        >
                            Explore All Features <ChevronRight className="inline-block ml-2" size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section ref={howItWorksRef} id="how-it-works" className="py-16 px-4 section-bg rounded-xl shadow-inner mt-12 border border-color">
                <div className="max-w-7xl mx-auto text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 text-primary-color">How It Works</h3>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 text-secondary-color">
                        Simple steps to unleash your content's potential.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {howItWorksSteps.map((step, index) => (
                            <div key={index} className="p-8 card-bg rounded-xl shadow-lg  flex flex-col items-center text-center">
                                <div className="p-4 rounded-full feature-icon-bg-gradient mb-6 text-white">
                                    {step.icon}
                                </div>
                                <h4 className="text-xl font-bold mb-3 card-text">{step.title}</h4>
                                <p className="text-base text-secondary-color">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Supported Platforms Section */}
            <section className="py-16 px-4 section-bg rounded-xl shadow-inner mt-12 border border-color">
                <div className="max-w-7xl mx-auto text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 text-primary-color">Supported Platforms</h3>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 text-secondary-color">
                        Seamlessly integrate and publish to your favorite social media channels.
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        {supportedPlatforms.map((platform, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className="p-3 rounded-full feature-icon-bg-gradient mb-2 text-white">
                                    {platform.icon}
                                </div>
                                <p className="text-base font-semibold card-text">{platform.name}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-8 text-sm text-secondary-color">
                        Optimized for each platform's algorithm and format
                    </p>
                </div>
            </section>

            {/* Templates Gallery Section */}
            <section className="py-16 px-4 section-bg rounded-xl shadow-inner mt-12 border border-color">
                <div className="max-w-7xl mx-auto text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 text-primary-color">Templates Gallery</h3>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 text-secondary-color">
                        Explore diverse content styles to spark your creativity.
                    </p>
                    <div className="flex overflow-x-auto gap-8 py-4 px-2 no-scrollbar">
                        {templates.map((template, index) => (
                            <div key={index} className="flex-shrink-0 w-64 p-6 card-bg rounded-xl shadow-lg flex flex-col items-center text-center">
                                <div className="p-3 rounded-full feature-icon-bg-gradient mb-4 text-white">
                                    {template.icon}
                                </div>
                                <h4 className="text-xl font-bold mb-2 card-text">{template.title}</h4>
                                <p className="text-sm text-secondary-color">{template.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4 section-bg rounded-xl shadow-inner-2xl mt-12 ">
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-3xl md:text-4xl font-bold mb-12 text-center text-primary-color">Frequently Asked Questions</h3>
                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="p-6 card-bg rounded-lg shadow-md ">
                                <h4 className="text-lg font-semibold mb-2 card-text">{faq.question}</h4>
                                <p className="text-base text-secondary-color">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer
                ref={contactRef}
                id="contact"
                className="mt-12 py-12 section-bg rounded-t-xl border-t border-color"
            >
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
                    {/* Brand section */}
                    <div>
                        <h3 className="text-xl font-bold text-primary-color mb-2">JustSpeak</h3>
                        <p className="text-secondary-color text-sm">
                            Transforming your voice and files into powerful content effortlessly. AI-driven, fast, and secure.
                        </p>
                        <div className="flex space-x-4 mt-4">
                            <a href="#" className="hover:text-blue-600" aria-label="Facebook">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.5 9.95v-7.05H8v-2.9h2.5V9.7c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.7-1.6 1.5v1.8H17l-.4 2.9h-2.6v7A10 10 0 0022 12z" /></svg>
                            </a>
                            <a href="#" className="hover:text-blue-400" aria-label="Twitter">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.34-1.6.57-2.46.68.88-.53 1.56-1.37 1.88-2.37-.8.48-1.68.81-2.6 1-.76-.8-1.84-1.3-3.04-1.3-2.3 0-4.17 1.87-4.17 4.17 0 .33.03.65.09.96C7.38 10.3 4.17 8.52 2.05 5.5c-.35.6-.55 1.3-.55 2.07 0 1.45.74 2.73 1.88 3.48-.68-.02-1.32-.2-1.88-.52v.05c0 2.03 1.44 3.72 3.36 4.1-.35.09-.72.14-1.1.14-.27 0-.53-.03-.79-.08.56 1.7 2.19 2.92 4.12 2.95C14.07 18.27 10.02 19 5.86 19c-.77 0-1.53-.05-2.28-.15.93.96 2.22 1.52 3.68 1.52 4.4 0 7.85-3.64 7.85-8.15 0-.12 0-.24-.01-.36.9-.66 1.66-1.48 2.27-2.42z" /></svg>
                            </a>
                            <a href="#" className="hover:text-pink-500" aria-label="Instagram">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2c1.7 0 3 1.3 3 3a3 3 0 01-3 3 3 3 0 01-3-3c0-1.7 1.3-3 3-3zm4.5-1a1 1 0 110 2 1 1 0 010-2z" /></svg>
                            </a>
                            <a href="#" className="hover:text-blue-700" aria-label="LinkedIn">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM4 8.98h2v12H4v-12zm4 0h1.91v1.56h.03c.27-.5.94-1.04 1.94-1.04 2.07 0 2.45 1.35 2.45 3.11v5.37h-2v-4.75c0-1.13-.02-2.58-1.57-2.58-1.57 0-1.81 1.23-1.81 2.5v4.83H8v-12z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Links column 1 */}
                    <div>
                        <h4 className="text-md font-semibold mb-3">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:underline">Features</a></li>
                            <li><a href="#" className="hover:underline">Pricing</a></li>
                            <li><a href="#" className="hover:underline">Integrations</a></li>
                            <li><a href="#" className="hover:underline">Roadmap</a></li>
                        </ul>
                    </div>

                    {/* Links column 2 */}
                    <div>
                        <h4 className="text-md font-semibold mb-3">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:underline">About Us</a></li>
                            <li><a href="#" className="hover:underline">Careers</a></li>
                            <li><a href="#" className="hover:underline">Press</a></li>
                            <li><a href="#" className="hover:underline">Contact</a></li>
                        </ul>
                    </div>

                    {/* Links column 3 */}
                    <div>
                        <h4 className="text-md font-semibold mb-3">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:underline">Help Center</a></li>
                            <li><a href="#" className="hover:underline">Blog</a></li>
                            <li><a href="#" className="hover:underline">Guides</a></li>
                            <li><a href="#" className="hover:underline">Community</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t border-color pt-6 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} JustSpeak. All rights reserved.
                </div>
            </footer>

        </div>
    );
};

export default Homepage;