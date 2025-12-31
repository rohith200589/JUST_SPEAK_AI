// src/components/post/GenerationOptions.jsx
import React, { useMemo, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const AdvancedGenerationOptions = ({ onSettingsChange, currentSettings, colors }) => {

  const initialDefaultSettings = useMemo(() => ({
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
  }), []);

  // Initialize parent state with defaults if it's incomplete
  useEffect(() => {
    if (!currentSettings || Object.keys(currentSettings).length <= 1) {
      console.log('Initializing generation options with defaults');
      onSettingsChange({
        selectedPostType: 'All',
        ...initialDefaultSettings
      });
    }
  }, [initialDefaultSettings, onSettingsChange, currentSettings]);

  const effectiveSettings = useMemo(() => {
    const mergedSettings = { 
      selectedPostType: 'All',
      ...JSON.parse(JSON.stringify(initialDefaultSettings)) 
    };
    
    if (currentSettings) {
      // Merge selectedPostType
      if (currentSettings.selectedPostType) {
        mergedSettings.selectedPostType = currentSettings.selectedPostType;
      }
      
      // Merge each post type's settings
      for (const key in currentSettings) {
        if (key !== 'selectedPostType' && key in mergedSettings && 
            typeof currentSettings[key] === 'object' && !Array.isArray(currentSettings[key])) {
          mergedSettings[key] = {
            ...mergedSettings[key],
            ...currentSettings[key]
          };
        }
      }
    }
    return mergedSettings;
  }, [currentSettings, initialDefaultSettings]);

  const selectedPostType = effectiveSettings.selectedPostType || 'All';

  const lengthLimits = {
    Blog: { type: 'words', max: 1500, min: 50 },
    Newsletter: { type: 'words', max: 1000, min: 50 },
    LinkedIn: { type: 'characters', max: 1300, min: 50 },
    Twitter: { type: 'characters', max: 280, min: 10 },
    All: { wordMax: 2000, charMax: 2500, wordMin: 50, charMin: 10 },
  };

  const audienceOptions = ['General', 'Marketers', 'Developers', 'Students', 'Educators', 'Parents', 'Entrepreneurs', 'Small Business Owners'];
  const languageOptions = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam'];
  const toneOptions = ['Professional', 'Friendly', 'Conversational', 'Informative', 'Persuasive', 'Humorous', 'Assertive', 'Empathetic', 'Enthusiastic', 'Concise'];

  const handleParameterChange = (paramName, value) => {
    if (onSettingsChange) {
      const newSettings = {
        ...effectiveSettings,
        [selectedPostType]: {
          ...effectiveSettings[selectedPostType],
          [paramName]: value,
        },
      };
      console.log(`Parameter ${paramName} changed to:`, value, 'New settings:', newSettings);
      onSettingsChange(newSettings);
    }
  };

  const handlePostTypeChange = (type) => {
    if (onSettingsChange) {
      const newSettings = {
        ...effectiveSettings,
        selectedPostType: type,
      };
      console.log('Post type changed to:', type, 'New settings:', newSettings);
      onSettingsChange(newSettings);
    }
  };

  const getCurrentParameterValue = (paramName) => {
    const specificValue = effectiveSettings[selectedPostType]?.[paramName];
    if (specificValue !== undefined && !(typeof specificValue === 'number' && specificValue === 0 && paramName.includes('Count'))) {
        return specificValue;
    }
    return effectiveSettings.All[paramName];
  };

  const getLengthLimitMax = (type) => {
    if (selectedPostType === 'All') {
      return type === 'words' ? lengthLimits.All.wordMax : lengthLimits.All.charMax;
    }
    return lengthLimits[selectedPostType]?.max || 0;
  };

  const getLengthLimitMin = (type) => {
    if (selectedPostType === 'All') {
      return type === 'words' ? lengthLimits.All.wordMin : lengthLimits.All.charMin;
    }
    return lengthLimits[selectedPostType]?.min || 0;
  };

  const getPostTypeButtonClasses = (type) => {
    const baseClasses = `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap`;
    if (selectedPostType === type) {
      return `${baseClasses} ${colors.buttonActiveBg} ${colors.buttonActiveText} ${colors.border}`;
    } else {
      return `${baseClasses} ${colors.buttonDefaultBg} ${colors.buttonDefaultText} hover:${colors.buttonDefaultHover} ${colors.border}`;
    }
  };

  const getInputClasses = () => {
    return `w-full p-2 border ${colors.inputBorder} rounded-lg ${colors.inputBg} focus:ring-2 ${colors.inputFocusRing} focus:border-transparent transition duration-200 ${colors.textPrimary}`;
  };

  const getRangeInputClasses = () => {
    return `w-full h-2 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 ${colors.inputFocusRing}
            ${colors.rangeBg}
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:${colors.rangeThumb} [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:duration-200
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:${colors.rangeThumb} [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-colors [&::-moz-range-thumb]:duration-200`;
  };

  return (
    <div className={`${colors.bgCard} p-8 rounded-xl shadow-sm ${colors.border} flex flex-col h-full`}>
      <h2 className={`text-2xl font-semibold ${colors.textPrimary} mb-6 flex items-center`}>
        <Sparkles className={`mr-3 ${colors.brandPrimary}`} size={26} /> Generation Options
      </h2>

      <div className="mb-6">
        <label htmlFor="post-type-filter" className={`block text-base font-medium ${colors.textSecondary} mb-3 flex items-center`}>
          <Sparkles className={`mr-2 ${colors.brandPrimary}`} size={20} /> Select Post Type(s) to Generate
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(initialDefaultSettings).map((type) => (
            <button
              key={type}
              onClick={() => handlePostTypeChange(type)}
              className={getPostTypeButtonClasses(type)}
            >
              {type === 'All' ? 'All Post Types' : type.charAt(0).toUpperCase() + type.slice(1).replace('linkedin', 'LinkedIn').replace('twitter', 'Twitter/X')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-3 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Content Length (Word/Character Limit) */}
          {(lengthLimits[selectedPostType]?.type === 'words' || (selectedPostType === 'All' && lengthLimits.All.wordMax > 0)) && (
            <div>
              <label htmlFor="word-limit" className={`block text-sm font-medium ${colors.textSecondary} mb-1`}> Word Limit (Min {getLengthLimitMin('words')} - Max {getLengthLimitMax('words')}) </label>
              <input
                type="number"
                id="word-limit"
                value={getCurrentParameterValue('wordCount')}
                onChange={(e) => handleParameterChange('wordCount', parseInt(e.target.value) || 0)}
                min={getLengthLimitMin('words')}
                max={getLengthLimitMax('words')}
                className={getInputClasses()}
              />
              <p className={`mt-1 text-xs ${colors.textSecondary}`}>Max word count for the output.</p>
            </div>
          )}
          {(lengthLimits[selectedPostType]?.type === 'characters' || (selectedPostType === 'All' && lengthLimits.All.charMax > 0)) && (
            <div>
              <label htmlFor="character-limit" className={`block text-sm font-medium ${colors.textSecondary} mb-1`}> Character Limit (Min {getLengthLimitMin('characters')} - Max {getLengthLimitMax('characters')}) </label>
              <input
                type="number"
                id="character-limit"
                value={getCurrentParameterValue('characterCount')}
                onChange={(e) => handleParameterChange('characterCount', parseInt(e.target.value) || 0)}
                min={getLengthLimitMin('characters')}
                max={getLengthLimitMax('characters')}
                className={getInputClasses()}
              />
              <p className={`mt-1 text-xs ${colors.textSecondary}`}>Max character count for the output.</p>
            </div>
          )}

          {/* Target Audience */}
          <div>
            <label htmlFor="target-audience" className={`block text-sm font-medium ${colors.textSecondary} mb-1`}>Target Audience</label>
            <select
              id="target-audience"
              value={getCurrentParameterValue('targetAudience')}
              onChange={(e) => handleParameterChange('targetAudience', e.target.value)}
              className={getInputClasses()}
            >
              {audienceOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <p className={`mt-1 text-xs ${colors.textSecondary}`}>Who is the primary reader?</p>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className={`block text-sm font-medium ${colors.textSecondary} mb-1`}>Language</label>
            <select
              id="language"
              value={getCurrentParameterValue('language')}
              onChange={(e) => handleParameterChange('language', e.target.value)}
              className={getInputClasses()}
            >
              {languageOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <p className={`mt-1 text-xs ${colors.textSecondary}`}>Language of the generated content.</p>
          </div>

          {/* Tone & Style */}
          <div>
            <label htmlFor="tone-style" className={`block text-sm font-medium ${colors.textSecondary} mb-1`}>Tone & Style</label>
            <select
              id="tone-style"
              value={getCurrentParameterValue('toneStyle')}
              onChange={(e) => handleParameterChange('toneStyle', e.target.value)}
              className={getInputClasses()}
            >
              {toneOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <p className={`mt-1 text-xs ${colors.textSecondary}`}>Overall tone of the content.</p>
          </div>

          {/* Formality */}
          <div>
            <label htmlFor="formality" className={`block text-sm font-medium ${colors.textSecondary} mb-1`}>Formality: <span className="font-semibold">{getCurrentParameterValue('formality')}%</span></label>
            <input
              type="range"
              id="formality"
              min="0"
              max="100"
              step="1"
              value={getCurrentParameterValue('formality')}
              onChange={(e) => handleParameterChange('formality', parseInt(e.target.value))}
              className={getRangeInputClasses()}
            />
            <div className={`flex justify-between text-xs ${colors.textSecondary} mt-1`}>
              <span>Casual</span>
              <span>Formal</span>
            </div>
            <p className={`mt-1 text-xs ${colors.textSecondary}`}>Adjust the level of formality.</p>
          </div>

          {/* Creativity Level */}
          <div>
            <label htmlFor="creativity-level" className={`block text-sm font-medium ${colors.textSecondary} mb-1`}>Creativity Level: <span className="font-semibold">{getCurrentParameterValue('creativityLevel')}%</span></label>
            <input
              type="range"
              id="creativity-level"
              min="0"
              max="100"
              step="1"
              value={getCurrentParameterValue('creativityLevel')}
              onChange={(e) => handleParameterChange('creativityLevel', parseInt(e.target.value))}
              className={getRangeInputClasses()}
            />
            <div className={`flex justify-between text-xs ${colors.textSecondary} mt-1`}>
              <span>Low</span>
              <span>High</span>
            </div>
            <p className={`mt-1 text-xs ${colors.textSecondary}`}>How creative should the AI be?</p>
          </div>

          {/* Focus Keywords */}
          <div>
            <label htmlFor="focus-keywords" className={`block text-sm font-medium ${colors.textSecondary} mb-1`}>Focus Keywords (for SEO)</label>
            <input
              type="text"
              id="focus-keywords"
              value={getCurrentParameterValue('focusKeywords')}
              onChange={(e) => handleParameterChange('focusKeywords', e.target.value)}
              placeholder="e.g., AI newsletter, content automation (comma-separated)"
              className={getInputClasses()}
            />
            <p className={`mt-1 text-xs ${colors.textSecondary}`}>Primary terms for SEO.</p>
          </div>

          {/* Keyword Density */}
          <div>
            <label htmlFor="keyword-density" className={`block text-sm font-medium ${colors.textSecondary} mb-1`}>Keyword Density: <span className="font-semibold">{getCurrentParameterValue('keywordDensity')}%</span></label>
            <input
              type="range"
              id="keyword-density"
              min="0.5"
              max="3"
              step="0.1"
              value={getCurrentParameterValue('keywordDensity')}
              onChange={(e) => handleParameterChange('keywordDensity', parseFloat(e.target.value))}
              className={getRangeInputClasses()}
            />
            <div className={`flex justify-between text-xs ${colors.textSecondary} mt-1`}>
              <span>0.5%</span>
              <span>1.5%</span>
              <span>3%</span>
            </div>
            <p className={`mt-1 text-xs ${colors.textSecondary}`}>Frequency of keywords in content.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedGenerationOptions;