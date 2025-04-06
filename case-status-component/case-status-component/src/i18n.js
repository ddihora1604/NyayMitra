import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      case_status: 'Case Status',
      check_your_case_status: 'Check Your Case Status',
      enter_cnr_number: 'Enter your CNR number to check its current status',
      loading_captcha_failed: 'Failed to load CAPTCHA',
      please_fill_all_fields: 'Please fill in all fields',
      case_status_retrieved_successfully: 'Case status retrieved successfully',
      failed_to_fetch_case_status: 'Failed to fetch case status',
      enter_cnr_number: 'Enter CNR Number',
      enter_captcha: 'Enter CAPTCHA',
      submit: 'Submit',
      loading: 'Loading...',
      recent_cases: 'Recent Cases',
      recent_cases_description: 'View your recently checked cases',
      case_statistics: 'Case Statistics',
      case_statistics_description: 'Overview of case processing statistics'
    }
  },
  hi: {
    translation: {
      case_status: 'केस स्थिति',
      check_your_case_status: 'अपनी केस स्थिति जांचें',
      enter_cnr_number: 'अपनी केस की वर्तमान स्थिति जांचने के लिए CNR नंबर दर्ज करें',
      loading_captcha_failed: 'CAPTCHA लोड करने में विफल',
      please_fill_all_fields: 'कृपया सभी फ़ील्ड भरें',
      case_status_retrieved_successfully: 'केस स्थिति सफलतापूर्वक प्राप्त की गई',
      failed_to_fetch_case_status: 'केस स्थिति प्राप्त करने में विफल',
      enter_cnr_number: 'CNR नंबर दर्ज करें',
      enter_captcha: 'कैप्चा दर्ज करें',
      submit: 'जमा करें',
      loading: 'लोड हो रहा है...',
      recent_cases: 'हाल के केस',
      recent_cases_description: 'अपने हाल ही में जांचे गए केस देखें',
      case_statistics: 'केस आंकड़े',
      case_statistics_description: 'केस प्रसंस्करण आंकड़ों का अवलोकन'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 