import { formatWithOptions } from 'date-fns/fp';
import { nlBE } from 'date-fns/locale';

export function formatDate(date: Date, format: string) {
  try {
    return formatWithOptions({ locale: nlBE }, format)(date);
  } catch (e) {
    return '';
  }
}
