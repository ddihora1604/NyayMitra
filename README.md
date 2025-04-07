# NyayMitra - An AI-driven Legal Service Provider Platform

A comprehensive legal assistance platform designed to help users navigate complex legal issues, find legal professionals, and get guidance on various legal scenarios.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Key Components](#key-components)
- [Pages](#pages)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Overview

This platform provides various tools and resources for users seeking legal assistance. From interactive flowcharts guiding legal pathways to lawyer search functionality and legal document analysis, the system offers comprehensive support for those navigating legal issues.

## Features

- **Dashboard**: Central hub with overview of all platform features
- **Legal Pathways**: Interactive flowcharts showing step-by-step guidance for common legal scenarios
- **Find Lawyer**: Search for lawyers by location and specialty with interactive map
- **Legal Assistant Chatbot**: AI-powered chatbot providing legal information and guidance
- **Document Analyzer**: Tool to analyze legal documents and extract key information
- **Case Status Tracking**: Monitor the progress of legal cases
- **Contracts Drafting**: Templates and guidance for drafting legal contracts
- **News & Insights**: Latest legal news and analysis

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone [repository-url]
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in:
   - API keys for services like GROQ, Mapbox, etc.

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## Key Components

### Legal Pathway Guide

The Legal Pathway component provides interactive flowcharts for different legal scenarios, helping users understand the steps involved in resolving common legal issues.

Key features:
- Multiple categories of legal scenarios
- Interactive flowcharts with draggable nodes
- Step-by-step guidance with detailed information
- Visual differentiation of decision points and actions

### Lawyer Search with Map

Find lawyers based on location and specialty with an interactive map interface.

Key features:
- Searchable directory of legal professionals
- Map-based visualization of lawyer locations
- Filtering by specialty, experience, and location
- Detailed lawyer profiles with contact information

### Legal Assistant Chatbot

AI-powered conversational interface for answering legal questions.

Key features:
- Natural language processing for legal queries
- Speech recognition for voice input
- Text-to-speech for audible responses
- Multi-language support

## Pages

### Dashboard (`/dashboard`)
The main landing page after login, providing access to all platform features.

### Legal Pathway (`/pathway`)
Interactive flowcharts for different legal scenarios.

### Find Lawyer (`/find-lawyer`)
Search for legal professionals with map-based results.

### Chatbot (`/chatbot`)
AI assistant for legal questions and guidance.

### Document Analyzer (`/document-analyzer`)
Tool for analyzing legal documents.

### Case Status (`/case-status`)
Track progress of legal cases.

### Contracts Draft (`/contracts-draft`)
Templates and guidance for legal contracts.

### News & Insights (`/news-insights`)
Latest legal news and analysis.

## Technologies Used

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Maps**: Leaflet
- **Flowcharts**: React Flow (@xyflow/react)
- **UI Components**: Radix UI, Lucide React (icons)
- **AI Integration**: GROQ API
- **Data Visualization**: Various React libraries

## Project Structure

```
/
├── app/                     # Next.js 13+ app directory
│   ├── api/                 # API routes
│   ├── chatbot/             # Legal chatbot page
│   ├── dashboard/           # Dashboard page
│   ├── document-analyzer/   # Document analysis page
│   ├── find-lawyer/         # Lawyer search page
│   ├── pathway/             # Legal pathway page
│   └── ...
├── components/              # Reusable React components
│   ├── ui/                  # UI components
│   ├── LawyerSearchMap.tsx  # Map component for lawyer search
│   ├── Chatbot.jsx          # Chatbot component
│   └── ...
├── lib/                     # Utility functions and helpers
├── public/                  # Static assets
├── category.js              # Category definitions for pathway
├── Flow.jsx                 # Flow chart component
└── ...
```

## Contributing

1. Create a branch for your feature
2. Make your changes
3. Submit a pull request with a clear description of the changes

---

Built with ❤️ for making legal assistance more accessible to everyone. 