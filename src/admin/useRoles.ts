import { useTranslations } from 'retranslate';

import { fetchRoles } from '../api';
import { useAuthenticatedHttpResource } from '../resources';

export default function useRoles() {
  const { translate } = useTranslations();
  const { loading, error, resource: roles } = useAuthenticatedHttpResource([], fetchRoles);

  return {
    loading,
    error: error ? new Error(translate('roles.error', { message: error.message })) : null,
    roles,
  };
}
