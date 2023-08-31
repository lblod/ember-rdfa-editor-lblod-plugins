import { isBlank } from '@ember/utils';
import { LEGISLATION_TYPES } from './types';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

const STOP_WORDS = ['het', 'de', 'van', 'tot', 'dat'];
const DATE_REGEX = new RegExp('(\\d{1,2})\\s(\\w+)\\s(\\d{2,4})', 'g');
const INVISIBLE_SPACE = '\u200B';
const UNBREAKABLE_SPACE = '\u00A0';
const SPACES_REGEX = new RegExp(`[\\s${UNBREAKABLE_SPACE}]+`);
export type RegexpMatchArrayWithIndices = RegExpMatchArray & {
  indices: Array<[number, number]> & {
    groups: { [key: string]: [number, number] };
  };
};

interface ProcessedMatch {
  text: string;
  legislationTypeUri: string;
  typeMatch: {
    text: string;
    start: number;
    end: number;
  } | null;
  searchTextMatch: {
    text: string;
    start: number;
    end: number;
  };
}

export default function processMatch(
  match: RegexpMatchArrayWithIndices,
): ProcessedMatch | null {
  const matchgroups = match.groups;
  if (!matchgroups) {
    return null;
  }
  const type = matchgroups['type'];
  const searchTerms = matchgroups['searchTerms'];
  if (!type || !searchTerms) {
    return null;
  }
  let cleanedSearchTerms = cleanupText(searchTerms)
    .split(SPACES_REGEX)
    .filter(
      (word) => !isBlank(word) && word.length > 3 && !STOP_WORDS.includes(word),
    )
    .join(' ');
  if (type) {
    let typeLabel: string;
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
    } else if (/geco[oö]rdineerde[^\S\n]wet(ten)?/i.test(type)) {
      typeLabel = 'gecoördineerde wetten';
    } else if (/grondwets?wijziging/i.test(type)) {
      typeLabel = 'grondwetswijziging';
    } else if (/grondwet/i.test(type)) {
      typeLabel = 'grondwet';
    } else if (/bijzondere[^\S\n]wet/i.test(type)) {
      typeLabel = 'bijzondere wet';
    } else if (/\w+wet/i.test(type)) {
      typeLabel = 'wet';
      cleanedSearchTerms = `${type} ${cleanedSearchTerms}`;
    } else if (/wet/i.test(type)) {
      typeLabel = 'wet';
    } else {
      typeLabel = type.toLowerCase().trim();
    }
    const typeUri =
      (LEGISLATION_TYPES as Record<string, string>)[typeLabel] ||
      LEGISLATION_TYPES['decreet'];
    return {
      text: cleanedSearchTerms,
      legislationTypeUri: typeUri,
      typeMatch: {
        text: type,
        start: unwrap(match.indices.groups['type'])[0],
        end: unwrap(match.indices.groups['type'])[1],
      },
      searchTextMatch: {
        text: searchTerms,
        start: unwrap(match.indices.groups['searchTerms'])[0],
        end: unwrap(match.indices.groups['searchTerms'])[1],
      },
    };
  } else {
    return {
      text: cleanedSearchTerms,
      legislationTypeUri: LEGISLATION_TYPES['decreet'],
      typeMatch: null,
      searchTextMatch: {
        text: searchTerms,
        start: unwrap(match.indices.groups['searchTerms'])[0],
        end: unwrap(match.indices.groups['searchTerms'])[1],
      },
    };
  }
}

function cleanupText(text?: string): string {
  if (!text) return '';
  const { textWithoutDates } = extractDates(text);
  const textWithoutOddChars = textWithoutDates.replace(
    new RegExp(`[,.:"()&${INVISIBLE_SPACE}]`, 'g'),
    '',
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
