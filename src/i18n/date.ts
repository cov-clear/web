import { format } from 'date-fns';
import { enGB, et } from 'date-fns/locale';

import { Language } from '../api';

export function formatDate(date: Date, language: Language = Language.ENGLISH): string {
  const localeForLanguage: Record<Language, Locale> = {
    [Language.ENGLISH]: enGB,
    [Language.ESTONIAN]: et,
  };
  const formatForLanguage: Record<Language, string> = {
    [Language.ENGLISH]: 'd MMM yyyy',
    [Language.ESTONIAN]: 'd. MMMM yyyy',
  };

  return format(date, formatForLanguage[language], { locale: localeForLanguage[language] });
}
