# NyayMitra - AI-Driven Legal Assistance Platform

Prototype: 
https://youtu.be/SnLhkuxrAQE?si=LCmbzBFQD5w2_iBg
## Introduction
NyayMitra ("Justice Friend" in Hindi) is an AI-powered legal assistance platform designed to bridge the gap between Indian citizens and legal services. By combining judicial data integration with modern AI capabilities, it provides accessible legal resources, case tracking, document analysis, and lawyer matching services to make the legal system more approachable for everyone.

## Brief Description
A comprehensive legal technology solution that leverages artificial intelligence to simplify legal processes, provide guidance in multiple languages, analyze legal documents, track court cases, and connect users with appropriate legal professionals based on their specific needs.

## Project Overview
NyayMitra addresses the challenges many citizens face when navigating India's complex legal system by providing:

- **Real-time Case Status Tracking**: Integration with Indian court systems to provide up-to-date information on case proceedings
- **AI-Powered Document Analysis**: Natural Language Processing to interpret and explain legal documents
- **Multilingual Support**: Legal guidance in both English and Hindi to improve accessibility
- **Geolocation-Based Lawyer Search**: Connect users with legal professionals based on specialty and location
- **Interactive Process Visualization**: Flowcharts and diagrams to explain legal procedures
- **Legal Chatbot Assistant**: AI-driven conversational interface for answering legal questions
- **Contract Generation**: Template-based legal document creation

The platform is built with a modern tech stack, emphasizing security, scalability, and user experience while making legal assistance more accessible to all segments of society.

## Key Features

1. Legal Advisor
2. Legal Researcher
3. Case Status Tracker
4. Document Analyzer
5. Legal Chatbot
6. Contract Drafting
7. Lawyer Network

## Detailed Component Explanations

### Legal Advisor
The Legal Advisor agent provides expert legal insights tailored to individual or organizational needs. It assists in drafting and reviewing legal documents, offers strategic counsel for dispute resolution, and ensures decisions align with applicable laws. The advisor dynamically references Indian legal frameworks and relevant case laws to deliver contextually accurate guidance.

Key features include:
1. Drafting and validation of legal agreements and notices
2. Real-time compliance checks for business operations
3. Scenario-based legal recommendations
4. Integration with statutory databases for up-to-date legal norms
5. Multilingual support for English and Hindi legal 

### Legal Researcher
The Legal Researcher agent conducts in-depth legal analysis on any topic provided by the user. It leverages advanced NLP and legal information retrieval techniques to deliver comprehensive insights, referencing relevant case laws, statutes, regulations, and academic opinions. Whether it's a broad legal principle or a niche subject, the system compiles detailed, well-structured findings to support legal understanding and decision-making.

The Legal Researcher includes:
1. Deep-dive research on user-defined legal topics
2. Compilation of relevant statutes, judgments, and commentariesStatute comparison across jurisdictions
3. Smart summarization of lengthy legal texts
4. Topic clustering and citation tracking
5. Exportable research reports in structured formats

### Case Status Tracker
The Case Status component integrates with the Indian court system's APIs to fetch real-time case information. It features an automated CAPTCHA solving mechanism using Selenium and ChromeDriver, with a fallback to a simpler CAPTCHA when needed. The component is built with internationalization support (i18n) for both English and Hindi interfaces.

The backend uses FastAPI to create endpoints that handle CNR number validation, CAPTCHA processing, and court data retrieval. The frontend presents this information in an intuitive timeline format, showing the progression of the case through various stages of the judicial process.

### Document Analyzer
This component uses NLP techniques to process legal documents uploaded by users. It can handle various file formats including PDF and text files. The analyzer identifies key clauses, legal terminology, and potential compliance issues within documents.

The system employs a multi-stage processing pipeline:
1. Text extraction from documents
2. Legal entity recognition using custom-trained models
3. Clause classification and categorization
4. Risk assessment based on identified clauses
5. Generation of plain-language summaries

Users can also ask specific questions about the document, with the system providing contextual answers based on the document's content.

### Legal Chatbot
The conversational AI assistant provides guidance on legal matters through a chat interface. It supports both text and voice interactions, with speech recognition capabilities for accessibility. The chatbot is trained on Indian legal frameworks and can provide information on various legal topics.

Key features include:
- Context-aware responses that maintain conversation history
- Integration with legal databases for accurate information
- Clear disclaimers to distinguish between information and legal advice
- Multilingual support with automatic language detection
- Voice input/output for accessibility

### Lawyer Search System
This geolocation-based system helps users find legal professionals based on specialty, location, and experience. It integrates mapping services to visualize lawyer locations and provides filtering options to narrow down search results.

The system includes:
- Verified lawyer profiles with specialization information
- User reviews and ratings
- Distance-based search functionality
- Appointment scheduling capabilities
- Direct messaging between users and lawyers

## Key Concepts and Technologies Used

### Core Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS for responsive UI
- **Backend**: Python 3.11, FastAPI for high-performance API endpoints, Celery for task queuing
- **Database**: PostgreSQL for relational data, Redis for caching
- **AI/ML**: Hugging Face Transformers, SpaCy for NLP tasks
- **Authentication**: JWT-based auth system with role-based access control

### AI Technologies
- **Natural Language Processing**: For document analysis and chatbot functionality
- **Speech Recognition**: For voice input in the legal assistant
- **Machine Learning**: For case outcome prediction and document classification
- **Computer Vision**: For CAPTCHA solving in case status tracking

### External APIs
- **Court APIs**: Integration with Indian judicial system databases
- **Mapping Services**: For lawyer geolocation features
- **Language Models**: Integration with models like Gemini for advanced NLP tasks

## Getting Started

### Prerequisites
- Node.js 18+ for frontend
- Python 3.11 for backend services
- PostgreSQL 15 for database
- Chrome browser (for case status feature)
- Docker and Docker Compose (recommended for easy setup)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/NyayMitra.git
cd NyayMitra

# Frontend setup
npm install

# Backend setup
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

# Return to project root
cd ..

# Create .env file from example
cp .env.example .env
# Edit .env file to add your API keys
```

### Configuration
Create a `.env` file in the project root with the following variables:
```
# API Keys
MAPBOX_API_KEY=your_mapbox_key
GROQ_API_KEY=your_groq_key
SUPREME_COURT_API_KEY=your_court_api_key

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/nyaymitra
REDIS_URL=redis://localhost:6379/0

# Application Settings
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_SPEECH=true
```

### Running the Application

#### Starting the Backend
```bash
# From the backend directory with virtual environment activated
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

#### Starting the Frontend
```bash
# From the project root
npm run dev
```

## System Architecture

```mermaid
graph TD
    User[User] --> Frontend[Next.js Frontend]
    Frontend --> Auth[Authentication]
    Frontend --> Features[Feature Modules]
    
    Features --> LegalAdvisor[Legal Advisor]
    Features --> LegalResearcher[Legal Researcher]
    Features --> CaseTracker[Case Status Tracker]
    Features --> DocAnalyzer[Document Analyzer]
    Features --> LegalChat[Legal Chatbot]
    Features --> LawyerSearch[Lawyer Search]
    Features --> ContractGen[Contract Generator]
    
    LegalAdvisor --> FastAPI
    LegalResearcher --> FastAPI
    CaseTracker --> FastAPI[FastAPI Backend]
    DocAnalyzer --> FastAPI
    LegalChat --> FastAPI
    LawyerSearch --> FastAPI
    ContractGen --> FastAPI
    
    FastAPI --> ExternalAPIs[External APIs]
    FastAPI --> AI[AI/ML Models]
    FastAPI --> DB[(Database)]
    
    ExternalAPIs --> Courts[Court APIs]
    ExternalAPIs --> Maps[Mapping Services]
    
    AI --> NLP[NLP Models]
    AI --> Speech[Speech Recognition]
    AI --> CV[Computer Vision]
    
    DB --> PostgreSQL[(PostgreSQL)]
    DB --> Redis[(Redis Cache)]
```

## Project Directory Structure
```
NyayMitra/
├── app/                 # Next.js application
│   ├── api/             # API routes
│   │   ├── case-status/  # Case status API endpoints
│   │   ├── document-analyzer/ # Document analysis endpoints
│   │   └── find-lawyer/ # Lawyer search endpoints
│   ├── case-status/     # Case status feature
│   ├── chatbot/         # Legal chatbot interface
│   ├── contracts-draft/ # Contract generation
│   ├── dashboard/       # User dashboard
│   ├── document-analyzer/ # Document analysis UI
│   ├── find-lawyer/     # Lawyer search interface
│   ├── legal-assistance/ # Legal assistance hub
│   └── pathway/         # Legal process visualization
├── backend/             # Python services
│   ├── app.py           # FastAPI entrypoint
│   ├── requirements.txt # Python dependencies
│   └── run.sh           # Backend startup script
├── case-status-component/ # CNR lookup UI component
├── components/          # Shared React components
│   ├── legal-assistant/ # Legal assistance components
│   │   ├── ContractDrafting.jsx
│   │   ├── LegalAdvice.jsx
│   │   └── LegalResearch.jsx
│   ├── ui/              # UI component library
│   └── Chatbot.jsx      # Chatbot component
├── lib/                 # Shared utilities
│   ├── hooks/           # Custom React hooks
│   │   ├── useSpeechRecognition.js
│   │   └── useSpeechSynthesis.js
│   └── utils/           # Utility functions
├── public/              # Static assets
└── secrets/             # Configuration files (gitignored)
```
