import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize i18next with minimal configuration
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          'caseStatus': {
            'title': 'Case Status Search',
            'cnrLabel': 'CNR Number',
            'cnrPlaceholder': 'Enter CNR number',
            'captchaLabel': 'CAPTCHA Verification',
            'captchaPlaceholder': 'Enter CAPTCHA text',
            'searchButton': 'Search Case Status',
            'processing': 'Processing...',
            'refreshCaptcha': 'Refresh CAPTCHA',
            'errorTitle': 'Error',
            'noResultsTitle': 'No Case Information',
            'noResultsDesc': 'Enter a CNR number and complete the CAPTCHA to view case details',
            'caseInfoTitle': 'Case Information',
            'notAvailable': 'N/A',
            'fields': {
              'caseNumber': 'Case Number',
              'status': 'Status',
              'court': 'Court',
              'judge': 'Presiding Judge',
              'nextHearing': 'Next Hearing Date',
              'filingDate': 'Filing Date',
              'caseType': 'Case Type',
              'parties': 'Parties'
            }
          }
        }
      },
      hi: {
        translation: {
          'caseStatus': {
            'title': 'केस स्थिति खोज',
            'cnrLabel': 'सीएनआर नंबर',
            'cnrPlaceholder': 'सीएनआर नंबर दर्ज करें',
            'captchaLabel': 'कैप्चा सत्यापन',
            'captchaPlaceholder': 'कैप्चा टेक्स्ट दर्ज करें',
            'searchButton': 'केस स्थिति खोजें',
            'processing': 'प्रसंस्करण हो रहा है...',
            'refreshCaptcha': 'कैप्चा रिफ्रेश करें',
            'errorTitle': 'त्रुटि',
            'noResultsTitle': 'कोई केस जानकारी नहीं',
            'noResultsDesc': 'केस विवरण देखने के लिए एक सीएनआर नंबर दर्ज करें और कैप्चा पूरा करें',
            'caseInfoTitle': 'केस की जानकारी',
            'notAvailable': 'उपलब्ध नहीं',
            'fields': {
              'caseNumber': 'केस नंबर',
              'status': 'स्थिति',
              'court': 'न्यायालय',
              'judge': 'प्रधान न्यायाधीश',
              'nextHearing': 'अगली सुनवाई तिथि',
              'filingDate': 'दाखिल करने की तिथि',
              'caseType': 'केस प्रकार',
              'parties': 'पक्षकार'
            }
          }
        }
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 