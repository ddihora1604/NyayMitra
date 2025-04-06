/**
 * Sanitizes markdown text for speech synthesis
 * @param {string} markdown - Markdown text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeMarkdownForSpeech = (markdown) => {
  if (!markdown) return '';
  
  return markdown
    .replace(/^={2,}|-{2,}/gm, "") // Remove headings (==== or ----)
    .replace(/[*_`>#]/g, "") // Remove markdown symbols
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Replace links with just the text
    .replace(/\n+/g, ". ") // Replace multiple newlines with periods
    .trim();
};

/**
 * Detects if a string contains Hindi characters
 * @param {string} text - Text to analyze
 * @returns {string} - Language code 'hi-IN' for Hindi or 'en-IN' for English
 */
export const detectLanguage = (text) => {
  if (!text) return 'en-IN';
  
  const hindiRegex = /[\u0900-\u097F]/;
  return hindiRegex.test(text) ? "hi-IN" : "en-IN";
};

/**
 * Checks if speech recognition is supported in the browser
 * @returns {boolean} - Whether speech recognition is supported
 */
export const isSpeechRecognitionSupported = () => {
  if (typeof window === 'undefined') return false;
  
  return 'webkitSpeechRecognition' in window || 
         'SpeechRecognition' in window;
};

/**
 * Checks if speech synthesis is supported in the browser
 * @returns {boolean} - Whether speech synthesis is supported
 */
export const isSpeechSynthesisSupported = () => {
  if (typeof window === 'undefined') return false;
  
  return 'speechSynthesis' in window;
};

/**
 * Gets available speech synthesis voices
 * @param {string} [langCode] - Optional language code to filter voices
 * @returns {SpeechSynthesisVoice[]} - Array of available voices
 */
export const getAvailableVoices = (langCode) => {
  if (!isSpeechSynthesisSupported()) return [];
  
  try {
    const voices = window.speechSynthesis.getVoices();
    
    if (langCode) {
      return voices.filter(voice => voice.lang.startsWith(langCode));
    }
    
    return voices;
  } catch (error) {
    console.error("Error getting speech synthesis voices:", error);
    return [];
  }
}; 