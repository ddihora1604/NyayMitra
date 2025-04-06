'use client';

import React from 'react';
import Chatbot from '../../components/Chatbot';
import { MessageSquare } from 'lucide-react';

export default function ChatbotPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-800 mb-4 flex items-center gap-3">
          <MessageSquare className="text-amber-600" />
          Legal Assistant Chatbot
        </h1>
        <p className="text-gray-600 max-w-3xl mb-2">
          Ask questions about legal concepts, procedures, or get general guidance on legal matters.
          Our AI assistant can provide information and help you understand legal topics better.
        </p>
        <p className="text-amber-700 text-sm font-medium">
          You can use the microphone button to speak your questions and hear responses read aloud.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6 md:p-8">
        <Chatbot />
      </div>
      
      <div className="text-xs text-gray-500 mt-4 text-center px-4 py-2 bg-amber-50 rounded-lg border border-amber-100 max-w-3xl mx-auto">
        <p className="font-medium text-amber-800 mb-1">Important Notice</p>
        <p>This assistant provides general information only and not legal advice. Always consult with a qualified legal professional for specific legal matters.</p>
      </div>
    </div>
  );
} 