import { useState } from 'react';
import { useAuthentication } from '../authentication';
import { User, CreateUserCommand, createUsers } from '../api';
import { useTranslations } from 'retranslate';

type NullableError = Error | null;

export default function useBulkUserCreation(): {
  create: (users: CreateUserCommand[]) => Promise<void>;
  loading: boolean;
  error: NullableError;
  createdUsers: User[];
} {
  const { token } = useAuthentication();
  const { translate } = useTranslations();

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
      setError(new Error(translate('bulkUserCreation.error.authentication')));
    }
  };

  return {
    create,
    loading,
    error: error
      ? new Error(translate('bulkUserCreation.error.generic', { message: error.message }))
      : null,
    createdUsers,
  };
}
