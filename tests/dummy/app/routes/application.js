import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

// DO NOT CHANGE THIS FILE TO TYPESCRIPT
// see https://github.com/typed-ember/ember-cli-typescript/issues/780
// it conflicts with ember-intl's application route
export default class ApplicationRoute extends Route {
  @service intl;

  beforeModel(transition) {
    const userLocale = navigator.language || navigator.languages[0];
    this.intl.setLocale([userLocale, 'nl-BE']);
    return super.beforeModel(transition);
  }
}
