import { useEffect, useState, useCallback } from 'react';
import http from 'axios';
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

function useAuthenticatedHttpResource<ResourceT>(
  initialState: ResourceT,
  fetcher: (options: AuthenticatedHttpOptions) => Promise<ResourceT>,
) {
  const [resource, setResource] = useState<ResourceT>(initialState);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthentication();

  useEffect(() => {
    const cancelToken = http.CancelToken.source();
    const load = async () => {
      if (token) {
        setLoading(true);
        const response = await fetcher({ token, cancelToken: cancelToken.token });
        setResource(response);
        setLoading(false);
      }
    };
    load();
    return () => cancelToken.cancel();
  }, [fetcher, token]);

  return { loading, resource, setResource };
}

export function useUser(id: string) {
  const { token } = useAuthentication();
  const userFetcher = useCallback((options: AuthenticatedHttpOptions) => fetchUser(id, options), [
    id,
  ]);
  const { loading, resource: user, setResource: setUser } = useAuthenticatedHttpResource(
    null,
    userFetcher,
  );

  const update = useCallback(
    async (user: User) => {
      if (token) {
        const updatedUser = await updateUser(user, { token });
        setUser(updatedUser);
      }
    },
    [setUser, token],
  );

  return { loading, user, update };
}

export function useCountries() {
  const countryFetcher = useCallback(
    (options: AuthenticatedHttpOptions) => fetchCountries(options),
    [],
  );
  const { loading, resource: countries } = useAuthenticatedHttpResource([], countryFetcher);
  return { countries, loading };
}

export function useSharingCode(userId: string) {
  const codeCreator = useCallback(
    (options: AuthenticatedHttpOptions) => createSharingCodeForUserId(userId, options),
    [userId],
  );
  const { loading, resource: sharingCode } = useAuthenticatedHttpResource(null, codeCreator);
  return { loading, sharingCode };
}

export function useTestTypes() {
  const { hasPermission } = useAuthentication();
  const testTypeFetcher = useCallback(
    (options: AuthenticatedHttpOptions) => fetchTestTypes(options),
    [],
  );
  const { loading, resource: testTypes } = useAuthenticatedHttpResource([], testTypeFetcher);

  const permittedTestTypes = testTypes.filter((type) =>
    hasPermission(type.neededPermissionToAddResults),
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
    [userId],
  );
  const { loading, resource: tests } = useAuthenticatedHttpResource([], testFetcher);
  return { tests, loading };
}

export function useTest(testId: string) {
  const testFetcher = useCallback(
    (options: AuthenticatedHttpOptions) => fetchTest(testId, options),
    [testId],
  );
  const { loading, resource: test } = useAuthenticatedHttpResource(null, testFetcher);
  return { loading, test };
}
