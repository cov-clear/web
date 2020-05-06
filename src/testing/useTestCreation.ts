import { useState } from 'react';
import { useTranslations } from 'retranslate';

import { createTest, CreateTestCommand, User, Test } from '../api';
import { useAuthentication } from '../authentication';

type NullableError = Error | null;

export function useTestCreation(): {
  create: (userId: User['id'], command: CreateTestCommand) => Promise<void>;
  creating: boolean;
  createdTest: Test | null;
  error: NullableError;
} {
  const { token } = useAuthentication();
  const { translate } = useTranslations();

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null as NullableError);
  const [createdTest, setCreatedTest] = useState(null as Test | null);

  const create = async (userId: User['id'], command: CreateTestCommand) => {
    if (token) {
      setError(null);
      setCreating(true);
      try {
        const test = await createTest(userId, command, { token });
        setCreatedTest(test);
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
    createdTest,
    error: error
      ? new Error(translate('testCreation.error.generic', { message: error.message }))
      : null,
  };
}
