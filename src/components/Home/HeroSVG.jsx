// src/components/common/HeroAnimationSVG.jsx
import React, { useState, useCallback, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const HeroSVG = () => {
    const { theme } = useContext(ThemeContext);

    const svgWidth = 450;
    const svgHeight = 400;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const micInternalCenterX = 70;
    const micInternalCenterY = 75;
    const micTranslateX = centerX - micInternalCenterX;
    const micTranslateY = centerY - micInternalCenterY;

    const [isClicked, setIsClicked] = useState(false);

    const handleSvgClick = useCallback(() => {
        setIsClicked(true);
        setTimeout(() => {
            setIsClicked(false);
        }, 800);
    }, []);

    const localThemeColors = {
        light: {
            accentPrimary: '#8B5CF6',
            accentPrimaryHover: '#2563EB',
            textPrimary: '#ffffffff',
            textSecondary: '#ffffffff',
            postGradientFrom: '#946febff',
            postGradientTo: '#4478e6ff',
        },
        dark: {
            accentPrimary: '#4b77fbff',
            accentPrimaryHover: '#18a0e5ff',
            textPrimary: '#ffffffff',
            textSecondary: '#ffffffff',
            postGradientFrom: '#0ea5e9',
            postGradientTo: '#2666ccff',
        },
    };

    const colors = localThemeColors[theme] || localThemeColors.dark;

    // Define gradients based on the current theme
    const mainGradientFrom = colors.accentPrimary;
    const mainGradientTo = colors.accentPrimaryHover;

    const postGradientFrom = colors.postGradientFrom;
    const postGradientTo = colors.postGradientTo;
    
    return (
        <div className="md:w-1/2 flex justify-center items-center" onClick={handleSvgClick}>
            <svg
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* Main Gradient */}
                    <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={mainGradientFrom} />
                        <stop offset="100%" stopColor={mainGradientTo} />
                    </linearGradient>

                    {/* Post Gradient for Blog Posts */}
                    <linearGradient id="postGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={postGradientFrom} />
                        <stop offset="100%" stopColor={postGradientTo} />
                    </linearGradient>

                    {/* Social Media Icons Definitions - Keep hardcoded for brand color accuracy */}
                    <g id="instagram-icon">
                        <rect width="18" height="18" rx="4" fill="#E1306C" />
                        <circle cx="9" cy="9" r="3.5" fill="white" />
                        <circle cx="14" cy="4" r="1.5" fill="white" />
                    </g>
                    <g id="twitter-icon">
                        <path
                            d="M18 4.09C17.37 4.36 16.69 4.54 16 4.63C16.71 4.2 17.26 3.51 17.5 2.69C16.83 3.09 16.1 3.39 15.32 3.55C14.68 2.86 13.79 2.41 12.8 2.41C10.82 2.41 9.22 4.01 9.22 5.99C9.22 6.27 9.25 6.54 9.32 6.81C6.44 6.67 3.84 5.31 2.06 2.94C1.76 3.44 1.58 4.02 1.58 4.64C1.58 5.75 2.15 6.74 3.03 7.3C2.5 7.28 1.98 7.13 1.51 6.88C1.51 6.89 1.51 6.89 1.51 6.9C1.51 8.65 2.76 10.12 4.41 10.45C4.15 10.52 3.88 10.55 3.61 10.55C3.42 10.55 3.23 10.53 3.04 10.49C3.52 11.96 4.88 13.01 6.5 13.04C5.22 14.02 3.59 14.61 1.83 14.61C1.27 14.61 0.73 14.58 0.2 14.51C1.88 15.68 3.91 16.36 6.13 16.36C12.82 16.36 16.48 10.66 16.48 5.75C16.48 5.59 16.48 5.43 16.47 5.27C17.18 4.79 17.65 4.4 18 4.09Z"
                            fill="#1DA1F2"
                        />
                    </g>
                    <g id="facebook-icon">
                        <path
                            d="M17.633 0H0.367C0.164 0 0 0.164 0 0.367V17.633C0 17.836 0.164 18 0.367 18H9.689V11.082H7.262V8.406H9.689V6.447C9.689 3.987 11.233 2.617 13.387 2.617C14.411 2.617 15.267 2.695 15.545 2.735V5.158L14.285 5.159C13.07 5.159 12.823 5.759 12.823 6.64V8.406H15.426L15.006 11.082H12.823V18H17.633C17.836 18 18 17.836 18 17.633V0.367C18 0.164 17.836 0 17.633 0Z"
                            fill="#4267B2"
                        />
                    </g>
                    <g id="youtube-icon">
                        <rect width="20" height="14" rx="3" fill="#FF0000" />
                        <path d="M7.5 4.5L13.5 7.5L7.5 10.5Z" fill="white" />
                    </g>
                    <g id="linkedin-icon">
                        <path
                            d="M18 0H2C0.89 0 0 0.89 0 2V18C0 19.11 0.89 20 2 20H18C19.11 20 20 19.11 20 18V2C20 0.89 19.11 0 18 0ZM6 17H3V8H6V17ZM4.5 6.322C3.52 6.322 2.72 5.56 2.72 4.582C2.72 3.604 3.52 2.842 4.5 2.842C5.48 2.842 6.28 3.604 6.28 4.582C6.28 5.56 5.48 6.322 4.5 6.322ZM17 17H14V11.5C14 10.25 13.52 9.5 12.5 9.5C11.48 9.5 11 10.25 11 11.5V17H8V8H11V9.5C11.66 8.5 12.66 7.82 14 7.82C15.66 7.82 17 9.17 17 11.5V17Z"
                            fill="#0077B5"
                        />
                    </g>
                </defs>

                {/* Group for Static elements: Microphone and Voice Waves */}
                <g className="static-elements-group" transform={`translate(${micTranslateX}, ${micTranslateY})`}>
                    {/* Microphone (realistic) */}
                    <g className="microphone-content">
                        <g fill="url(#mainGradient)">
                            <path d="M70 140 C 70 120, 80 110, 100 110 L 100 40 C 100 20, 90 10, 70 10 C 50 10, 40 20, 40 40 L 40 110 C 60 110, 70 120, 70 140 Z" />
                            <rect x="35" y="140" width="70" height="10" />
                            <rect x="55" y="150" width="30" height="20" rx="5" />
                        </g>
                        <path
                            d="M60 30 L 80 30 M 50 50 L 90 50 M 60 70 L 80 70 M 50 90 L 90 90"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </g>

                    {/* Voice Waves */}
                    <path
                        d="M120 70 C 150 50, 180 50, 210 70 S 240 90, 270 80"
                        stroke="url(#mainGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="voice-wave"
                        strokeDasharray="100 100"
                    />
                    <path
                        d="M120 80 C 150 60, 180 60, 210 80 S 240 100, 270 80"
                        stroke="url(#mainGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="voice-wave"
                        strokeDasharray="100 100"
                        style={{ animationDelay: '0.5s' }}
                    />
                </g>

                {/* Group for Rotating elements: Posts, Scattered Social Media Icons, and Cellular Waves */}
                <g className="rotating-elements-group">
                    {/* Posts (Social Media Style - spread out evenly around the center) */}

                    {/* Post 1: Top-Left quadrant, adjusted for new center */}
                    <g transform={`translate(${centerX - 160}, ${centerY - 130})`}>
                        <g className="post-content">
                            <rect width="90" height="50" fill="url(#mainGradient)" rx="5" />
                            <circle cx="15" cy="15" r="10" fill={colors.textPrimary} />
                            <rect x="30" y="10" width="50" height="10" fill={colors.textSecondary} />
                            <rect x="10" y="30" width="70" height="10" fill={colors.textSecondary} />
                            {/* Cellular Wave 1 */}
                            <path
                                d="M0 25 Q -20 15, -40 25 T -60 25"
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeDasharray="3 3"
                                opacity="0.8"
                                className="cellular-wave"
                            />
                            <path
                                d="M0 35 Q -20 45, -40 35 T -60 35"
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeDasharray="3 3"
                                opacity="0.8"
                                className="cellular-wave"
                            />
                        </g>
                    </g>

                    {/* Post 2: Bottom-Right quadrant, adjusted for new center */}
                    <g transform={`translate(${centerX + 80}, ${centerY + 90})`}>
                        <g className="post-content">
                            <rect width="90" height="50" fill="url(#postGradient)" rx="5" />
                            <circle cx="15" cy="15" r="10" fill={colors.textPrimary} />
                            <rect x="30" y="10" width="50" height="10" fill={colors.textSecondary} />
                            <rect x="10" y="30" width="70" height="10" fill={colors.textSecondary} />
                            {/* Cellular Wave 2 */}
                            <path
                                d="M90 25 Q 110 15, 130 25 T 150 25"
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeDasharray="3 3"
                                opacity="0.8"
                                className="cellular-wave"
                            />
                            <path
                                d="M90 35 Q 110 45, 130 35 T 150 35"
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeDasharray="3 3"
                                opacity="0.8"
                                className="cellular-wave"
                            />
                        </g>
                    </g>

                    {/* Post 3: Right-Middle quadrant, adjusted for new center */}
                    <g transform={`translate(${centerX + 120}, ${centerY - 25})`}>
                        <g className="post-content">
                            <rect width="90" height="50" fill="url(#mainGradient)" rx="5" />
                            <circle cx="15" cy="15" r="10" fill={colors.textPrimary} />
                            <rect x="30" y="10" width="50" height="10" fill={colors.textSecondary} />
                            <rect x="10" y="30" width="70" height="10" fill={colors.textSecondary} />
                            {/* Cellular Wave 3 */}
                            <path
                                d="M45 50 Q 55 70, 45 90 T 45 110"
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeDasharray="3 3"
                                opacity="0.8"
                                className="cellular-wave"
                            />
                            <path
                                d="M55 50 Q 65 70, 55 90 T 55 110"
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeDasharray="3 3"
                                opacity="0.8"
                                className="cellular-wave"
                            />
                        </g>
                    </g>

                    {/* Scattered Social Media Icons (repositioned for wider, even spread) */}
                    <use
                        className="social-icon"
                        href="#instagram-icon"
                        x={centerX - 180}
                        y={centerY - 180}
                        transform="scale(0.8)"
                    />
                    <use
                        className="social-icon"
                        href="#twitter-icon"
                        x={centerX + 160}
                        y={centerY - 180}
                        transform="scale(0.8)"
                    />
                    <use
                        className="social-icon"
                        href="#facebook-icon"
                        x={centerX + 180}
                        y={centerY + 160}
                        transform="scale(0.8)"
                    />
                    <use
                        className="social-icon"
                        href="#youtube-icon"
                        x={centerX - 200}
                        y={centerY + 160}
                        transform="scale(0.8)"
                    />
                    <use
                        className="social-icon"
                        href="#linkedin-icon"
                        x={centerX - 200}
                        y={centerY - 20}
                        transform="scale(0.8)"
                    />
                    <use
                        className="social-icon"
                        href="#instagram-icon"
                        x={centerX + 200}
                        y={centerY - 20}
                        transform="scale(0.8)"
                    />
                    <use
                        className="social-icon"
                        href="#twitter-icon"
                        x={centerX - 50}
                        y={centerY - 180}
                        transform="scale(0.8)"
                    />
                    <use
                        className="social-icon"
                        href="#youtube-icon"
                        x={centerX + 30}
                        y={centerY - 180}
                        transform="scale(0.8)"
                    />
                    <use
                        className="social-icon"
                        href="#facebook-icon"
                        x={centerX - 50}
                        y={centerY + 160}
                        transform="scale(0.8)"
                    />
                    <use
                        className="social-icon"
                        href="#linkedin-icon"
                        x={centerX + 30}
                        y={centerY + 160}
                        transform="scale(0.8)"
                    />
                </g>
            </svg>
        </div>
    );
};

export default HeroSVG;