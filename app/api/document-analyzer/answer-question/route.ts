import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Sleep function for retries
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Multiple API keys for rotation
const API_KEYS = [
  'AIzaSyABP0FhpPcNotV7TqlUw38Qm0YpAovfoIY',
  'AIzaSyBzB-FbuQimtmUEoaXUwYdGoxUwTXvMO3I'
];

// Track last used key index
let currentKeyIndex = 0;

// Get next API key in rotation
const getNextApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return API_KEYS[currentKeyIndex];
};

// Primary and fallback models
const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-flash'; // Fallback to an older model with different quota

// Max tokens to send to prevent overages
const MAX_INPUT_TOKENS = 8000;

// Helper function to truncate text to avoid quota issues
function truncateText(text: string, maxChars = MAX_INPUT_TOKENS * 4) {
  if (text.length <= maxChars) return text;
  
  // Keep beginning and end, truncate middle
  const halfLength = Math.floor(maxChars / 2);
  return text.substring(0, halfLength) + 
    "\n\n[...Content truncated due to length...]\n\n" + 
    text.substring(text.length - halfLength);
}

// Make sure this route is always dynamically rendered
export const dynamic = 'force-dynamic';

// Simple keyword matching fallback when API calls fail
function localKeywordSearch(question: string, documentText: string): string {
  try {
    // Prepare document and question
    const doc = documentText.toLowerCase();
    const q = question.toLowerCase();
    
    // Extract key terms from question (basic)
    const questionWords = q.split(/\s+/)
      .filter(word => word.length > 3)  // Only consider words with 4+ chars
      .filter(word => !['what', 'when', 'where', 'which', 'how', 'does', 'document', 'about'].includes(word));
    
    // Find matching sections
    const matches: {text: string, score: number}[] = [];
    
    // Split document into paragraphs
    const paragraphs = doc.split(/\n\s*\n/);
    
    // Score each paragraph based on keyword matches
    paragraphs.forEach(paragraph => {
      if (paragraph.trim().length < 10) return; // Skip very short paragraphs
      
      let score = 0;
      const originalParagraph = documentText.substring(
        Math.max(0, documentText.toLowerCase().indexOf(paragraph)),
        Math.min(documentText.length, documentText.toLowerCase().indexOf(paragraph) + paragraph.length + 100)
      );
      
      // Score based on question word matches
      questionWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (paragraph.match(regex)) {
          score += 2;
        }
      });
      
      // If score is high enough, add to matches
      if (score > 1) {
        matches.push({
          text: originalParagraph.trim(),
          score
        });
      }
    });
    
    // Sort by score
    matches.sort((a, b) => b.score - a.score);
    
    // Limit to top 3 matches
    const topMatches = matches.slice(0, 3);
    
    if (topMatches.length === 0) {
      return `I couldn't find specific information about "${question}" in the document. You might want to rephrase your question or refer to the document summary above.`;
    }
    
    // Format response
    let response = `Here are some relevant sections from the document that might answer your question:\n\n`;
    
    topMatches.forEach((match, index) => {
      response += `Relevant Section ${index + 1}:\n"${match.text.substring(0, 250)}${match.text.length > 250 ? '...' : ''}"\n\n`;
    });
    
    response += `These sections seem most relevant to your question about "${question}". For more detailed information, please review the document summary above.`;
    
    return response;
  } catch (error) {
    console.error('Error in local search fallback:', error);
    return `I couldn't process your question due to technical limitations. Please try asking a more specific question about the document content.`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { question, documentText } = await req.json();
    
    if (!question || !documentText) {
      return NextResponse.json({ error: 'Question and document text are required' }, { status: 400 });
    }
    
    // Truncate document text if it's too large
    const truncatedText = truncateText(documentText);
    
    // Prepare the user prompt (without using system role)
    // Combine the system prompt and the user prompt into a single user prompt
    const basePrompt = `You are an assistant specializing in document analysis. Your task is to answer questions about a document.
    
Please analyze the following document and answer the user's question:

USER QUESTION: ${question}

DOCUMENT CONTENT:
${truncatedText}

Please provide a detailed and accurate answer based strictly on the document content. If the document doesn't contain information to answer the question, state that clearly.`;
    
    // Variables to track response
    let answer = '';
    let apiKeyUsed = API_KEYS[currentKeyIndex];
    let modelUsed = PRIMARY_MODEL;
    let retryCount = 0;
    const maxRetries = API_KEYS.length * 2; // Try each key twice
    
    // Try with API key rotation
    while (retryCount <= maxRetries && !answer) {
      try {
        if (retryCount > 0) {
          // Rotate API key on retry
          apiKeyUsed = getNextApiKey();
        }
        
        // Initialize with current API key
        const genAI = new GoogleGenerativeAI(apiKeyUsed);
        
        // Choose model based on retry count
        const currentModel = retryCount < API_KEYS.length ? PRIMARY_MODEL : FALLBACK_MODEL;
        const model = genAI.getGenerativeModel({ model: currentModel });
        modelUsed = currentModel;
        
        console.log(`Attempt ${retryCount+1}: Using API key ending in ...${apiKeyUsed.slice(-4)} with model ${currentModel}`);
        
        // Send to Gemini API - avoid using system role
        const result = await model.generateContent({
          contents: [
            { role: 'user', parts: [{ text: basePrompt }] }
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        });
        
        const response = result.response;
        if (!response) {
          throw new Error('Failed to generate answer');
        }
        
        answer = response.text();
        break;
        
      } catch (error: any) {
        console.error(`Error with Gemini API (key ${currentKeyIndex}):`, error.message);
        
        // If it's a quota/rate limit error, rotate API key
        if (error.message.includes('quota') || 
            error.message.includes('429') || 
            error.message.includes('rate') || 
            error.message.includes('limit')) {
          
          retryCount++;
          
          if (retryCount <= maxRetries) {
            // Rotate API key
            getNextApiKey();
            
            // Wait before retry with exponential backoff
            const delay = Math.min(500 * Math.pow(1.5, retryCount), 5000);
            console.log(`Rate limit hit. Rotating API key and waiting ${delay}ms before retry ${retryCount}`);
            await sleep(delay);
            continue;
          }
        } else {
          // For non-quota errors, still try other keys but with smaller delay
          retryCount++;
          getNextApiKey();
          
          if (retryCount <= maxRetries) {
            await sleep(300);
            continue;
          }
        }
        
        // If we reached here, all retries failed
        return NextResponse.json({ 
          error: 'Failed to generate answer after multiple attempts', 
          details: error.message
        }, { status: 500 });
      }
    }
    
    if (!answer) {
      return NextResponse.json({ 
        error: 'Failed to generate answer after all retry attempts'
      }, { status: 500 });
    }
    
    // Return the answer with metadata
    return NextResponse.json({
      answer,
      timestamp: new Date().toISOString(),
      modelUsed
    });
    
  } catch (error: any) {
    console.error('Answer generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to process your question',
      details: error.message 
    }, { status: 500 });
  }
} 