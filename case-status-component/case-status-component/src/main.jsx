import React from 'react';
import ReactDOM from 'react-dom/client';
import CaseStatus from './components/CaseStatus';
import './i18n';
import { Toaster } from 'sonner';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CaseStatus apiUrl="http://your-api-url" />
    <Toaster />
  </React.StrictMode>
); 