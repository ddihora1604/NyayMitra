import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { GROQ_API_KEY } from "../secrets/env.js";
import { User, Bot, Mic, Volume2 } from "lucide-react";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "You are a helpful legal assistant. Always format your replies using clean Markdown with clear headings, bullet points, and spacing between sections. Use line breaks and indentation to enhance readability.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // ✅ Default language (auto-switching enabled)
  const [language, setLanguage] = useState("en-IN");

  const sanitizeMarkdownForSpeech = (markdown) => {
    return markdown
      .replace(/^={2,}|-{2,}/gm, "")
      .replace(/[*_`>#]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\n+/g, ". ")
      .trim();
  };

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
  }, [language]);

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (listening) {
        recognitionRef.current.stop();
        setListening(false);
      } else {
        recognitionRef.current.start();
        setListening(true);
      }
    }
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const cleaned = sanitizeMarkdownForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = language;
      window.speechSynthesis.speak(utterance);
    }
  };

  const detectLanguage = (text) => {
    const hindiRegex = /[\u0900-\u097F]/;
    return hindiRegex.test(text) ? "hi-IN" : "en-IN";
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const detectedLang = detectLanguage(input);
    setLanguage(detectedLang);

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
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
            messages: newMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();

      if (data?.choices && data.choices[0]?.message) {
        const assistantMessage = data.choices[0].message;
        setMessages((prev) => [...prev, assistantMessage]);
        speakText(assistantMessage.content);
      } else {
        console.error("Unexpected response:", data);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
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

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        💬 Legal Assistant Chatbot
      </h1>

      <div className="bg-white shadow-md rounded-xl p-4 h-[500px] overflow-y-auto space-y-4">
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
                <div className="max-w-[80%] bg-blue-100 p-3 rounded-xl text-right">
                  <div className="text-xs text-gray-600 mb-1 flex justify-end items-center gap-1">
                    <span>User</span> <User size={14} />
                  </div>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="max-w-[80%] bg-gray-100 p-3 rounded-xl text-left">
                  <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                    <Bot size={14} /> <span>Assistant</span>
                  </div>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        {loading && (
          <div className="text-gray-500 italic text-sm">
            Assistant is typing...
          </div>
        )}
      </div>

      <div className="mt-4">
        <textarea
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring resize-none"
          rows="2"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="flex justify-between mt-2 gap-2 flex-wrap">
          <button
            onClick={toggleListening}
            className={`flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 ${
              listening ? "animate-pulse" : ""
            }`}
          >
            <Mic size={18} /> {listening ? "Listening..." : "Speak"}
          </button>

          <button
            onClick={() => {
              if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700"
          >
            <Volume2 size={18} /> Stop Speaking
          </button>

          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;