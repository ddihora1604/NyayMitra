import { useState, useEffect, useRef } from 'react';

// Helper function to clean Markdown for speech
const sanitizeMarkdownForSpeech = (markdown) => {
  if (!markdown) return '';
  
  return markdown
    .replace(/^={2,}|-{2,}/gm, "")
    .replace(/[*_`>#]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\n+/g, ". ")
    .replace(/\.\s+\./g, ".") // Remove consecutive periods
    .trim();
};

export default function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);
  
  // Check if speech synthesis is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSpeechSynthesis = 'speechSynthesis' in window;
      setIsSupported(hasSpeechSynthesis);
      
      // Initialize voices
      if (hasSpeechSynthesis) {
        // Some browsers need a small delay before voices are available
        const loadVoices = () => {
          const availableVoices = window.speechSynthesis.getVoices();
          if (availableVoices.length > 0) {
            setVoices(availableVoices);
          }
        };
        
        // Load voices immediately in case they're already available
        loadVoices();
        
        // Chrome requires this event to get voices
        window.speechSynthesis.onvoiceschanged = loadVoices;
        
        // Add an extra listener for Safari and Firefox
        setTimeout(loadVoices, 200);
      }
    }
    
    // Cleanup
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        if (utteranceRef.current) {
          utteranceRef.current.onend = null;
          utteranceRef.current.onerror = null;
          utteranceRef.current.onstart = null;
        }
      }
    };
  }, []);
  
  // Chrome has a bug where speechSynthesis sometimes stops unexpectedly
  // This is a workaround to keep it going
  useEffect(() => {
    if (!speaking || !isSupported) return;
    
    const intervalId = setInterval(() => {
      if (speaking && window.speechSynthesis.speaking) {
        // Trigger pause/resume to keep it alive
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [speaking, isSupported]);
  
  // Find the best voice for a given language
  const getBestVoice = (lang) => {
    if (!voices.length) return null;
    
    // Try to find a voice that matches the language
    // Prefer native voices over non-native ones
    const matchingVoices = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
    
    if (matchingVoices.length) {
      // Prefer native voices
      const nativeVoice = matchingVoices.find(v => v.localService);
      return nativeVoice || matchingVoices[0];
    }
    
    // Fallback to default system voice
    return null;
  };
  
  const speak = (text, options = {}) => {
    if (!isSupported || !text) return false;
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      setSpeaking(false);
      
      // Clean markdown from text
      const cleanedText = options.cleanMarkdown 
        ? sanitizeMarkdownForSpeech(text) 
        : text;
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utteranceRef.current = utterance;
      
      // Find best voice for language or use provided voice
      const lang = options.lang || 'en-US';
      const bestVoice = options.voice || getBestVoice(lang);
      
      // Apply options
      utterance.lang = lang;
      if (bestVoice) utterance.voice = bestVoice;
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      // Set event handlers
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = (error) => {
        console.error("Speech synthesis error:", error);
        setSpeaking(false);
      };
      
      // Speak
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error("Error with speech synthesis:", error);
      setSpeaking(false);
      return false;
    }
  };
  
  const stop = () => {
    if (!isSupported) return false;
    
    try {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return true;
    } catch (error) {
      console.error("Error stopping speech synthesis:", error);
      return false;
    }
  };
  
  const getVoices = () => {
    return voices;
  };
  
  return {
    isSpeaking: speaking,
    isSupported,
    speak,
    stop,
    getVoices,
    sanitizeMarkdownForSpeech,
    voices
  };
} 