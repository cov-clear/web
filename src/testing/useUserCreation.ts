import { useState } from 'react';
import { useTranslations } from 'retranslate';

import { CreateUserCommand, createUser, RestrictedUser } from '../api';
import { useAuthentication } from '../authentication';

type NullableError = Error | null;

export default function useUserCreation(): {
  create: (command: CreateUserCommand) => Promise<void>;
  creating: boolean;
  createdUser: RestrictedUser | null;
  error: NullableError;
} {
  const { token } = useAuthentication();
  const { translate } = useTranslations();

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null as NullableError);
  const [createdUser, setCreatedUser] = useState(null as RestrictedUser | null);

  const create = async (command: CreateUserCommand) => {
    if (token) {
      setError(null);
      setCreating(true);
      try {
        const user = await createUser(command, { token });
        setCreatedUser(user);
      } catch (error) {
        setError(error);
      } finally {
        setCreating(false);
      }
    } else {
      setError(new Error(translate('error.authentication')));
    }
  };

  return {
    create,
    creating,
    createdUser,
    error: error
      ? new Error(translate('userCreation.error.generic', { message: error.message }))
      : null,
  };
}
