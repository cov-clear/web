import { useEffect, useState, useCallback } from 'react';
import http, { CancelToken } from 'axios';
import { useAuthentication } from './authentication';

import { fetchUser, updateUser, User } from './api';

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const { token } = useAuthentication();

  useEffect(() => {
    const cancelToken = http.CancelToken.source();

    const loadUser = async (cancelToken?: CancelToken) => {
      if (token) {
        const fetchedUser = await fetchUser(id, { token, cancelToken });
        setUser(fetchedUser);
      } else {
        setUser(null);
      }
    };

    loadUser(cancelToken.token);
    return () => cancelToken.cancel();
  }, [id, token, setUser]);

  const update = useCallback(
    async (user: User) => {
      if (token) {
        const updatedUser = await updateUser(user, { token });
        setUser(updatedUser);
      }
    },
    [token, setUser],
  );

  return { user, update };
}
