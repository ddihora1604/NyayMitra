import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Page and section titles
      case_status: 'Case Status',
      check_your_case_status: 'Check Your Case Status',
      case_details: 'Case Details',
      next_hearing: 'Next Hearing',
      case_history: 'Case History',
      
      // Form fields
      enter_cnr_number: 'Enter CNR Number',
      enter_captcha: 'Enter Captcha',
      submit: 'Submit',
      search_case_status: 'Search Case Status',
      
      // Status messages
      loading: 'Loading...',
      processing: 'Processing...',
      please_fill_all_fields: 'Please fill all fields',
      case_status_retrieved_successfully: 'Case status retrieved successfully',
      failed_to_fetch_case_status: 'Failed to fetch case status',
      loading_captcha_failed: 'Loading captcha failed',
      case_not_found: 'Case not found. Please verify the CNR number.',
      invalid_captcha: 'Invalid captcha. Please try again.',
      session_expired: 'Your session has expired. Please try again.',
      
      // Case information fields
      status: 'Status',
      court: 'Court',
      judge: 'Presiding Judge',
      next_hearing_date: 'Next Hearing Date',
      filing_date: 'Filing Date',
      case_type: 'Case Type',
      petitioner: 'Petitioner',
      respondent: 'Respondent',
      
      // Case status values
      status_pending: 'Pending',
      status_in_progress: 'In Progress',
      status_scheduled: 'Scheduled for Hearing',
      status_under_review: 'Under Review',
      status_reserved: 'Judgment Reserved',
      status_closed: 'Closed',
      
      // Help text
      cnr_format_help: 'Format: STATE[2]COURT[2]-NUMBER[6]-YEAR[4]',
      cnr_example: 'Example: DLHC01-000123-2023 (Delhi High Court)',
      
      // Info sections
      recent_cases: 'Recent Cases',
      recent_cases_description: 'View your recently searched cases for quick access',
      case_statistics: 'Case Statistics',
      case_statistics_description: 'View statistics about court cases in your jurisdiction',
      sample_cnr_numbers: 'Sample CNR Numbers',
      case_status_guide: 'Case Status Guide'
    }
  }
};

// Create a function to initialize i18n
// This prevents multiple initializations during SSR
const initI18n = () => {
  // Check if i18n is already initialized
  if (i18n.isInitialized) return i18n;
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false // React already escapes values
      },
      // Added to avoid issues with SSR
      react: {
        useSuspense: false
      }
    });
    
  return i18n;
};

export default initI18n(); 