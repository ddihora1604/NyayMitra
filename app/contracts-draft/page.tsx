"use client";

import React from 'react';
import ContractDrafting from '@/components/legal-assistant/ContractDrafting';

export default function ContractsDraftPage(): React.ReactElement {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-800 mb-4">Contracts Draft</h1>
        <p className="text-gray-600 max-w-3xl">
          Use our AI-powered contract drafting tool to generate customized legal contracts based on your specific requirements.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6">
        <ContractDrafting />
      </div>
    </div>
  );
} 