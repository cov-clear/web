import { useConfig } from './useConfig';
import { formatDate } from '../i18n/date';

export function useI18n(): { formatDate: (date: Date) => string } {
  const config = useConfig();
  if (config) {
    return {
      formatDate: (date) => formatDate(date, config.defaultLanguage),
    };
  }
  return {
    formatDate: (date) => formatDate(date),
  };
}
