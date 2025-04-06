import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { Toaster } from 'sonner';
import axios from 'axios';
import { AlertTriangle, Search, RefreshCw, Clock, FileText, Gavel, Calendar, User, Users } from 'lucide-react';

// Original CaseStatus component
const OriginalCaseStatus = dynamic(
  () => import('../../case-status-component/case-status-component/src/components/CaseStatus'),
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

interface CaseStatusWrapperProps {
  apiUrl: string;
}

// Custom captcha display component to handle our text-based captcha
const TextCaptcha: React.FC<{ captchaText: string }> = ({ captchaText }) => {
  return (
    <div 
      className="inline-block bg-gray-100 px-4 py-2 rounded border border-gray-300"
      style={{
        fontFamily: 'monospace',
        letterSpacing: '2px',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
        background: 'linear-gradient(to bottom, #f9f9f9, #e9e9e9)',
      }}
    >
      {captchaText}
    </div>
  );
};

// Component to display a field in the case status
const CaseStatusField: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ 
  icon, label, value 
}) => (
  <div className="flex items-start mb-3">
    <div className="text-amber-600 mr-3 mt-0.5">{icon}</div>
    <div>
      <div className="text-sm font-semibold text-gray-600">{label}</div>
      <div className="text-base">{value}</div>
    </div>
  </div>
);

// This wrapper provides all necessary context providers and handles the API interaction
const CaseStatusWrapper: React.FC<CaseStatusWrapperProps> = ({ apiUrl }) => {
  const [captchaText, setCaptchaText] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [caseResult, setCaseResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cnrNumber, setCnrNumber] = useState<string>('');
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [parsedCaseData, setParsedCaseData] = useState<Record<string, string> | null>(null);
  
  // Parse case result into structured data
  useEffect(() => {
    if (caseResult) {
      const lines = caseResult.trim().split('\n');
      const data: Record<string, string> = {};
      
      lines.forEach(line => {
        const parts = line.split(': ');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join(': ').trim();
          data[key] = value;
        }
      });
      
      setParsedCaseData(data);
    } else {
      setParsedCaseData(null);
    }
  }, [caseResult]);
  
  // Function to fetch captcha
  const fetchCaptcha = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(apiUrl);
      if (response.data && response.data.success) {
        setCaptchaText(response.data.captcha_base64);
        setSessionId(response.data.session_id);
      } else {
        throw new Error('Invalid captcha response');
      }
    } catch (error) {
      setError('Failed to load captcha');
      console.error('Error fetching captcha:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle form submission
  const handleSubmit = async () => {
    if (!cnrNumber || !captchaInput) {
      setError('Please fill all fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCaseResult(null);
    setParsedCaseData(null);
    
    try {
      const formData = new FormData();
      formData.append('cino', cnrNumber);
      formData.append('captcha', captchaInput);
      formData.append('session_id', sessionId);
      
      const response = await axios.post(apiUrl, formData);
      
      if (response.data && response.data.success) {
        setCaseResult(response.data.result);
        setCaptchaInput('');
        // Fetch a new captcha after successful submission
        await fetchCaptcha();
      } else {
        throw new Error(response.data.error || 'Failed to fetch case status');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch case status';
      setError(errorMessage);
      await fetchCaptcha();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch captcha on component mount
  useEffect(() => {
    fetchCaptcha();
  }, []);
  
  return (
    <I18nextProvider i18n={i18n}>
      <div>
        <Toaster position="top-right" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Check Your Case Status</h2>
              <p className="text-sm text-gray-600">
                Enter your Case Number (CNR) and the captcha to check the status
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-sm">
                <p className="font-medium">Format for CNR Number:</p>
                <p className="text-gray-600 mt-1">STATE[2]COURT[2]-NUMBER[6]-YEAR[4]</p>
                <p className="text-gray-600 mt-1">Example: DLHC01-000123-2023 (Delhi High Court)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="cnr-input" className="text-sm font-medium text-gray-700">
                  CNR Number
                </label>
                <input
                  id="cnr-input"
                  type="text"
                  placeholder="Enter CNR Number (e.g., DLHC01-000123-2023)"
                  value={cnrNumber}
                  onChange={(e) => setCnrNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="captcha-input" className="text-sm font-medium text-gray-700">
                  Captcha Verification
                </label>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <div className="animate-spin text-gray-500 p-2">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                  ) : captchaText ? (
                    <TextCaptcha captchaText={captchaText} />
                  ) : (
                    <span className="text-sm text-gray-400">Loading...</span>
                  )}
                  <input
                    id="captcha-input"
                    type="text"
                    placeholder="Enter Captcha"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={fetchCaptcha}
                    className="h-10 w-10 flex-shrink-0 p-0 flex items-center justify-center text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                    aria-label="Refresh captcha"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!cnrNumber || !captchaInput || isLoading}
                className="w-full px-4 py-2 text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Search className="h-4 w-4 mr-2" />
                    <span>Search Case Status</span>
                  </div>
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 p-4 rounded-md border border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                  {error.includes('Case not found') && (
                    <p className="text-xs text-red-600 mt-1">
                      Please verify your CNR number format is correct, e.g., DLHC01-000123-2023.
                    </p>
                  )}
                </div>
              </div>
            )}

            {parsedCaseData && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
                  <h3 className="font-semibold text-amber-800">Case Status Details</h3>
                  <p className="text-sm text-amber-700">
                    Case Number: {parsedCaseData['Case Number']}
                  </p>
                </div>
                
                <div className="p-6 grid gap-6">
                  <div className="bg-amber-50 rounded-md p-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-amber-800">Current Status</div>
                      <div className="text-lg font-semibold text-amber-900">{parsedCaseData['Status']}</div>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <CaseStatusField 
                      icon={<Gavel className="h-5 w-5" />}
                      label="Court"
                      value={parsedCaseData['Court']}
                    />
                    
                    <CaseStatusField 
                      icon={<User className="h-5 w-5" />}
                      label="Presiding Judge"
                      value={parsedCaseData['Presiding Judge']}
                    />
                    
                    <CaseStatusField 
                      icon={<Calendar className="h-5 w-5" />}
                      label="Next Hearing Date"
                      value={parsedCaseData['Next Hearing Date']}
                    />
                    
                    <CaseStatusField 
                      icon={<Calendar className="h-5 w-5" />}
                      label="Filing Date"
                      value={parsedCaseData['Filing Date']}
                    />
                    
                    <CaseStatusField 
                      icon={<FileText className="h-5 w-5" />}
                      label="Case Type"
                      value={parsedCaseData['Case Type']}
                    />
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 grid sm:grid-cols-2 gap-6">
                    <CaseStatusField 
                      icon={<User className="h-5 w-5" />}
                      label="Petitioner"
                      value={parsedCaseData['Petitioner']}
                    />
                    
                    <CaseStatusField 
                      icon={<Users className="h-5 w-5" />}
                      label="Respondent"
                      value={parsedCaseData['Respondent']}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {!parsedCaseData && !error && !isLoading && (
              <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Enter your CNR number</h3>
                <p className="text-gray-500 text-sm">
                  Enter your Case Number (CNR) in the format STATE[2]COURT[2]-NUMBER[6]-YEAR[4]
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-2">Sample CNR Numbers</h2>
                <div className="space-y-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded font-mono">DLHC01-000123-2023</div>
                  <div className="bg-gray-50 p-2 rounded font-mono">MHHC02-000456-2023</div>
                  <div className="bg-gray-50 p-2 rounded font-mono">INSC01-001234-2022</div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-2">Case Status Guide</h2>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold">Pending:</span> Case is awaiting listing</p>
                  <p><span className="font-semibold">In Progress:</span> Case is being heard</p>
                  <p><span className="font-semibold">Scheduled:</span> Date is fixed for hearing</p>
                  <p><span className="font-semibold">Reserved:</span> Judgment is being prepared</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </I18nextProvider>
  );
};

export default CaseStatusWrapper; 