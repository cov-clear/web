import { useState } from 'react';
import { useAuthentication } from '../authentication';
import { User, CreateUserCommand, createUsers } from '../api';

type NullableError = Error | null;

export default function useBulkUserCreation(): {
  create: (users: CreateUserCommand[]) => Promise<void>;
  loading: boolean;
  error: NullableError;
  createdUsers: User[];
} {
  const { token } = useAuthentication();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as NullableError);
  const [createdUsers, setCreatedUsers] = useState([] as User[]);

  const create = async (command: CreateUserCommand[]) => {
    if (token) {
      setError(null);
      setLoading(true);
      try {
        const users = await createUsers(command, { token });
        setCreatedUsers(users);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    } else {
      setError(new Error('Authentication failed. Please try logging in again.'));
    }
  };

  return { create, loading, error, createdUsers };
}
