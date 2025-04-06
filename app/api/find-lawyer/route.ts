import { NextRequest, NextResponse } from 'next/server';

// Ensure this route is always dynamically rendered
export const dynamic = 'force-dynamic';

// API keys for external services
const SERPER_API_KEY = "00bed6629055f888ce9b8a4d47d1f17dab6214d7";
const GEMINI_API_KEYS = [
  "AIzaSyABP0FhpPcNotV7TqlUw38Qm0YpAovfoIY",
  "AIzaSyBzB-FbuQimtmUEoaXUwYdGoxUwTXvMO3I"
];

// Track current API key index for rotation
let currentKeyIndex = 0;

// Get next API key for rotation
const getNextApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return GEMINI_API_KEYS[currentKeyIndex];
};

// Sleep function for retries
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const { specialty, location, experience, keywords } = await req.json();
    
    // Construct the search query
    const queryParts = ["Names of lawyers in "];
    if (specialty !== "Any") queryParts.push(specialty);
    if (location !== "Any") queryParts.push(`in ${location}`);
    else queryParts.push("India");
    if (experience !== "Any") queryParts.push(experience);
    if (keywords) queryParts.push(keywords);
    
    const finalQuery = queryParts.join(" ");
    
    // Call Google Search API via Serper
    const serperResponse = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: finalQuery,
        num: 10
      })
    });
    
    if (!serperResponse.ok) {
      throw new Error(`Search API error: ${serperResponse.status}`);
    }
    
    const searchResults = await serperResponse.json();
    
    // Process results with Gemini
    // Create a detailed prompt to extract structured lawyer information
    const prompt = `
You are a legal assistant helping to extract structured information about lawyers from search results.
Your task is to analyze these search results about lawyers and provide PROPERLY FORMATTED HTML with the following information for each lawyer or law firm found:

1. Full name of the lawyer or law firm
2. Area of specialization (if mentioned)
3. Location/address
4. Years of experience (if mentioned)
5. Contact information (if available) - phone, email, website
6. A brief professional summary (2-3 sentences max)

Format your response as clean HTML that can be directly inserted into a webpage, with each lawyer in a separate card layout.
Use appropriate heading tags, lists, and styling classes that would work with Tailwind CSS.

For each lawyer/firm, create a card with:
- Name as h3 heading
- Other details in a structured list
- Contact info with appropriate icons if available
- Summary in a separate paragraph

If search results are vague or don't contain specific lawyer information, format what information is available.
Only include lawyers that appear to be legitimate professionals or firms based on the search results.
Do not include general legal websites, directories, or services unless they specifically mention individual lawyers.

Here are the search results to analyze:
{results}
`;

    let formattedResults = "";
    let apiError = false;
    let retryCount = 0;
    const maxRetries = GEMINI_API_KEYS.length * 2; // Try each key twice
    
    // Try with API key rotation
    while (retryCount <= maxRetries && !formattedResults) {
      try {
        const currentApiKey = GEMINI_API_KEYS[currentKeyIndex];
        
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${currentApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt.replace("{results}", JSON.stringify(searchResults.organic))
                }]
              }]
            })
          }
        );
        
        const geminiData = await geminiResponse.json();
        
        if (geminiData.error) {
          throw new Error(geminiData.error.message || "Gemini API error");
        }
        
        if (!geminiData.candidates || geminiData.candidates.length === 0 || !geminiData.candidates[0].content) {
          throw new Error("Invalid response from Gemini API");
        }
        
        formattedResults = geminiData.candidates[0].content.parts[0].text;
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
        
        // If all retries fail
        apiError = true;
        throw error;
      }
    }
    
    // If we still don't have formatted results after all retries
    if (!formattedResults) {
      // Create a basic fallback response with raw search results
      formattedResults = `
      <div class="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
        <h3 class="text-lg font-semibold text-amber-800">Search Error</h3>
        <p>Our AI assistant couldn't process the search results. Here's what we found from Google:</p>
      </div>
      
      <div class="space-y-4">
        ${searchResults.organic.map((result: any) => `
          <div class="border rounded-lg p-4 shadow-sm">
            <h3 class="text-lg font-semibold">${result.title || 'Unknown'}</h3>
            <p class="text-sm text-gray-500">${result.link || ''}</p>
            <p class="mt-2">${result.snippet || 'No description available'}</p>
          </div>
        `).join('')}
      </div>
      `;
    }
    
    return NextResponse.json({
      query: finalQuery,
      formattedResults,
      rawResults: searchResults.organic,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error finding lawyers:', error.message);
    return NextResponse.json({ 
      error: 'Failed to find lawyers. Please try again.',
      details: error.message 
    }, { status: 500 });
  }
} 