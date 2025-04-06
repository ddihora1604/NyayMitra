import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, Clock, FileText, Gavel, RefreshCw, Search, User, Users } from 'lucide-react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n';

interface CaseStatusWrapperProps {
  apiUrl?: string; // Made optional as we'll use fixed endpoints
}

// Helper component for displaying individual case fields
const CaseStatusField: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string;
}> = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-600">{label}</div>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
};

// Component to display a captcha challenge
const TextCaptcha: React.FC<{ captchaText: string }> = ({ captchaText }) => {
  return (
    <div className="p-2 bg-white border border-gray-200 rounded-md overflow-hidden">
      <img 
        src={`data:image/png;base64,${captchaText}`}
        alt="CAPTCHA"
        className="max-h-full"
      />
    </div>
  );
};

// Component to display the case status result in a structured format
const CaseStatusResult: React.FC<{ caseData: Record<string, string> }> = ({ caseData }) => {
  const { t } = useTranslation();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md p-6 border border-amber-100 mb-6"
    >
      <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-amber-600" />
        {t('caseStatus.caseInfoTitle')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <CaseStatusField 
            icon={<FileText size={18} />} 
            label={t('caseStatus.fields.caseNumber')} 
            value={caseData['Case Number'] || t('caseStatus.notAvailable')} 
          />
          
          <CaseStatusField 
            icon={<Gavel size={18} />} 
            label={t('caseStatus.fields.status')} 
            value={caseData['Status'] || t('caseStatus.notAvailable')} 
          />
          
          <CaseStatusField 
            icon={<Gavel size={18} />} 
            label={t('caseStatus.fields.court')} 
            value={caseData['Court'] || t('caseStatus.notAvailable')} 
          />
          
          <CaseStatusField 
            icon={<User size={18} />} 
            label={t('caseStatus.fields.judge')} 
            value={caseData['Presiding Judge'] || t('caseStatus.notAvailable')} 
          />
        </div>
        
        <div className="space-y-4">
          <CaseStatusField 
            icon={<Calendar size={18} />} 
            label={t('caseStatus.fields.nextHearing')} 
            value={caseData['Next Hearing Date'] || t('caseStatus.notAvailable')} 
          />
          
          <CaseStatusField 
            icon={<Calendar size={18} />} 
            label={t('caseStatus.fields.filingDate')} 
            value={caseData['Filing Date'] || t('caseStatus.notAvailable')} 
          />
          
          <CaseStatusField 
            icon={<FileText size={18} />} 
            label={t('caseStatus.fields.caseType')} 
            value={caseData['Case Type'] || t('caseStatus.notAvailable')} 
          />
          
          <CaseStatusField 
            icon={<Users size={18} />} 
            label={t('caseStatus.fields.parties')} 
            value={`${caseData['Petitioner'] || t('caseStatus.notAvailable')} vs. ${caseData['Respondent'] || t('caseStatus.notAvailable')}`} 
          />
        </div>
      </div>
    </motion.div>
  );
};

// This wrapper provides all necessary context providers and handles the API interaction
const CaseStatusWrapper: React.FC<CaseStatusWrapperProps> = () => {
  const { t } = useTranslation();
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [cnrNumber, setCnrNumber] = useState<string>('');
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [captchaLoading, setCaptchaLoading] = useState<boolean>(true);
  const [parsedCaseData, setParsedCaseData] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch captcha image
  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/captcha');
      if (response.data && response.data.success) {
        setCaptchaImage(response.data.captcha_base64);
        setSessionId(response.data.session_id);
      } else {
        setError('Failed to load CAPTCHA');
      }
    } catch (error) {
      setError('Failed to load CAPTCHA');
    } finally {
      setCaptchaLoading(false);
    }
  };

  // Fetch captcha on component mount
  useEffect(() => {
    fetchCaptcha();
  }, []);

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!cnrNumber || !captchaInput) {
      setError('Please fill all fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setParsedCaseData(null);
    
    try {
      const response = await axios.post('http://localhost:8000/search', {
        cnr: cnrNumber,
        captcha: captchaInput,
        session_id: sessionId
      });
      
      if (response.data && response.data.success) {
        // Parse and set the structured case data
        setParsedCaseData(response.data.data);
        
        // Clear captcha input and get a new captcha
        setCaptchaInput('');
        await fetchCaptcha();
        
        // Show success toast
        toast.success('Case status retrieved successfully');
      } else {
        throw new Error(response.data.error || 'Failed to fetch case status');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch case status';
      setError(errorMessage);
      toast.error(errorMessage);
      await fetchCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-amber-100">
            <h3 className="text-lg font-semibold text-amber-800 mb-4">{t('caseStatus.title')}</h3>
            
            <div className="mb-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md">
              <h4 className="text-sm font-semibold text-amber-800 mb-1">CNR Number Format:</h4>
              <p className="text-sm text-amber-700">
                STATE[2]COURT[2]DIGIT[2]-NUMBER[6]-YEAR[4]
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Example: DLHC01-000123-2023 (Delhi High Court)
              </p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label htmlFor="cnr-number" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('caseStatus.cnrLabel')}
                </label>
                <input
                  id="cnr-number"
                  type="text"
                  value={cnrNumber}
                  onChange={(e) => setCnrNumber(e.target.value.toUpperCase())}
                  placeholder={t('caseStatus.cnrPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('caseStatus.captchaLabel')}
                </label>
                <div className="bg-gray-50 rounded-md border border-gray-200 p-4 flex flex-col md:flex-row items-center gap-4">
                  <div className="min-w-[140px] h-12 flex-shrink-0 flex items-center justify-center">
                    {captchaLoading ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />
                      </div>
                    ) : captchaImage ? (
                      <img 
                        src={`data:image/png;base64,${captchaImage}`}
                        alt="CAPTCHA"
                        className="h-full object-contain"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">Loading...</span>
                    )}
                  </div>
                  
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder={t('caseStatus.captchaPlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      disabled={isLoading || captchaLoading}
                    />
                  </div>
                  
                  <button
                    onClick={fetchCaptcha}
                    className="flex-shrink-0 p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-md transition-colors"
                    disabled={isLoading || captchaLoading}
                    aria-label={t('caseStatus.refreshCaptcha')}
                    title={t('caseStatus.refreshCaptcha')}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || captchaLoading || !cnrNumber || !captchaInput}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-white transition-colors ${
                    isLoading || captchaLoading || !cnrNumber || !captchaInput
                      ? 'bg-amber-300 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>{t('caseStatus.processing')}</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      <span>{t('caseStatus.searchButton')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Case Result Display */}
          {parsedCaseData && (
            <CaseStatusResult caseData={parsedCaseData} />
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 p-4 rounded-md border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">{t('caseStatus.errorTitle')}</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {!parsedCaseData && !error && !isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-md p-6 border border-amber-100 text-center"
            >
              <div className="text-amber-500 mb-2">
                <Search className="h-10 w-10 mx-auto opacity-40" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">{t('caseStatus.noResultsTitle')}</h3>
              <p className="text-sm text-gray-500">
                {t('caseStatus.noResultsDesc')}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Wrapper with i18n provider
const CaseStatusWrapperWithI18n: React.FC<CaseStatusWrapperProps> = (props) => {
  return (
    <I18nextProvider i18n={i18n}>
      <CaseStatusWrapper {...props} />
    </I18nextProvider>
  );
};

export default CaseStatusWrapperWithI18n; 