import { useState, useEffect } from 'react';

import { useAuthentication } from '../../authentication';
import { Role, fetchRoles } from '../../api';

type NullableError = Error | null;

export default function useRoles(): {
  loading: boolean;
  error: NullableError;
  roles: Role[];
} {
  const { token } = useAuthentication();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as NullableError);
  const [roles, setRoles] = useState([] as Role[]);

  useEffect(() => {
    const load = async () => {
      if (token) {
        setError(null);
        setLoading(true);
        try {
          const roles = await fetchRoles({ token });
          setRoles(roles);
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false);
        }
      } else {
        setError(new Error('Authentication failed. Please try logging in again.'));
      }
    };
    load();
  }, [token]);

  return { loading, error, roles };
}
