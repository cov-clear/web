import { useEffect, useState, useCallback } from 'react';
import http from 'axios';
import { useAuthentication } from './authentication';

import {
  fetchUser,
  updateUser,
  User,
  Country,
  fetchCountries,
  SharingCode,
  createSharingCodeForUserId,
  TestType,
  fetchTestTypes,
  Test,
  fetchTests,
  fetchTest,
} from './api';

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const { token } = useAuthentication();

  useEffect(() => {
    const cancelToken = http.CancelToken.source();

    const loadUser = async () => {
      if (token) {
        const fetchedUser = await fetchUser(id, { token, cancelToken: cancelToken.token });
        setUser(fetchedUser);
      } else {
        setUser(null);
      }
    };

    loadUser();
    return () => cancelToken.cancel();
  }, [id, token]);

  const update = useCallback(
    async (user: User) => {
      if (token) {
        const updatedUser = await updateUser(user, { token });
        setUser(updatedUser);
      }
    },
    [token],
  );

  return { user, update };
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const { token } = useAuthentication();

  useEffect(() => {
    const cancelToken = http.CancelToken.source();

    const loadCountries = async () => {
      if (token) {
        const countries = await fetchCountries({ token, cancelToken: cancelToken.token });
        setCountries(countries);
      } else {
        setCountries([]);
      }
    };

    loadCountries();
    return () => cancelToken.cancel();
  }, [token]);

  return { countries };
}

export function useSharingCode(userId: string) {
  const [sharingCode, setSharingCode] = useState<SharingCode | null>(null);
  const { token } = useAuthentication();

  useEffect(() => {
    const cancelToken = http.CancelToken.source();

    const createCode = async () => {
      if (token) {
        const code = await createSharingCodeForUserId(userId, {
          token,
          cancelToken: cancelToken.token,
        });
        setSharingCode(code);
      } else {
        setSharingCode(null);
      }
    };

    createCode();
    return () => cancelToken.cancel();
  }, [token, userId]);

  return sharingCode;
}

// TODO: refactor all these simple hooks using a common hook

export function useTestTypes() {
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const { token, hasPermission } = useAuthentication();

  useEffect(() => {
    const cancelToken = http.CancelToken.source();

    const loadTestTypes = async () => {
      if (token) {
        const testTypes = await fetchTestTypes({ token, cancelToken: cancelToken.token });
        setTestTypes(testTypes);
      } else {
        setTestTypes([]);
      }
    };

    loadTestTypes();
    return () => cancelToken.cancel();
  }, [token]);

  const permittedTestTypes = testTypes.filter((type) =>
    hasPermission(type.neededPermissionToAddResults),
  );

  return {
    testTypes,
    permittedTestTypes,
  };
}

export function useTests(userId: string) {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthentication();

  useEffect(() => {
    const cancelToken = http.CancelToken.source();

    const loadTests = async () => {
      if (token) {
        setLoading(true);
        const tests = await fetchTests(userId, { token, cancelToken: cancelToken.token });
        setTests(tests);
        setLoading(false);
      } else {
        setTests([]);
      }
    };

    loadTests();
    return () => cancelToken.cancel();
  }, [token, userId]);

  return { tests, loading };
}

export function useTest(testId: string) {
  const [test, setTests] = useState<Test | null>(null);
  const { token } = useAuthentication();

  useEffect(() => {
    const cancelToken = http.CancelToken.source();

    const loadTests = async () => {
      if (token) {
        const test = await fetchTest(testId, { token, cancelToken: cancelToken.token });
        setTests(test);
      } else {
        setTests(null);
      }
    };

    loadTests();
    return () => cancelToken.cancel();
  }, [testId, token]);

  return { test };
}
