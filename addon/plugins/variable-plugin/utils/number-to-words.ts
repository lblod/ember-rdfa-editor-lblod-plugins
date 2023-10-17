import n2words from 'n2words';

/**
 * Wrapper around the `n2words` function which catches possible errors thrown by n2words.
 * If an invalid `lang` is used, `nl` is used by default.
 * If `n2words` throws an error (because of inability to convert the number),
 * this function displays the error as a warning and returns the provided number as a string.
 */
export function numberToWords(number: number, options: { lang: string }) {
  try {
    return n2words(number, options);
  } catch {
    try {
      return n2words(number, { ...options, lang: 'nl' });
    } catch (e) {
      console.warn(e);
      return number.toString();
    }
  }
}
