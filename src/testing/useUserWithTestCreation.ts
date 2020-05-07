import { useState } from 'react';
import { useTranslations } from 'retranslate';

import {
  CreateUserCommand,
  CreateTestCommand,
  createUser,
  createTest,
  RestrictedUser,
} from '../api';
import { useAuthentication } from '../authentication';

type Nullable<T> = T | null;

export function useUserWithTestCreation(): {
  create: (
    createUserCommand: CreateUserCommand,
    createTestCommand: CreateTestCommand
  ) => Promise<void>;
  creating: boolean;
  userAfterSuccess: Nullable<RestrictedUser>;
  error: Nullable<Error>;
} {
  const { token } = useAuthentication();
  const { translate } = useTranslations();

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null as Nullable<Error>);
  const [userAfterSuccess, setUserAfterSuccess] = useState(null as Nullable<RestrictedUser>);

  const create = async (
    createUserCommand: CreateUserCommand,
    createTestCommand: CreateTestCommand
  ) => {
    setError(null);

    if (!token) {
      setError(new Error(translate('error.authentication')));
    } else {
      setCreating(true);

      let user;
      try {
        user = await createUser(createUserCommand, { token });
      } catch (error) {
        setError(new Error(translate('userCreation.error.generic')));
      }

      let test;
      if (user) {
        try {
          test = await createTest(user.id, createTestCommand, { token });
        } catch (error) {
          setError(new Error(translate('testCreation.error.generic')));
        }
      }

      if (user && test) {
        setUserAfterSuccess(user);
      }

      setCreating(false);
    }
  };

  return { create, creating, userAfterSuccess, error };
}
