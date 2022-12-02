import memoize from './memoize';
import { v4 as uuidv4 } from 'uuid';

/**
 * Given a template string, we instantiate uuids by matching
 * ${generateUuid()} pattern in the string and evaluating generateUuid()
 *
 * Note: the general approach is similar to converting a string to a template literal, but since
 * this approach does not work in IE, we had to fall back to plain regex matching.
 *
 * @method instantiateUuids
 * @param {String} templateString
 *
 * @return {String} template string with instantiated uuids
 *
 * @private
 */

function determineFunction(string: string): () => string {
  switch (string) {
    case 'generateUuid()':
      return uuidv4;
    case 'generateBoundUuid()':
      return memoize(uuidv4);
    default:
      throw new Error(`Could not convert ${string} to function`);
  }
}
export default function instantiateUuids(templateString: string) {
  return templateString.replace(/\$\{.+?}/g, (match) => {
    //input '${content}' and eval('content')
    return determineFunction(match.substring(2, match.length - 1))();
  });
}
