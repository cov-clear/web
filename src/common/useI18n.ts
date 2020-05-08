import { useConfig } from './useConfig';
import { formatDate } from '../i18n/date';

export function useI18n(): { formatDate: (date: Date) => string } {
  const { defaultLanguage } = useConfig();

  return {
    formatDate: (date) => formatDate(date, defaultLanguage),
  };
}
