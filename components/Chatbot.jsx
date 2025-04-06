'use client';

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { User, Bot, Mic, Volume2, Send, Loader2 } from "lucide-react";
import styles from "../app/chatbot/styles.module.css";

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
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [apiError, setApiError] = useState(false);

  // Default language (auto-switching enabled)
  const [language, setLanguage] = useState("en-IN");

  const sanitizeMarkdownForSpeech = (markdown) => {
    return markdown
      .replace(/^={2,}|-{2,}/gm, "")
      .replace(/[*_`>#]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\n+/g, ". ")
      .trim();
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if speech recognition is available
      const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 
                                  'SpeechRecognition' in window;
      
      setSpeechSupported(hasSpeechRecognition);
      
      if (hasSpeechRecognition) {
        try {
          // Use the appropriate speech recognition constructor
          const SpeechRecognition = window.webkitSpeechRecognition || 
                                   window.SpeechRecognition;
          
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = language;
    
          recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results)
              .map(result => result[0])
              .map(result => result.transcript)
              .join('');
              
            setInput(transcript);
          };
    
          recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setListening(false);
          };
    
          recognitionRef.current.onend = () => {
            setListening(false);
          };
        } catch (error) {
          console.error("Error initializing speech recognition:", error);
          setSpeechSupported(false);
        }
      }
    }
  }, [language]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleListening = () => {
    if (!speechSupported) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    
    try {
      if (recognitionRef.current) {
        if (listening) {
          recognitionRef.current.stop();
          setListening(false);
        } else {
          // Clear the input field before starting new voice recognition
          setInput("");
          recognitionRef.current.start();
          setListening(true);
        }
      }
    } catch (error) {
      console.error("Error with speech recognition:", error);
      setListening(false);
      alert("There was an issue with speech recognition. Please try again or type your message.");
    }
  };

  const speakText = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        const cleaned = sanitizeMarkdownForSpeech(text);
        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error with text-to-speech:", error);
      }
    }
  };

  const detectLanguage = (text) => {
    const hindiRegex = /[\u0900-\u097F]/;
    return hindiRegex.test(text) ? "hi-IN" : "en-IN";
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setApiError(false);
    const detectedLang = detectLanguage(input);
    setLanguage(detectedLang);

    const newUserMessage = { role: "user", content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput("");
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
        speakText(assistantMessage.content);
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

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
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
          <div className="flex items-center gap-2 text-amber-600 italic">
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
      <div className="mt-4 relative">
        <textarea
          className="w-full p-3 pr-14 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none border-amber-200"
          rows="3"
          placeholder={listening ? "Listening... Speak your question." : "Type your legal question here..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className={`absolute right-3 bottom-3 p-2 rounded-full ${
            loading || !input.trim() 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-amber-500 text-white hover:bg-amber-600'
          } transition-colors`}
          aria-label="Send message"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between mt-4 gap-2 flex-wrap">
        <button
          onClick={toggleListening}
          disabled={!speechSupported}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
            !speechSupported 
              ? 'bg-gray-400 cursor-not-allowed'
              : listening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-amber-600 hover:bg-amber-700'
          }`}
        >
          <Mic size={18} /> {listening ? "Listening..." : "Speak"}
        </button>

        <button
          onClick={stopSpeaking}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Volume2 size={18} /> Stop Audio
        </button>
      </div>
    </div>
  );
};

export default Chatbot; 