import { format } from 'date-fns';

export function formatDate(date: Date): string {
  return format(date, 'd MMM yyyy');
}
