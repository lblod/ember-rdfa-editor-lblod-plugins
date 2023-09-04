import { isBlank } from '@ember/utils';
import { isLegislationType, LEGISLATION_TYPES } from './types';
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

const getTypeLabel = (
  type: string,
): keyof typeof LEGISLATION_TYPES | string => {
  switch (true) {
    case /\w+decreet/i.test(type):
    case /decreet/i.test(type):
      return 'decreet';
    case /\w+wetboek/i.test(type):
    case /wetboek/i.test(type):
      return 'wetboek';
    case /geco[oö]rdineerde[^\S\n]wet(ten)?/i.test(type):
      return 'gecoördineerde wetten';
    case /grondwets?wijziging/i.test(type):
      return 'grondwetswijziging';
    case /grondwet/i.test(type):
      return 'grondwet';
    case /bijzondere[^\S\n]wet/i.test(type):
      return 'bijzondere wet';
    case /\w+wet/i.test(type):
    case /wet/i.test(type):
      return 'wet';
    default:
      return type.toLowerCase().trim();
  }
};

const getAugmentedSearchTerms = (type: string, searchTerms: string) => {
  if (
    /\w+decreet/i.test(type) ||
    /\w+wetboek/i.test(type) ||
    /\w+wet/i.test(type)
  ) {
    return `${type} ${searchTerms}`;
  }

  return searchTerms;
};

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

  const cleanedSearchTerms = cleanupText(searchTerms)
    .split(SPACES_REGEX)
    .filter(
      (word) => !isBlank(word) && word.length > 3 && !STOP_WORDS.includes(word),
    )
    .join(' ');

  if (type) {
    const typeLabel = getTypeLabel(type);

    const typeUri = isLegislationType(typeLabel)
      ? LEGISLATION_TYPES[typeLabel]
      : LEGISLATION_TYPES['decreet'];

    return {
      text: getAugmentedSearchTerms(type, cleanedSearchTerms),
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
  }

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
