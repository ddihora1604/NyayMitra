'use client';

import React from 'react';
import Chatbot from '../../components/Chatbot';

export default function ChatbotPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-800 mb-4">Legal Assistant Chatbot</h1>
        <p className="text-gray-600 max-w-3xl">
          Ask questions about legal concepts, procedures, or get general guidance on legal matters.
          Our AI assistant can provide information and help you understand legal topics better.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6">
        <Chatbot />
      </div>
      
      <div className="text-xs text-gray-500 mt-4 text-center">
        This assistant provides general information only and not legal advice. Always consult with a qualified legal professional for specific legal matters.
      </div>
    </div>
  );
} 