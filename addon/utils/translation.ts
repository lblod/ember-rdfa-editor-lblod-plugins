import type { EditorState } from '@lblod/ember-rdfa-editor';
import IntlService, { type TOptions } from 'ember-intl/services/intl';
import { emberApplicationPluginKey } from '@lblod/ember-rdfa-editor/plugins/ember-application';

/* Get a function that will translate the string through `intl` based on the document language
   or returns the fallback string if no state is provided or emberApplication plugin is not found */
export const getTranslationFunction = (state?: EditorState) => {
  const intl =
    state &&
    (emberApplicationPluginKey
      .getState(state)
      ?.application.lookup('service:intl') as IntlService | undefined);

  const locale = state?.doc.attrs.lang as string;

  return (key: string, fallback: string, options?: TOptions) => {
    if (!intl) {
      return fallback;
    }

    return intl.t(key, { ...options, htmlSafe: false, locale });
  };
};
