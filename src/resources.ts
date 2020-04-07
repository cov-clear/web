import { useEffect, useState, useCallback, useRef } from 'react';
import http, { CancelToken, AxiosError } from 'axios';
import { useAuthentication } from './authentication';
import {
  fetchUser,
  updateUser,
  User,
  fetchCountries,
  createSharingCodeForUserId,
  fetchTestTypes,
  fetchTests,
  fetchTest,
  AuthenticatedHttpOptions,
} from './api';

type NullableError = Error | null;

function isAuthenticationError(error: AxiosError) {
  return error?.isAxiosError && error?.response?.status === 401;
}

export function useAuthenticatedHttpResource<ResourceT>(
  initialState: ResourceT,
  fetcher: (options: AuthenticatedHttpOptions) => Promise<ResourceT>
): {
  loading: boolean;
  error: NullableError;
  resource: ResourceT;
  setResource: (resource: ResourceT) => void;
  reloadResource: (cancelToken?: CancelToken) => void;
} {
  const isMountedRef = useRef(true);
  const [resource, setResource] = useState<ResourceT>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as NullableError);
  const { token, signOut } = useAuthentication();

  const loadResource = useCallback(
    async (cancelToken?: CancelToken) => {
      if (token) {
        isMountedRef.current && setError(null);
        isMountedRef.current && setLoading(true);
        try {
          const response = await fetcher({ token, cancelToken });
          isMountedRef.current && setResource(response);
        } catch (error) {
          if (isAuthenticationError(error)) {
            return signOut();
          }
          isMountedRef.current && setError(error);
        } finally {
          isMountedRef.current && setLoading(false);
        }
      } else {
        isMountedRef.current &&
          setError(new Error('Authentication failed. Please try logging in again.'));
      }
    },
    [fetcher, token, signOut]
  );

  useEffect(() => {
    const cancelToken = http.CancelToken.source();
    loadResource(cancelToken.token);
    return () => {
      /*
        TODO: The cancel token functionality is not working (not cancelling requests),
        so consider looking into it or removing it overall and keeping only the ref approach
      */
      cancelToken.cancel();
      isMountedRef.current = false;
    };
  }, [loadResource]);

  return {
    loading,
    error,
    resource,
    setResource,
    reloadResource: loadResource,
  };
}

export function useUser(id: string) {
  const { token } = useAuthentication();
  const userFetcher = useCallback((options: AuthenticatedHttpOptions) => fetchUser(id, options), [
    id,
  ]);
  const { loading, resource: user, setResource: setUser } = useAuthenticatedHttpResource(
    null,
    userFetcher
  );

  const update = useCallback(
    async (user: User) => {
      if (token) {
        const updatedUser = await updateUser(user, { token });
        setUser(updatedUser);
      }
    },
    [setUser, token]
  );

  return { loading, user, update };
}

export function useCountries() {
  const countryFetcher = useCallback(
    (options: AuthenticatedHttpOptions) => fetchCountries(options),
    []
  );
  const { loading, resource: countries } = useAuthenticatedHttpResource([], countryFetcher);
  return { countries, loading };
}

const SHARING_CODE_TIMER_INTERVAL = 500;

function getTimeFromNow(date: Date) {
  return (date.getTime() - new Date().getTime()) / 1000;
}

export function useSharingCode(userId: string) {
  const codeCreator = useCallback(
    (options: AuthenticatedHttpOptions) => createSharingCodeForUserId(userId, options),
    [userId]
  );
  const {
    loading,
    resource: sharingCode,
    reloadResource: reloadSharingCode,
  } = useAuthenticatedHttpResource(null, codeCreator);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  const [originalTimeUntilExpiry, setOriginalTimeUntilExpiry] = useState(0);
  useEffect(() => {
    if (sharingCode) {
      const cancelToken = http.CancelToken.source();
      const expiryDate = new Date(sharingCode.expiryTime);
      setOriginalTimeUntilExpiry(getTimeFromNow(expiryDate));
      const interval = setInterval(() => {
        const timeLeft = getTimeFromNow(expiryDate);
        setTimeUntilExpiry(timeLeft);
        if (timeLeft <= 3) {
          reloadSharingCode(cancelToken.token);
        }
      }, SHARING_CODE_TIMER_INTERVAL);
      return () => {
        clearInterval(interval);
        cancelToken.cancel();
      };
    }
  }, [reloadSharingCode, sharingCode]);
  return { loading, sharingCode, timeUntilExpiry, originalTimeUntilExpiry };
}

export function useTestTypes() {
  const { hasPermission } = useAuthentication();
  const testTypeFetcher = useCallback(
    (options: AuthenticatedHttpOptions) => fetchTestTypes(options),
    []
  );
  const { loading, resource: testTypes } = useAuthenticatedHttpResource([], testTypeFetcher);

  const permittedTestTypes = testTypes.filter(type =>
    hasPermission(type.neededPermissionToAddResults)
  );

  return {
    loading,
    testTypes,
    permittedTestTypes,
  };
}

export function useTests(userId: string) {
  const testFetcher = useCallback(
    (options: AuthenticatedHttpOptions) => fetchTests(userId, options),
    [userId]
  );
  const { loading, resource: tests } = useAuthenticatedHttpResource([], testFetcher);
  return { tests, loading };
}

export function useTest(testId: string) {
  const testFetcher = useCallback(
    (options: AuthenticatedHttpOptions) => fetchTest(testId, options),
    [testId]
  );
  const { loading, resource: test } = useAuthenticatedHttpResource(null, testFetcher);
  return { loading, test };
}
