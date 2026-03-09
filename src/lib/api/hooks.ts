'use client';

import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';

export function useApiQuery<T>(queryFn: () => Promise<T>, dependencies: DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const requestIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const nextData = await queryFn();
      if (requestIdRef.current === requestId) {
        setData(nextData);
      }
      return nextData;
    } catch (nextError) {
      if (requestIdRef.current === requestId) {
        setError(nextError);
      }
      throw nextError;
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, dependencies);

  useEffect(() => {
    void refetch().catch(() => undefined);
  }, [refetch]);

  return {
    data,
    setData,
    loading,
    error,
    refetch,
  };
}

export function useApiMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const [loading, setLoading] = useState(false);

  const mutateAsync = useCallback(
    async (variables: TVariables) => {
      setLoading(true);
      try {
        return await mutationFn(variables);
      } finally {
        setLoading(false);
      }
    },
    [mutationFn],
  );

  return {
    loading,
    mutateAsync,
  };
}
