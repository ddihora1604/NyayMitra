"use client";

import React, { useState, useRef } from 'react';
import { FileUp, AlertCircle, FileText, Upload, Loader2, Send, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from './config';

// Export config for Next.js to recognize this as a dynamic page
export { dynamic, dynamicParams, revalidate } from './config';

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
        // If no headers found, return the raw output
        return <div className="whitespace-pre-wrap">{output}</div>;
      }
      
      return (
        <div className="space-y-6">
          {headers.map((header, i) => (
            <div key={i} className="space-y-2">
              <h3 className="text-lg font-semibold text-amber-800 border-b border-amber-200 pb-2">
                {header.replace(/─{3} (.+) ─{3}/, '$1')}
              </h3>
              <div className="whitespace-pre-wrap text-gray-700 pl-4">
                {sections[i+1]?.trim()}
              </div>
            </div>
          ))}
        </div>
      );
    } catch (error) {
      console.error('Error formatting analysis output:', error);
      // Return raw output if formatting fails
      return <div className="whitespace-pre-wrap">{output}</div>;
    }
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

      <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6">
        {/* File Upload Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-amber-700 mb-4">Upload Document</h2>
          
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-8 transition-all text-center",
              dragging ? "border-amber-400 bg-amber-50" : "border-gray-200 hover:border-amber-300",
              error ? "border-red-300 bg-red-50" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              {file ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">{file.name}</div>
                  <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileUp className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    Drag and drop your document or click to browse
                  </div>
                  <div className="text-xs text-gray-500">
                    Supports {SUPPORTED_FILE_TYPES.map(t => t.name).join(', ')} files
                  </div>
                </>
              )}
              
              {error && (
                <div className="flex items-center text-red-500 text-sm mt-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}
              
              <label className="mt-4 inline-block">
  <input 
    type="file" 
    accept={SUPPORTED_FILE_TYPES.map(t => t.extension).join(',')} 
    onChange={handleFileChange}
    className="hidden" 
  />
  <div className="cursor-pointer py-2 px-4 rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors text-sm font-medium">
    Browse Files
  </div>
</label>

    

            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!file || isUploading}
              className={cn(
                "flex items-center gap-2 py-2 px-6 rounded-md font-medium transition-colors",
                !file ? "bg-gray-300 text-gray-500 cursor-not-allowed" : 
                  isUploading ? "bg-amber-100 text-amber-700 cursor-wait border border-amber-300" : 
                  "bg-amber-600 hover:bg-amber-700 text-white"
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                  <span>Processing Document...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Analyze Document</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Results Section */}
        {result && (
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-amber-700 mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analysis Results
            </h2>
            
            <div className="bg-amber-50 rounded-lg p-6 border border-amber-100">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-amber-500 uppercase">Document Information</h3>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Filename:</span>{' '}
                    <span className="text-gray-600">{result.filename}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Analyzed:</span>{' '}
                    <span className="text-gray-600">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="prose prose-amber max-w-none">
                {formatAnalysisOutput(result.analysis)}
              </div>
            </div>
            
            {/* Q&A Section */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-amber-700 mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Ask Questions
              </h2>
              
              <div className="bg-white rounded-lg border border-amber-100 overflow-hidden">
                {/* Q&A History */}
                <div 
                  ref={qaHistoryRef}
                  className="p-5 max-h-96 overflow-y-auto"
                  style={{ minHeight: qaHistory.length > 0 ? '16rem' : '0' }}
                >
                  {qaHistory.length > 0 ? (
                    <div className="space-y-6">
                      {qaHistory.map((qa, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-amber-700 text-xs font-medium">You</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">{qa.question}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(qa.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 mt-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-gray-700 text-xs font-medium">AI</span>
                            </div>
                            <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                              <div className="whitespace-pre-wrap text-gray-700">{qa.answer}</div>
                              {qa.modelUsed && (
                                <div className="mt-2 text-xs text-gray-500">
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
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Ask questions about your document to get specific insights
                    </div>
                  )}
                </div>
                
                {/* Question Input */}
                <div className="border-t border-amber-100 p-4">
                  {qaError && (
                    <div className="mb-3 text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {qaError}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      ref={questionInputRef}
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleQuestionKeyDown}
                      placeholder="Ask a question about this document..."
                      className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      disabled={isAskingQuestion}
                    />
                    <button
                      onClick={handleAskQuestion}
                      disabled={isAskingQuestion || !question.trim()}
                      className={cn(
                        "flex items-center gap-2 py-2 px-4 rounded-md text-white transition-colors",
                        question.trim() && !isAskingQuestion
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-gray-300 cursor-not-allowed"
                      )}
                    >
                      {isAskingQuestion ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
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