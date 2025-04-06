import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import CaseStatusWrapper from './CaseStatusWrapper';

interface CaseStatusAdapterProps {
  apiUrl?: string;
}

export const CaseStatusAdapter: React.FC<CaseStatusAdapterProps> = ({ 
  apiUrl = '/api/case-status' 
}) => {
  const [sessionId, setSessionId] = useState<string>('');
  
  // Add an interceptor to axios to attach session ID to requests
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      // Add session ID to POST requests
      if (config.method === 'post' && config.data instanceof FormData && sessionId) {
        config.data.append('session_id', sessionId);
      }
      return config;
    });
    
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        // Store session ID from response
        if (response.data && response.data.session_id) {
          setSessionId(response.data.session_id);
        }
        return response;
      },
      (error) => {
        toast.error('An error occurred. Please try again.');
        return Promise.reject(error);
      }
    );
    
    // Clean up interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [sessionId]);
  
  return (
    <CaseStatusWrapper apiUrl={apiUrl} />
  );
};

export default CaseStatusAdapter; 