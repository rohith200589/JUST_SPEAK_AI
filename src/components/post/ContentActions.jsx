// src/components/ContentActions.jsx
import React, { useState, useEffect } from 'react';
import { Copy, Save, Share2, ExternalLink, Volume2, VolumeX, ChevronDown, Edit, List } from 'lucide-react';

const ContentActions = ({
  content,
  type,
  blogUrl,
  onCopy,
  onPost,
  onEdit,
  isEditing,
  onSaveEdit,
  colors,
  theme,
  copiedSection,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [message, setMessage] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [showVoiceList, setShowVoiceList] = useState(false);

  // FIX: Base button class is now built with colors from props for consistency
  const baseActionButtonsClass =
    `p-2 rounded-full ${colors.bgButton} ${colors.textButton} hover:${colors.bgButtonHover} transition-colors duration-200 shadow-md flex items-center justify-center`;

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);
      if (allVoices.length > 0 && !selectedVoiceURI) {
        const preferredVoice = allVoices.find(v => v.lang.startsWith('en') && v.name.includes('Google') || v.default);
        setSelectedVoiceURI(preferredVoice ? preferredVoice.voiceURI : allVoices[0].voiceURI);
      }
    };

    // Corrected: Check for support before adding event listener
    if ('speechSynthesis' in window) {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      // Corrected: Cleanup listener only if it was added
      if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoiceURI]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (isSpeaking) {
      const handleBeforeUnload = (event) => {
        if (isSpeaking) {
          window.speechSynthesis.cancel();
        }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isSpeaking]);

  const handleSpeakContent = () => {
    if (!('speechSynthesis' in window)) {
      console.error("Text-to-speech not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const newUtterance = new SpeechSynthesisUtterance(content);

      const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) {
        newUtterance.voice = voice;
        newUtterance.lang = voice.lang;
      }

      newUtterance.pitch = 1;
      newUtterance.rate = 1;

      newUtterance.onend = () => {
        setIsSpeaking(false);
      };
      newUtterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(newUtterance);
      setUtterance(newUtterance);
      setIsSpeaking(true);
    }
  };

  const handleSaveAsTxt = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_content.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage(`Saved ${type} as TXT!`);
    setShowSaveOptions(false);
  };

  const handleSaveAsPdf = () => {
    // FIX: This is still a simulated action.
    setMessage(`Saved ${type} as PDF (simulated)!`);
    setShowSaveOptions(false);
  };

  return (
    <div className="absolute top-5 right-8 flex flex-col space-y-2 z-20 items-end">
      <div className="flex space-x-2">
         <div className="relative">
        <button
          onClick={() => setShowVoiceList(!showVoiceList)}
          className={`${baseActionButtonsClass} px-3`}
          title="Select Voice"
        >
          <Volume2 size={18} className="mr-1" />
          <List size={18} />
          <ChevronDown size={14} className={`ml-1 transition-transform duration-200 ${showVoiceList ? 'rotate-180' : ''}`} />
        </button>
        {showVoiceList && (
          <div className={`absolute right-0 mt-2 w-48 ${colors.voiceListBg} border ${colors.border} rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto custom-scrollbar`}>
            {voices.map((v) => (
              <button
                key={v.voiceURI}
                onClick={() => {
                  setSelectedVoiceURI(v.voiceURI);
                  setShowVoiceList(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:${colors.voiceListHover} ${
                  selectedVoiceURI === v.voiceURI ? `${colors.voiceListActive} font-semibold` : ''
                } ${colors.textButton}`}
              >
                {v.name} ({v.lang})
              </button>
            ))}
          </div>
        )}
      </div>
        <button
          onClick={handleSpeakContent}
          className={`${baseActionButtonsClass} ${isSpeaking ? `${colors.activeBg} ${colors.activeText}` : ''}`}
          title={isSpeaking ? "Stop Speaking" : "Listen to Content"}
        >
          {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <button
          onClick={() => onCopy(content, type)}
          className={`${baseActionButtonsClass} ${copiedSection === type ? `${colors.copySuccessBg} ${colors.copySuccessText}` : ''}`}
          title="Copy Content"
        >
          <Copy size={18} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowSaveOptions(!showSaveOptions)}
            className={`${baseActionButtonsClass}`}
            title="Save Content"
          >
            <Save size={18} />
            <ChevronDown size={14} className="ml-1" />
          </button>
          {showSaveOptions && (
            <div className={`absolute right-0 mt-2 w-32 ${colors.voiceListBg} border rounded shadow-lg z-30 ${colors.textButton}`}>
              <button
                onClick={handleSaveAsTxt}
                className={`block w-full text-left px-4 py-2 text-sm hover:${colors.voiceListHover}`}
              >
                Save as TXT
              </button>
              <button
                onClick={handleSaveAsPdf}
                className={`block w-full text-left px-4 py-2 text-sm hover:${colors.voiceListHover}`}
              >
                Save as PDF (simulated)
              </button>
            </div>
          )}
        </div>

        {!isEditing && (
          <button
            onClick={() => {
              if (onEdit) {
                onEdit(type);
                setMessage(`Now editing ${type} content.`);
              } else {
                setMessage("Edit functionality not available.");
              }
            }}
            className={`${baseActionButtonsClass}`}
            title="Edit Content"
          >
            <Edit size={18} />
          </button>
        )}

        {isEditing && (
          <button
            onClick={() => {
              if (onSaveEdit) {
                onSaveEdit();
                setMessage(`${type} content saved!`);
              }
            }}
            className={`${baseActionButtonsClass} bg-blue-500 hover:bg-blue-600 text-white`}
            title="Save Edited Content"
          >
            <Save size={18} /> Save
          </button>
        )}

        {type === 'blog' && blogUrl && !isEditing && (
          <a
            href={blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${baseActionButtonsClass}`}
            title="View Blog Post"
          >
            <ExternalLink size={18} />
          </a>
        )}

        {(type === 'blog' || type === 'linkedin' || type === 'twitter' || type === 'newsletter') && !isEditing && (
          <button
            onClick={() => {
              onPost(content, type);
              setMessage(`Ready to post to ${type}!`);
            }}
            className={`${baseActionButtonsClass}`}
            title="Share/Post Content"
          >
            <Share2 size={18} />
          </button>
        )}
      </div>

      {message && (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 ${colors.messageBg} ${colors.messageText} rounded-lg shadow-lg text-sm z-40 whitespace-nowrap`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ContentActions;