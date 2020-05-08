import { formatDate } from '../i18n/date';

export function useI18n(): { formatDate: (date: Date) => string } {
  return { formatDate };
}
