import { NextRequest, NextResponse } from 'next/server';

// This is a simplified simulation of the captcha generation
function generateCaptcha() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

// Simple function to generate a text-based captcha "image"
// Instead of trying to generate an actual image on the server which requires browser APIs,
// we'll just return the text and let the client handle display
function generateSimpleCaptcha() {
  const captchaText = generateCaptcha();
  
  // Store captcha text in memory and return it directly
  // In a real implementation, you would store this in a session or database
  return {
    text: captchaText,
    // Since we're not generating a real image, we'll skip the base64 encoding
    // The front-end will handle displaying this text in a captcha-like way
  };
}

// In-memory storage for captchas, sessions, and case data
const captchaStore: Record<string, string> = {};
const sessionStore: Record<string, string> = {};

// Simple CNR number validation, real CNR numbers have a specific format
// For example: MHAU01-012345-2023
function validateCNR(cnr: string): boolean {
  // Basic validation for format like STATE[2]COURT[2]-NUMBER[6]-YEAR[4]
  const cnrRegex = /^[A-Z]{2}[A-Z0-9]{2}\d{2}-\d{6}-\d{4}$/;
  return cnrRegex.test(cnr);
}

// Database of mock cases - this would be an actual database in production
interface CaseData {
  caseNumber: string;
  status: string;
  court: string;
  judge: string;
  nextHearingDate: string;
  filingDate: string;
  caseType: string;
  petitioner: string;
  respondent: string;
}

const casesDatabase: Record<string, CaseData> = {
  // High Court cases
  'DLHC01-000123-2023': {
    caseNumber: 'DLHC01-000123-2023',
    status: 'Pending',
    court: 'Delhi High Court',
    judge: 'Hon. Justice R. Singh',
    nextHearingDate: '2023-11-15',
    filingDate: '2023-04-20',
    caseType: 'Civil',
    petitioner: 'Acme Corporation',
    respondent: 'Ministry of Finance'
  },
  'MHHC02-000456-2023': {
    caseNumber: 'MHHC02-000456-2023',
    status: 'In Progress',
    court: 'Mumbai High Court',
    judge: 'Hon. Justice S. Patel',
    nextHearingDate: '2023-10-28',
    filingDate: '2023-02-15',
    caseType: 'Corporate',
    petitioner: 'XYZ Holdings Ltd.',
    respondent: 'ABC Enterprises Pvt. Ltd.'
  },
  
  // Supreme Court cases
  'INSC01-001234-2022': {
    caseNumber: 'INSC01-001234-2022',
    status: 'Scheduled for Hearing',
    court: 'Supreme Court of India',
    judge: 'Hon. Justice A. Kumar',
    nextHearingDate: '2023-11-05',
    filingDate: '2022-09-12',
    caseType: 'Constitutional',
    petitioner: 'State of Karnataka',
    respondent: 'Union of India'
  },
  
  // District Court cases
  'DLDC05-007890-2023': {
    caseNumber: 'DLDC05-007890-2023',
    status: 'Under Review',
    court: 'District Court, Saket',
    judge: 'Hon. Justice M. Sharma',
    nextHearingDate: '2023-11-22',
    filingDate: '2023-05-08',
    caseType: 'Criminal',
    petitioner: 'State',
    respondent: 'John Doe'
  },
  
  // Family Court cases
  'MHFC03-004567-2023': {
    caseNumber: 'MHFC03-004567-2023',
    status: 'Judgment Reserved',
    court: 'Family Court, Mumbai',
    judge: 'Hon. Justice D. Gupta',
    nextHearingDate: '2023-10-30',
    filingDate: '2023-03-17',
    caseType: 'Matrimonial',
    petitioner: 'Jane Smith',
    respondent: 'James Brown'
  },
  
  // Sample property case
  'MPDC04-005678-2022': {
    caseNumber: 'MPDC04-005678-2022',
    status: 'Judgment Reserved',
    court: 'District Court, Indore',
    judge: 'Hon. Justice P. Verma',
    nextHearingDate: '2023-09-18',
    filingDate: '2022-11-05',
    caseType: 'Property',
    petitioner: 'State',
    respondent: 'Municipal Corporation'
  }
};

// Function to retrieve case status by CNR number with fallback to generated data
function getCaseStatusByCNR(cnr: string) {
  // First, check if we have this case in our database
  if (cnr in casesDatabase) {
    const caseData = casesDatabase[cnr];
    
    // Format the output in a consistent manner
    return `Case Number: ${caseData.caseNumber}
Status: ${caseData.status}
Court: ${caseData.court}
Presiding Judge: ${caseData.judge}
Next Hearing Date: ${formatDate(caseData.nextHearingDate)}
Filing Date: ${formatDate(caseData.filingDate)}
Case Type: ${caseData.caseType}
Petitioner: ${caseData.petitioner}
Respondent: ${caseData.respondent}`;
  }
  
  // If the case is not in our database but has valid format, generate data based on CNR
  if (validateCNR(cnr)) {
    // Extract state code and court type from CNR number
    const stateCode = cnr.substring(0, 2);
    const courtType = cnr.substring(2, 4);
    const year = cnr.substring(cnr.length - 4);
    
    // Map state codes to state names
    const stateMap: Record<string, string> = {
      'DL': 'Delhi', 
      'MH': 'Maharashtra', 
      'KA': 'Karnataka',
      'TN': 'Tamil Nadu',
      'WB': 'West Bengal',
      'UP': 'Uttar Pradesh',
      'MP': 'Madhya Pradesh',
      'RJ': 'Rajasthan',
      'IN': 'India', // For Supreme Court
    };
    
    // Map court codes to court types
    const courtMap: Record<string, string> = {
      'HC': 'High Court',
      'DC': 'District Court',
      'FC': 'Family Court',
      'SC': 'Supreme Court',
      'TC': 'Tribunal Court',
      'MC': 'Metropolitan Court'
    };
    
    // Determine state and court
    const state = stateMap[stateCode] || 'Unknown State';
    const court = courtType.includes('HC') ? `${state} High Court` : 
                  courtType.includes('SC') ? 'Supreme Court of India' :
                  courtType.includes('FC') ? `Family Court, ${state}` :
                  courtType.includes('DC') ? `District Court, ${state}` :
                  'Unspecified Court';
    
    // Generate other case details
    const statusOptions = ['Pending', 'In Progress', 'Scheduled for Hearing', 'Under Review', 'Judgment Reserved'];
    const judgeOptions = ['Hon. Justice A. Kumar', 'Hon. Justice S. Patel', 'Hon. Justice R. Singh', 'Hon. Justice M. Sharma', 'Hon. Justice D. Gupta'];
    const caseTypeOptions = ['Civil', 'Criminal', 'Family', 'Property', 'Corporate', 'Constitutional'];
    const petitionerOptions = ['Individual', 'Corporation', 'State', 'Government Body'];
    const respondentOptions = ['Individual', 'Corporation', 'State Government', 'Central Government'];
    
    // Use CNR number as seed for consistent results for the same CNR
    const seed = cnr.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const rand = (arr: string[]) => arr[Math.floor((seed * 13) % arr.length)];
    
    // Generate dates
    const today = new Date();
    const nextHearingDate = new Date(today);
    nextHearingDate.setDate(today.getDate() + ((seed * 7) % 60) + 1); // 1-60 days in the future
    
    const filingYear = parseInt(year);
    const filingMonth = Math.floor((seed * 11) % 12);
    const filingDay = Math.floor((seed * 17) % 28) + 1;
    const filingDate = new Date(filingYear, filingMonth, filingDay);
    
    return `Case Number: ${cnr}
Status: ${rand(statusOptions)}
Court: ${court}
Presiding Judge: ${rand(judgeOptions)}
Next Hearing Date: ${formatDate(nextHearingDate.toISOString().split('T')[0])}
Filing Date: ${formatDate(filingDate.toISOString().split('T')[0])}
Case Type: ${rand(caseTypeOptions)}
Petitioner: ${rand(petitionerOptions)}
Respondent: ${rand(respondentOptions)}`;
  }
  
  // Invalid CNR format
  return null;
}

// Helper function to format dates nicely
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// GET endpoint to fetch a new captcha
export async function GET(request: NextRequest) {
  try {
    // Generate a session ID
    const sessionId = crypto.randomUUID();
    
    // Generate a captcha
    const captcha = generateSimpleCaptcha();
    
    // Store the captcha text
    captchaStore[sessionId] = captcha.text;
    
    // Return the captcha text and session ID
    return NextResponse.json({
      success: true,
      captcha_base64: captcha.text, // Just return the text directly
      session_id: sessionId
    });
  } catch (error) {
    console.error('Error generating captcha:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate captcha' },
      { status: 500 }
    );
  }
}

// POST endpoint to validate the captcha and return case status
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const cino = formData.get('cino') as string;
    const captcha = formData.get('captcha') as string;
    const sessionId = formData.get('session_id') as string;
    
    // Validate inputs
    if (!cino || !captcha) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate the captcha
    const storedCaptcha = captchaStore[sessionId];
    
    if (!storedCaptcha || captcha.toLowerCase() !== storedCaptcha.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Invalid captcha or session expired' },
        { status: 400 }
      );
    }
    
    // Clear the used captcha
    delete captchaStore[sessionId];
    
    // Get case status
    const caseResult = getCaseStatusByCNR(cino.trim());
    
    if (!caseResult) {
      return NextResponse.json(
        { success: false, error: 'Case not found. Please verify the CNR number.' },
        { status: 404 }
      );
    }
    
    // Return the case status
    return NextResponse.json({
      success: true,
      result: caseResult
    });
  } catch (error) {
    console.error('Error processing case status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process case status' },
      { status: 500 }
    );
  }
} 