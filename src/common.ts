import { useEffect, useState, useCallback } from 'react';
import http, { CancelToken } from 'axios';
import { useAuthentication } from './authentication';
import { AuthenticatedHttpOptions } from './api';

type NullableError = Error | null;

export function useAuthenticatedHttpResource<ResourceT>(
  initialState: ResourceT,
  fetcher: (options: AuthenticatedHttpOptions) => Promise<ResourceT>
): {
  loading: boolean;
  error: NullableError;
  resource: ResourceT;
  setResource: (resource: ResourceT) => void;
  reloadResource: () => void;
} {
  const [resource, setResource] = useState<ResourceT>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as NullableError);
  const { token } = useAuthentication();

  const loadResource = useCallback(
    async (cancelToken?: CancelToken) => {
      if (token) {
        setError(null);
        setLoading(true);
        try {
          const response = await fetcher({ token, cancelToken });
          setResource(response);
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false);
        }
      } else {
        setError(new Error('Authentication failed. Please try logging in again.'));
      }
    },
    [fetcher, token]
  );

  useEffect(() => {
    const cancelToken = http.CancelToken.source();
    loadResource(cancelToken.token);
    return () => cancelToken.cancel();
  }, [loadResource]);

  return {
    loading,
    error,
    resource,
    setResource,
    reloadResource: loadResource,
  };
}
