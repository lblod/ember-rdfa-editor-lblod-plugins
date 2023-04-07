import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import Transition from '@ember/routing/transition';

export default class ApplicationRoute extends Route {
  @service declare intl: IntlService;

  beforeModel(transition: Transition): Promise<unknown> | void {
    const userLocale = navigator.language || navigator.languages[0];
    this.intl.setLocale([userLocale, 'nl-BE']);
    return super.beforeModel(transition);
  }
}
