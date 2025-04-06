import { useState, useEffect, useRef } from 'react';

export default function useSpeechRecognition({
  onResult = () => {},
  onError = () => {},
  language = 'en-US',
}) {
  const [listening, setListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  
  // Initialize the speech recognition object
  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 
                                  'SpeechRecognition' in window;
      setIsSupported(hasSpeechRecognition);
      
      if (hasSpeechRecognition) {
        try {
          // Use the appropriate constructor
          const SpeechRecognition = window.webkitSpeechRecognition || 
                                   window.SpeechRecognition;
                                   
          // Create a new instance
          recognitionRef.current = new SpeechRecognition();
          
          // Configure the recognition
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = language;
          
          // Set up event handlers
          recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results)
              .map(result => result[0])
              .map(result => result.transcript)
              .join('');
              
            onResult(transcript);
          };
          
          recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setListening(false);
            onError(event.error);
          };
          
          recognitionRef.current.onend = () => {
            // Only stop listening if we're not in a restart situation
            if (listening) {
              console.log("Speech recognition ended unexpectedly");
              setListening(false);
            }
          };
        } catch (error) {
          console.error("Error initializing speech recognition:", error);
          setIsSupported(false);
        }
      }
    }
  }, []);
  
  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current && language) {
      recognitionRef.current.lang = language;
    }
  }, [language]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          setListening(false);
          recognitionRef.current.abort();
        } catch (error) {
          console.error("Error stopping speech recognition on cleanup:", error);
        }
      }
    };
  }, []);
  
  const start = () => {
    if (!isSupported || !recognitionRef.current) return false;
    
    try {
      recognitionRef.current.start();
      setListening(true);
      return true;
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      // Try to recover if already running
      if (error.name === 'InvalidStateError') {
        try {
          // Stop and restart
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current.start();
            setListening(true);
          }, 100);
          return true;
        } catch (e) {
          console.error("Failed to recover from InvalidStateError:", e);
          return false;
        }
      }
      return false;
    }
  };
  
  const stop = () => {
    if (!isSupported || !recognitionRef.current) return false;
    
    try {
      recognitionRef.current.stop();
      setListening(false);
      return true;
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
      return false;
    }
  };
  
  const toggleListening = () => {
    if (listening) {
      return stop();
    } else {
      return start();
    }
  };
  
  return {
    isListening: listening,
    isSupported,
    start,
    stop,
    toggleListening,
  };
} 