import memoize from '../utils/memoize';
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
export default function instantiateUuids(templateString) {
  let generateBoundUuid = memoize(uuidv4); // eslint-disable-line no-unused-vars
  let generateUuid = uuidv4; // eslint-disable-line no-unused-vars
  return templateString.replace(/\$\{.+?}/g, (match) => {
    //input '${content}' and eval('content')
    return eval(match.substring(2, match.length - 1));
  });
}
