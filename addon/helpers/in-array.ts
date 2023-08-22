import { helper } from '@ember/component/helper';

type PositionalParams = [array: unknown[], needle: unknown];

function inArray([theArray, needle]: PositionalParams) {
  if (!Array.isArray(theArray)) {
    return false;
  }

  return theArray.includes(needle);
}

export default helper<PositionalParams>(inArray);
