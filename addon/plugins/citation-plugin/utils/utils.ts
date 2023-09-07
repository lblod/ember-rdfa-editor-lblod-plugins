/*
 * flemish codex encodes certain characters as a html character, which breaks our search
 * this is an ugly work around
 */
export function replaceDiacriticsInWord(word: string): string {
  const characters =
    'Ë À Ì Â Í Ã Î Ä Ï Ç Ò È Ó É Ô Ê Õ Ö ê Ù ë Ú î Û ï Ü ô Ý õ â û ã ÿ ç'.split(
      ' ',
    );
  for (const char of characters) {
    word = word.replace(new RegExp(`${char}`, 'g'), `&#${char.charCodeAt(0)};`);
  }
  return word;
}
