"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Scale } from 'lucide-react';
import '../i18n'; // Import i18n configuration

// Dynamically import the CaseStatusWrapper with proper context providers
const CaseStatusWrapper = dynamic(
  () => import('./CaseStatusWrapper'),
  { 
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin mr-2">🔄</div>
        <p>Loading Case Status component...</p>
      </div>
    ),
    ssr: false
  }
);

export default function CaseStatusPage(): React.ReactElement {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-800 mb-4">Case Status</h1>
        <p className="text-gray-600 max-w-3xl">
          Check the status of your legal case by entering your Case ID Number and the required CAPTCHA verification.
          Get instant access to case details, hearing dates, and current status.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6">
        <CaseStatusWrapper apiUrl="/api/case-status" />
      </div>
    </div>
  );
} 