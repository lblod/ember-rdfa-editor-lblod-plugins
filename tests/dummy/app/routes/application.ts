import Route from '@ember/routing/route';
import Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import { decentLocaleMatch } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import IntlService from 'ember-intl/services/intl';

// DO NOT CHANGE THIS FILE TO TYPESCRIPT
// see https://github.com/typed-ember/ember-cli-typescript/issues/780
// it conflicts with ember-intl's application route
export default class ApplicationRoute extends Route {
  @service declare intl: IntlService;

  beforeModel(transition: Transition) {
    const userLocales = decentLocaleMatch(
      navigator.languages,
      this.intl.locales,
      'en-US',
    );
    this.intl.setLocale(userLocales);
    return super.beforeModel(transition);
  }
}
