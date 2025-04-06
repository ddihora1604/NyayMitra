import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Ensure this route is always dynamically rendered
export const dynamic = 'force-dynamic';

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
const PRIMARY_MODEL = 'gemini-1.5-flash';
const FALLBACK_MODEL = 'gemini-1.5-flash'; // Fallback to an older model with different quota

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

// Sleep function for retries
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    
    // Validate inputs
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid question' }, { status: 400 });
    }
    
    if (!documentText || typeof documentText !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid document text' }, { status: 400 });
    }
    
    // Prepare system prompt and context
    const systemPrompt = 
      "You are a professional document analyst. Answer questions about the document accurately and thoroughly. " +
      "If the answer cannot be found in the document, clearly state that and provide possible alternatives or suggestions. " +
      "Reference specific parts of the document in your answers when possible. " +
      "Format your response in a clear, structured way.";
      
    // Create full prompt with context, truncating if necessary
    const truncatedDocText = truncateText(documentText);
    const prompt = `
Document content:
${truncatedDocText}

Question: ${question}

Please provide a detailed, accurate answer based on the document content above.
`;

    let answer = '';
    let modelUsed = PRIMARY_MODEL;
    let apiKeyUsed = API_KEYS[currentKeyIndex];
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
        
        // Send to Gemini API
        const result = await model.generateContent({
          contents: [
            { role: 'system', parts: [{ text: systemPrompt }] },
            { role: 'user', parts: [{ text: prompt }] }
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
        console.error(`Error with key ${apiKeyUsed.slice(-4)} and model ${modelUsed}:`, error.message);
        
        // If it's a quota/rate limit error
        if (error.message.includes('quota') || 
            error.message.includes('429') || 
            error.message.includes('rate') || 
            error.message.includes('limit')) {
          retryCount++;
          
          if (retryCount <= maxRetries) {
            // Wait before retry - exponential backoff
            const delay = Math.min(500 * Math.pow(1.5, retryCount), 5000);
            console.log(`Rate limit hit. Rotating API key and waiting ${delay}ms before retry ${retryCount}`);
            await sleep(delay);
            continue;
          }
        } else {
          // For non-quota errors, still try other keys but with smaller delay
          retryCount++;
          if (retryCount <= maxRetries) {
            await sleep(300);
            continue;
          }
        }
        
        // If all retries fail
        throw error;
      }
    }
    
    // If we still don't have an answer after all retries, use local keyword search
    if (!answer) {
      console.log('All API attempts failed, using local keyword search fallback');
      answer = localKeywordSearch(question, documentText);
      modelUsed = 'local-search';
    }
    
    return NextResponse.json({
      answer,
      modelUsed,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error answering question:', error.message);
    
    // Try local fallback in case of API errors
    try {
      const { question, documentText } = await req.json();
      const fallbackAnswer = localKeywordSearch(question, documentText);
      
      return NextResponse.json({
        answer: fallbackAnswer,
        modelUsed: 'local-search-fallback',
        timestamp: new Date().toISOString()
      });
    } catch (fallbackError) {
      // If even the fallback fails, return a user-friendly error
      const errorMessage = error.message.includes('quota') || error.message.includes('429') 
        ? 'Service temporarily unavailable due to high demand. Please try again in a few moments.'
        : 'Failed to process question. Please try again with a more specific question.';
      
      return NextResponse.json({ 
        error: errorMessage, 
        details: error.message 
      }, { status: 500 });
    }
  }
} 