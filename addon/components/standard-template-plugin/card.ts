import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';

type Args = {
  controller: SayController;
};
export default class StandardTemplatePluginCardComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }
}
