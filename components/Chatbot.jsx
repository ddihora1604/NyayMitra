'use client';

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { User, Bot, Mic, Volume2, Send, Loader2, MicOff, Square } from "lucide-react";
import styles from "../app/chatbot/styles.module.css";
import useSpeechRecognition from "@/lib/hooks/useSpeechRecognition";
import useSpeechSynthesis from "@/lib/hooks/useSpeechSynthesis";

// Import API key from environment
import { GROQ_API_KEY } from "../secrets/env.js";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "You are a helpful legal assistant. Always format your replies using clean Markdown with the following guidelines:\n\n1. Use ## for main headings and ### for subheadings\n2. Use bullet points (- ) or numbered lists (1. ) for listing information\n3. Add proper spacing between sections (use double line breaks)\n4. Bold important terms or concepts using **term**\n5. For legal citations or references, use *italics*\n6. Organize complex information into clear sections with headings\n7. Keep paragraphs short and readable\n8. Use line breaks and indentation to enhance readability",
    },
    {
      role: "assistant", 
      content: "👋 Hello! I'm your AI legal assistant. How can I help you today? You can ask me about legal concepts, procedures, or general information related to the law."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState("");
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Default language (auto-switching enabled)
  const [language, setLanguage] = useState("en-IN");

  // Use our custom hooks
  const { 
    isListening, 
    isSupported: speechRecognitionSupported, 
    toggleListening,
    start: startListening,
    stop: stopListening
  } = useSpeechRecognition({
    onResult: (transcript) => {
      setInput(transcript);
      setSpeechFeedback("Listening: " + transcript);
    },
    onError: (error) => {
      console.error("Speech recognition error:", error);
      // Show error feedback to user
      if (error === 'not-allowed') {
        setSpeechFeedback("Microphone access denied. Please check browser permissions.");
        setApiError("Microphone access was denied. Please check your browser permissions.");
      } else if (error === 'no-speech') {
        setSpeechFeedback("No speech detected. Please try speaking again.");
      } else {
        setSpeechFeedback(`Error: ${error}. Please try again.`);
      }
      stopListening();
    },
    language
  });
  
  const { 
    isSpeaking, 
    speak, 
    stop: stopSpeaking,
    voices
  } = useSpeechSynthesis();

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear speech feedback when not listening
  useEffect(() => {
    if (!isListening) {
      // Small delay to allow reading the last feedback
      const timer = setTimeout(() => {
        setSpeechFeedback("");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isListening]);

  // Focus the input when starting to listen
  useEffect(() => {
    if (isListening && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isListening]);

  const detectLanguage = (text) => {
    const hindiRegex = /[\u0900-\u097F]/;
    return hindiRegex.test(text) ? "hi-IN" : "en-IN";
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Stop any ongoing speech
    if (isListening) {
      stopListening();
    }
    
    if (isSpeaking) {
      stopSpeaking();
    }

    setApiError(false);
    const detectedLang = detectLanguage(input);
    setLanguage(detectedLang);

    const newUserMessage = { role: "user", content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput("");
    setSpeechFeedback("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [...messages, newUserMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error with status ${response.status}`);
      }

      const data = await response.json();

      if (data?.choices && data.choices[0]?.message) {
        const assistantMessage = data.choices[0].message;
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Speak the assistant's response
        speak(assistantMessage.content, { 
          cleanMarkdown: true,
          lang: language
        });
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I apologize, but I encountered an issue processing your request. Please try again.",
          },
        ]);
        console.error("Unexpected response:", data);
        setApiError(true);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize for the technical difficulty. Please try again in a moment.",
        },
      ]);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSpeakButtonClick = () => {
    // Clear input when starting new voice recognition
    if (!isListening) {
      setInput("");
      setApiError(false);
      setSpeechFeedback("Listening... Speak now");
    } else {
      setSpeechFeedback("Stopping...");
    }
    
    // Toggle speech recognition
    toggleListening();
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Chat container */}
      <div 
        ref={chatContainerRef}
        className={`bg-gray-50 rounded-lg p-4 h-[500px] overflow-y-auto space-y-4 ${styles.chatContainer}`}
      >
        {messages
          .filter((m) => m.role !== "system")
          .map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 items-start ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "user" ? (
                <div className={`max-w-[80%] p-3 rounded-xl shadow-sm text-right ${styles.userMessage}`}>
                  <div className="text-xs text-gray-600 mb-1 flex justify-end items-center gap-1">
                    <span>You</span> <User size={14} />
                  </div>
                  <div className={`text-gray-800 ${styles.messageContent}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className={`max-w-[80%] p-3 rounded-xl shadow-sm text-left ${styles.botMessage}`}>
                  <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                    <Bot size={14} /> <span>Assistant</span>
                  </div>
                  <div className={`text-gray-800 prose prose-sm max-w-none ${styles.messageContent}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
        {loading && (
          <div className="flex items-center gap-2 text-amber-600">
            <Loader2 size={18} className="animate-spin" />
            <span>Assistant is thinking...</span>
          </div>
        )}
        {apiError && (
          <div className="text-center p-2 text-amber-600 text-sm bg-amber-50 rounded-lg">
            There may be an issue connecting to the AI service. The API key might be expired or incorrect.
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="mt-4">
        <div className="relative">
          <textarea
            ref={inputRef}
            className="w-full p-3 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
            rows="3"
            placeholder={isListening ? "Listening... Speak your question." : "Type your legal question here..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          
          {/* Speech feedback overlay */}
          {speechFeedback && (
            <div className={styles.speechFeedback}>
              {speechFeedback}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-2 gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleSpeakButtonClick}
              className={`flex items-center gap-2 ${
                isListening ? 'bg-amber-500 animate-pulse' : 'bg-amber-600'
              } text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors ${
                !speechRecognitionSupported && 'opacity-60 cursor-not-allowed'
              }`}
              disabled={loading || !speechRecognitionSupported}
              title={speechRecognitionSupported ? 
                (isListening ? "Stop listening" : "Start voice input") : 
                "Speech recognition not supported"}
            >
              {isListening ? (
                <>
                  <div className={styles.audioWaves}>
                    <div className={styles.audioWave}></div>
                    <div className={styles.audioWave}></div>
                    <div className={styles.audioWave}></div>
                    <div className={styles.audioWave}></div>
                    <div className={styles.audioWave}></div>
                  </div>
                  <span className="ml-1">Stop</span>
                </>
              ) : (
                <>
                  <Mic size={18} />
                  <span>Speak</span>
                </>
              )}
            </button>
            
            <button
              onClick={stopSpeaking}
              className={`flex items-center gap-2 ${
                isSpeaking ? 'bg-red-500' : 'bg-red-600'
              } text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors ${
                !isSpeaking && 'opacity-70'
              }`}
              disabled={!isSpeaking}
              title="Stop text-to-speech"
            >
              <Square size={18} />
              Stop
            </button>
          </div>
          
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`flex items-center gap-2 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors ${
              (loading || !input.trim()) && 'opacity-70'
            }`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 