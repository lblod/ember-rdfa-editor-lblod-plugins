import { isBlank } from '@ember/utils';
import {
  LEGISLATION_TYPES,
  LegislationKey,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/legislation-types';

const STOP_WORDS = ['het', 'de', 'van', 'tot', 'dat'];
const DATE_REGEX = new RegExp('(\\d{1,2})\\s(\\w+)\\s(\\d{2,4})', 'g');
const INVISIBLE_SPACE = '\u200B';
const SPACES_REGEX = new RegExp('[\\s${UNBREAKABLE_SPACE}]+');

export default function processMatch(match: RegExpMatchArray): {
  text: string;
  legislationTypeUri: string;
} {
  const matchgroups = match;
  const type = matchgroups[2];
  const searchTerms = matchgroups[3];
  let cleanedSearchTerms = cleanupText(searchTerms)
    .split(SPACES_REGEX)
    .filter(
      (word) => !isBlank(word) && word.length > 3 && !STOP_WORDS.includes(word)
    )
    .join(' ');
  if (type) {
    let typeLabel: LegislationKey;
    if (/\w+decreet/i.test(type)) {
      typeLabel = 'decreet';
      cleanedSearchTerms = `${type} ${cleanedSearchTerms}`;
    } else if (/decreet/i.test(type)) {
      typeLabel = 'decreet';
    } else if (/\w+wetboek/i.test(type)) {
      typeLabel = 'wetboek';
      cleanedSearchTerms = `${type} ${cleanedSearchTerms}`;
    } else if (/wetboek/i.test(type)) {
      typeLabel = 'wetboek';
    } else if (/geco[oö]rdineerde[^\S\n]wetten/i.test(type)) {
      typeLabel = 'gecoördineerde wetten';
    } else if (/grondwetswijziging/i.test(type)) {
      typeLabel = 'grondwetswijziging';
    } else if (/grondwet/i.test(type)) {
      typeLabel = 'grondwet';
    } else if (/\w+wet/i.test(type)) {
      typeLabel = 'wet';
      cleanedSearchTerms = `${type} ${cleanedSearchTerms}`;
    } else if (/wet/i.test(type)) {
      typeLabel = 'wet';
    } else {
      typeLabel = 'decreet';
    }
    const typeUri = LEGISLATION_TYPES[typeLabel];
    return {
      text: cleanedSearchTerms,
      legislationTypeUri: typeUri,
    };
  } else {
    return {
      text: cleanedSearchTerms,
      legislationTypeUri: LEGISLATION_TYPES['decreet'],
    };
  }
}

function cleanupText(text?: string): string {
  if (!text) return '';
  const { textWithoutDates } = extractDates(text);
  const textWithoutOddChars = textWithoutDates.replace(
    new RegExp(`[,.:"()&${INVISIBLE_SPACE}]`, 'g'),
    ''
  );
  const articleIndex = textWithoutOddChars.indexOf('artikel');
  return articleIndex >= 0
    ? textWithoutOddChars.slice(0, articleIndex)
    : textWithoutOddChars;
}

function extractDates(text: string): {
  dates: RegExpMatchArray[];
  textWithoutDates: string;
} {
  let date;
  const matches: RegExpMatchArray[] = [];
  while ((date = DATE_REGEX.exec(text)) !== null) {
    matches.push(date);
  }

  let textWithoutDates = text;
  for (const match of matches) {
    textWithoutDates = textWithoutDates.replace(match[0], '');
  }

  return { dates: matches, textWithoutDates };
}
