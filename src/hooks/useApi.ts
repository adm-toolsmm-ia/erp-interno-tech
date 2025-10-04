'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ApiResponse<T> {
  data: T;
  meta: {
    tenantId: string;
    requestId: string;
    timestamp: string;
    version: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface ApiError {
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: Record<string, string[]>;
  };
  meta: {
    tenantId: string;
    requestId: string;
    timestamp: string;
    version: string;
  };
}

interface UseApiOptions {
  headers?: Record<string, string>;
  enabled?: boolean;
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { user } = useAuth();

  const { headers = {}, enabled = true } = options;

  const fetchData = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'x-tenant-id': user?.empresaId || 'empresa-1',
        'x-internal-key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY || 'dev-key',
        ...headers,
      };

      const response = await fetch(endpoint, {
        headers: defaultHeaders,
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        setError(errorData);
        return;
      }

      const result: ApiResponse<T> = await response.json();
      setData(result.data);
    } catch (err) {
      setError({
        error: {
          message: 'Erro de conexão',
          code: 'NETWORK_ERROR',
          statusCode: 0,
        },
        meta: {
          tenantId: 'empresa-1',
          requestId: 'unknown',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

export function useApiPost<T, R>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const { headers = {} } = options;

  const post = async (data: T): Promise<R | null> => {
    setLoading(true);
    setError(null);

    try {
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'x-tenant-id': user?.empresaId || 'empresa-1',
        'x-internal-key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY || 'dev-key',
        ...headers,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        setError(errorData);
        return null;
      }

      const result: ApiResponse<R> = await response.json();
      return result.data;
    } catch (err) {
      setError({
        error: {
          message: 'Erro de conexão',
          code: 'NETWORK_ERROR',
          statusCode: 0,
        },
        meta: {
          tenantId: 'empresa-1',
          requestId: 'unknown',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    post,
    loading,
    error,
  };
}
