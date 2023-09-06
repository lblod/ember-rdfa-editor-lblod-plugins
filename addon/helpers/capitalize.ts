import { helper } from '@ember/component/helper';
import { capitalize as utilCapitalize } from '../utils/strings';

export default helper(function capitalize([string]: string[]) {
  return utilCapitalize(string);
});
