import { useState, useEffect } from 'react';
import { ApiResponse, ApiError } from '@/types';

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): ApiResponse<T> {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const data = await apiCall();
        
        if (mounted) {
          setState({
            data,
            error: null,
            loading: false,
          });
        }
      } catch (error) {
        if (mounted) {
          const apiError = error as ApiError;
          setState({
            data: null,
            error: apiError.message,
            loading: false,
          });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return state;
} 