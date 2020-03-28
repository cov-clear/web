import { useEffect, useState, useCallback } from 'react';
import http from 'axios';
import { useAuthentication } from './authentication';

import { fetchUser, updateUser, User, Country, fetchCountries } from './api';

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
