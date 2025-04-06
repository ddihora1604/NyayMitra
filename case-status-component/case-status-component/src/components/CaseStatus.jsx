import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';

// UI Components
const Card = ({ className, children }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

const Input = ({ className, ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const Button = ({ className, children, ...props }) => (
  <button
    className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

const CaseStatus = ({ apiUrl = 'http://your-api-url' }) => {
  const { t } = useTranslation();
  const [cnrNumber, setCnrNumber] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
  const [caseResult, setCaseResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchCaptcha = async () => {
    setIsCaptchaLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/`);
      if (response.data && response.data.captcha_base64) {
        setCaptchaImage(response.data.captcha_base64);
      } else {
        throw new Error('Invalid captcha response');
      }
    } catch (error) {
      setError(t('loading_captcha_failed'));
      toast.error(t('loading_captcha_failed'));
    } finally {
      setIsCaptchaLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!cnrNumber || !captchaInput) {
      toast.error(t('please_fill_all_fields'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setCaseResult(null);

    try {
      const formData = new FormData();
      formData.append('cino', cnrNumber);
      formData.append('captcha', captchaInput);

      const response = await axios.post(`${apiUrl}/submit`, formData);

      if (response.data.success) {
        setCaseResult(response.data.result);
        toast.success(t('case_status_retrieved_successfully'));
        setCnrNumber('');
        setCaptchaInput('');
        await fetchCaptcha();
      } else {
        throw new Error('Failed to fetch case status');
      }
    } catch (error) {
      setError(t('failed_to_fetch_case_status'));
      toast.error(t('failed_to_fetch_case_status'));
      await fetchCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">{t('case_status')}</h1>

        <Card className="p-6">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{t('check_your_case_status')}</h2>
              <p className="text-sm text-gray-600">
                {t('enter_cnr_number')}
              </p>
            </div>

            <div className="space-y-4">
              <Input
                placeholder={t('enter_cnr_number')}
                value={cnrNumber}
                onChange={(e) => setCnrNumber(e.target.value)}
                className="w-full"
              />

              <div className="flex items-center gap-2">
                {isCaptchaLoading ? (
                  <div className="animate-spin text-gray-500">🔄</div>
                ) : captchaImage ? (
                  <img
                    src={`data:image/png;base64,${captchaImage}`}
                    alt="CAPTCHA"
                    className="h-8"
                  />
                ) : (
                  <span className="text-sm text-gray-400">{t('loading')}</span>
                )}
                <Input
                  placeholder={t('enter_captcha')}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  onClick={fetchCaptcha}
                  className="h-8 w-8 flex-shrink-0 p-0 flex items-center justify-center"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!cnrNumber || !captchaInput || isLoading || isCaptchaLoading}
                className="w-full"
              >
                {isLoading ? (
                  <div className="animate-spin mr-2">🔄</div>
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {t('submit')}
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {caseResult && (
              <Card className="p-4 bg-gray-50">
                <h3 className="text-sm font-semibold mb-2">{t('case_status')}</h3>
                <p className="text-sm whitespace-pre-wrap">{caseResult}</p>
              </Card>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">{t('recent_cases')}</h2>
            <p className="text-sm text-gray-600">
              {t('recent_cases_description')}
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">{t('case_statistics')}</h2>
            <p className="text-sm text-gray-600">
              {t('case_statistics_description')}
            </p>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default CaseStatus; 