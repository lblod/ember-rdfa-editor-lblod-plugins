import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import StandardTemplate from '@lblod/ember-rdfa-editor-lblod-plugins/models/template';

type Args = {
  controller: SayController;
  templates: StandardTemplate[];
};
export default class StandardTemplatePluginCardComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }
  get templates() {
    return this.args.templates;
  }
}
