import { fetchRoles } from '../api';
import { useAuthenticatedHttpResource } from '../resources';

export default function useRoles() {
  const { loading, error, resource: roles } = useAuthenticatedHttpResource([], fetchRoles);
  return { loading, error, roles };
}
