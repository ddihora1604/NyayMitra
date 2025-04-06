"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileUp, AlertCircle, FileText, Upload, Loader2, Send, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from './config';

// Export config for Next.js to recognize this as a dynamic page
export { dynamic, dynamicParams, revalidate } from './config';

// Add animation styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;

interface QAPair {
  question: string;
  answer: string;
  timestamp: string;
  modelUsed?: string;
}

export default function DocumentAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);
  const [qaHistory, setQaHistory] = useState<QAPair[]>([]);
  const [documentText, setDocumentText] = useState<string>('');
  const questionInputRef = useRef<HTMLInputElement>(null);
  const qaHistoryRef = useRef<HTMLDivElement>(null);

  // Inject animation styles
  useEffect(() => {
    // Create and append style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = animationStyles;
    document.head.appendChild(styleElement);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  // Validate file type
  const validateAndSetFile = (file: File) => {
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = SUPPORTED_FILE_TYPES.some(type => type.extension === fileExt);
    
    if (!isValidType) {
      setError(`Invalid file type. Please upload ${SUPPORTED_FILE_TYPES.map(t => t.name).join(', ')} files.`);
      setFile(null);
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      setFile(null);
      return false;
    }
    
    setFile(file);
    setError(null);
    return true;
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files.length) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  // Upload and analyze file
  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file to analyze');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      setQaHistory([]);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/document-analyzer', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze document');
      }
      
      const data = await response.json();
      
      // Check if analysis contains actual content
      if (!data.analysis || data.analysis.trim() === '') {
        throw new Error('Document analysis returned empty results. Please try a different document.');
      }
      
      // Check if the analysis contains an error message
      if (data.analysis.includes('ERROR:')) {
        throw new Error(data.analysis.split('ERROR:')[1].trim());
      }
      
      // Read the document text from file for Q&A
      await readDocumentText(file);
      
      setResult(data);
    } catch (error: any) {
      console.error('Document analysis error:', error);
      setError(error.message || 'An error occurred during analysis');
      setResult(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Read document text for Q&A
  const readDocumentText = async (file: File) => {
    try {
      const text = await file.text();
      setDocumentText(text);
      return text;
    } catch (error) {
      console.error('Error reading document text:', error);
      setDocumentText('');
      return '';
    }
  };

  // Ask a question about the document
  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setQaError('Please enter a question');
      return;
    }

    if (!documentText && !result?.documentText) {
      try {
        if (file) {
          await readDocumentText(file);
        } else {
          setQaError('Document text is not available');
          return;
        }
      } catch (error) {
        setQaError('Failed to read document text');
        return;
      }
    }
    
    try {
      setIsAskingQuestion(true);
      setQaError(null);
      
      const response = await fetch('/api/document-analyzer/answer-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          documentText: result?.documentText || documentText,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to process question');
      }
      
      const data = await response.json();
      
      // Add to Q&A history
      const newQA = {
        question: question.trim(),
        answer: data.answer,
        timestamp: data.timestamp,
        modelUsed: data.modelUsed
      };
      
      setQaHistory(prev => [...prev, newQA]);
      setQuestion('');
      
      // Scroll to the latest answer
      setTimeout(() => {
        if (qaHistoryRef.current) {
          qaHistoryRef.current.scrollTop = qaHistoryRef.current.scrollHeight;
        }
      }, 100);
      
      // Focus back on input
      if (questionInputRef.current) {
        questionInputRef.current.focus();
      }
      
    } catch (error: any) {
      console.error('Q&A error:', error);
      // Handle rate limit errors with a user-friendly message
      if (error.message.includes('rate limit') || error.message.includes('quota') || error.message.includes('high demand')) {
        setQaError('The service is currently experiencing high demand. Please try again in a few moments.');
      } else {
        setQaError(error.message || 'Failed to get an answer');
      }
    } finally {
      setIsAskingQuestion(false);
    }
  };

  // Handle pressing Enter in question input
  const handleQuestionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isAskingQuestion) {
      handleAskQuestion();
    }
  };

  // Format analysis output with proper sections
  const formatAnalysisOutput = (output: string) => {
    if (!output) return '';
    
    try {
      // Split by section headers
      const sections = output.split(/─{3} .+ ─{3}/);
      const headers = output.match(/─{3} .+ ─{3}/g) || [];
      
      if (headers.length === 0) {
        // If no headers found, return the raw output with improved styling
        return (
          <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-6">
            <div className="prose prose-amber prose-headings:text-amber-700 prose-p:text-gray-700 prose-strong:text-amber-800 max-w-none whitespace-pre-wrap">
              {output}
            </div>
          </div>
        );
      }
      
      return (
        <div className="space-y-8">
          {headers.map((header, i) => {
            const sectionTitle = header.replace(/─{3} (.+) ─{3}/, '$1');
            const sectionContent = sections[i+1]?.trim() || '';
            
            // Format content based on section type
            let formattedContent;
            if (sectionTitle === 'DOCUMENT SUMMARY' || sectionTitle === 'KEY INFORMATION') {
              // Format bullet points and key-value pairs
              formattedContent = sectionContent.split('\n').map((line, idx) => {
                const bulletMatch = line.match(/^[•\-*]\s+(.+?):\s*(.+)$/);
                if (bulletMatch) {
                  // This is a key-value bullet point
                  return (
                    <div key={idx} className="flex py-2 items-start">
                      <div className="text-amber-500 mr-2">•</div>
                      <div className="font-medium text-amber-900 mr-2">{bulletMatch[1]}:</div>
                      <div className="text-gray-700">{bulletMatch[2]}</div>
                    </div>
                  );
                } else if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                  // Regular bullet point
                  return (
                    <div key={idx} className="flex py-1 items-start">
                      <div className="text-amber-500 mr-2">•</div>
                      <div className="text-gray-700">{line.replace(/^[•\-*]\s+/, '')}</div>
                    </div>
                  );
                } else if (line.trim() !== '') {
                  // Regular paragraph
                  return <p key={idx} className="py-1 text-gray-700">{line}</p>;
                }
                return null;
              });
            } else {
              // Format numbered lists and regular content
              formattedContent = sectionContent.split('\n').map((line, idx) => {
                const numberedMatch = line.match(/^(\d+)\.\s+(.+?):\s*(.+)$/);
                if (numberedMatch) {
                  // Numbered item with key-value pair
                  return (
                    <div key={idx} className="flex py-2 items-start">
                      <div className="text-amber-600 font-medium mr-2">{numberedMatch[1]}.</div>
                      <div className="font-medium text-amber-900 mr-2">{numberedMatch[2]}:</div>
                      <div className="text-gray-700">{numberedMatch[3]}</div>
                    </div>
                  );
                } else if (line.match(/^(\d+)\.\s+(.+)$/)) {
                  // Simple numbered item
                  const match = line.match(/^(\d+)\.\s+(.+)$/);
                  return (
                    <div key={idx} className="flex py-1 items-start">
                      <div className="text-amber-600 font-medium mr-2">{match![1]}.</div>
                      <div className="text-gray-700">{match![2]}</div>
                    </div>
                  );
                } else if (line.trim() !== '') {
                  // Regular paragraph
                  return <p key={idx} className="py-1 text-gray-700">{line}</p>;
                }
                return null;
              });
            }
            
            return (
              <div key={i} className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
                <div className="bg-amber-50 border-b border-amber-100 px-6 py-4">
                  <h3 className="text-lg font-semibold text-amber-800">
                    {sectionTitle}
                  </h3>
                </div>
                <div className="p-6 space-y-2">
                  {formattedContent}
                </div>
              </div>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error('Error formatting analysis output:', error);
      // Return raw output if formatting fails
      return (
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-6">
          <div className="prose prose-amber prose-headings:text-amber-700 prose-p:text-gray-700 prose-strong:text-amber-800 max-w-none whitespace-pre-wrap">
            {output}
          </div>
        </div>
      );
    }
  };

  // Format code snippets in answers
  const formatCodeSnippets = (text: string) => {
    // Regular expression to match code blocks
    const codeBlockRegex = /```(?:(\w+))?\n([\s\S]*?)```/g;
    
    // Split text by code blocks and normal text
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add formatted code block
      const language = match[1] || '';
      const code = match[2];
      
      parts.push(
        <div key={match.index} className="code-snippet my-4 rounded-lg overflow-hidden border border-amber-200 bg-amber-50/50">
          {language && (
            <div className="text-xs bg-amber-100 text-amber-800 px-4 py-1 font-mono tracking-wide">
              {language}
            </div>
          )}
          <pre className="overflow-x-auto p-4 text-sm font-mono text-gray-800 bg-white/80">{code}</pre>
        </div>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? <>{parts}</> : text;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-800 mb-4">Document Analyzer</h1>
        <p className="text-gray-600 max-w-3xl">
          Upload legal documents for AI-powered analysis. Our tool extracts key information,
          summaries, and insights from your documents automatically.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6 md:p-8">
        {/* File Upload Section */}
        <div className="mb-8 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-amber-700 mb-6 flex items-center gap-2 text-center justify-center">
            <FileUp className="h-5 w-5 text-amber-600" />
            Upload Document
          </h2>
          
          <div 
            className={cn(
              "document-drop-zone rounded-xl md:p-12 p-8 transition-all text-center border-2 border-dashed bg-amber-50/50",
              dragging ? "border-amber-400 bg-amber-50/80" : "border-amber-200",
              error ? "border-red-300 bg-red-50" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-6 max-w-md mx-auto py-4">
              {file ? (
                <>
                  <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-lg font-medium text-gray-900">{file.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-20 w-20 rounded-full bg-amber-50 flex items-center justify-center">
                    <FileUp className="h-10 w-10 text-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xl font-medium text-gray-800">
                      Drag and drop your document or click to browse
                    </div>
                    <div className="text-base text-gray-500">
                      Supports {SUPPORTED_FILE_TYPES.map(t => t.name).join(', ')} files
                    </div>
                  </div>
                </>
              )}
              
              {error && (
                <div className="flex items-center text-red-500 text-sm mt-2 bg-red-50 px-4 py-2 rounded-md w-full">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-center mt-6">
  <div className="w-64">
    <label className="block">
      <input 
        type="file" 
        accept={SUPPORTED_FILE_TYPES.map(t => t.extension).join(',')} 
        onChange={handleFileChange}
        className="sr-only"
      />
      <div className="py-3 px-4 bg-amber-500 text-white text-center rounded-md cursor-pointer font-medium hover:bg-amber-600 transition-colors shadow-md">
        Browse Files
      </div>
    </label>
  </div>
  
  {file && (
    <div className="mt-4">
      <button
        onClick={handleAnalyze}
        disabled={isUploading}
        className={cn(
          "analyze-button flex items-center justify-center gap-3 py-3 px-8 rounded-md font-medium transition-colors shadow-sm",
          isUploading 
            ? "bg-amber-100 text-amber-700 cursor-wait border border-amber-300" 
            : "bg-amber-600 hover:bg-amber-700 text-white hover:shadow-md"
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            <span>Analyze Document</span>
          </>
        )}
      </button>
    </div>
  )}
</div>
        </div>
        
        {/* Results Section */}
        {result && (
          <div className="mt-10 border-t border-gray-200 pt-8 document-analysis-section">
            <h2 className="text-xl font-semibold text-amber-700 mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              Analysis Results
            </h2>
            
            <div className="analysis-result-container bg-amber-50/30 rounded-xl p-6 md:p-8">
              <div className="mb-8 bg-white rounded-xl border border-amber-100 shadow-sm p-6">
                <h3 className="text-sm font-medium text-amber-600 uppercase tracking-wide mb-4">Document Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div className="flex flex-col bg-amber-50 p-4 rounded-md border border-amber-100">
                    <span className="font-medium text-amber-900 mb-1">Filename</span>
                    <span className="text-gray-700">{result.filename}</span>
                  </div>
                  <div className="flex flex-col bg-amber-50 p-4 rounded-md border border-amber-100">
                    <span className="font-medium text-amber-900 mb-1">Analyzed</span>
                    <span className="text-gray-700">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {formatAnalysisOutput(result.analysis)}
            </div>
            
            {/* Q&A Section */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-amber-700 mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-600" />
                Ask Questions About This Document
              </h2>
              
              <div className="bg-white rounded-xl border border-amber-100 overflow-hidden shadow-sm">
                {/* Q&A History */}
                <div 
                  ref={qaHistoryRef}
                  className="p-5 max-h-[32rem] overflow-y-auto"
                  style={{ minHeight: qaHistory.length > 0 ? '20rem' : '12rem' }}
                >
                  {qaHistory.length > 0 ? (
                    <div className="space-y-8">
                      {qaHistory.map((qa, index) => (
                        <div key={index} className="space-y-4 qa-message animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border border-amber-200">
                              <span className="text-amber-700 text-xs font-medium">You</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">{qa.question}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(qa.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 mt-3 pl-6">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border border-amber-100">
                              <span className="text-amber-700 text-xs font-medium">AI</span>
                            </div>
                            <div className="flex-1">
                              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 shadow-sm">
                                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                  {qa.answer.includes('```') ? formatCodeSnippets(qa.answer) : qa.answer}
                                </div>
                                {qa.modelUsed && (
                                  <div className="mt-3 pt-2 border-t border-amber-100 text-xs text-amber-600">
                                    {qa.modelUsed.includes('local-search') ? (
                                      <div className="flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                                        <span>Basic search used due to API unavailability</span>
                                      </div>
                                    ) : (
                                      <span>Powered by {qa.modelUsed}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center py-8 px-4 text-gray-500 max-w-md">
                        <MessageSquare className="h-12 w-12 text-amber-300 mx-auto mb-3" />
                        <p className="text-lg font-medium text-amber-700 mb-2">Ask Questions About Your Document</p>
                        <p className="text-sm text-amber-600/70">Get specific insights and clarifications by asking questions related to the analyzed document content.</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Question Input */}
                <div className="border-t border-amber-100 p-4 bg-amber-50/50">
                  {qaError && (
                    <div className="mb-3 text-red-500 text-sm flex items-center bg-red-50 p-3 rounded-lg border border-red-100">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{qaError}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <input
                      ref={questionInputRef}
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleQuestionKeyDown}
                      placeholder="Ask a question about this document..."
                      className="flex-1 border border-amber-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm"
                      disabled={isAskingQuestion}
                    />
                    <button
                      onClick={handleAskQuestion}
                      disabled={isAskingQuestion || !question.trim()}
                      className={cn(
                        "flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-colors shadow-sm",
                        question.trim() && !isAskingQuestion
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "bg-amber-100 text-amber-400 cursor-not-allowed border border-amber-200"
                      )}
                    >
                      {isAskingQuestion ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                      <span>Ask</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 