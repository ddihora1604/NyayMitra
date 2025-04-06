"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, FileText } from 'lucide-react';
import LegalResearch from '@/components/legal-assistant/LegalResearch';
import LegalAdvice from '@/components/legal-assistant/LegalAdvice';

export default function LegalAssistancePage(): React.ReactElement {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-800 mb-4">Legal Assistance</h1>
        <p className="text-gray-600 max-w-3xl">
          Our comprehensive legal assistance services provide AI-powered guidance for your legal needs.
          Use the tools below to research legal topics or get personalized advice.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6">
        <Tabs defaultValue="research" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="research" className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Legal Research</span>
            </TabsTrigger>
            <TabsTrigger value="advice" className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              <span>Legal Advice</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="research">
            <LegalResearch />
          </TabsContent>
          
          <TabsContent value="advice">
            <LegalAdvice />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 