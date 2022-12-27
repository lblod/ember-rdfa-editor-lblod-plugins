import memoize from '@lblod/ember-rdfa-editor-lblod-plugins/utils/memoize';
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

export default function instantiateUuids(templateString: string) {
  const generateBoundUuid = memoize(uuidv4) as (...args: unknown[]) => string;

  const determineFunction = (string: string) => {
    switch (string) {
      case 'generateUuid':
        return uuidv4;
      case 'generateBoundUuid':
        return generateBoundUuid;
      default:
        throw new Error(`Could not convert ${string} to function`);
    }
  };
  return templateString.replace(
    /\$\{(generateUuid|generateBoundUuid)\(([^()]*)\)\}/g,
    (string) => {
      const match = /\$\{(generateUuid|generateBoundUuid)\(([^()]*)\)\}/.exec(
        string
      );
      if (match) {
        const functionName = match[1];
        const functionArgs = match[2];
        const func = determineFunction(functionName);
        return functionArgs ? func(functionArgs) : func();
      } else {
        return string;
      }
    }
  );
}
