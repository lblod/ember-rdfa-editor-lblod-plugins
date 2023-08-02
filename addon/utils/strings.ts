import { warn } from '@ember/debug';

export function escapeValue(value?: string) {
  if (value) {
    const shadowDomElement = document.createElement('textarea');
    shadowDomElement.innerHTML = value;
    return shadowDomElement.textContent;
  } else {
    return null;
  }
}

export function dateValue(value?: string): string | null {
  if (value) {
    try {
      return new Intl.DateTimeFormat('nl-BE').format(
        new Date(Date.parse(value)),
      );
    } catch (e) {
      let message: string;
      if (e instanceof Error) {
        message = e.message;
      } else {
        message = e as string;
      }
      warn(`Error parsing date ${value}: ${message}`, {
        id: 'date-parsing-error',
      });
      return null;
    }
  } else {
    return null;
  }
}

export function isNumber(value: string | number | null | undefined): boolean {
  return (
    typeof value === 'number' ||
    (!Number.isNaN(Number(value)) &&
      value !== null &&
      value !== undefined &&
      value !== '')
  );
}
