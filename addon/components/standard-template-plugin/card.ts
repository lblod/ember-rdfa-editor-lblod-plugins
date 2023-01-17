import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';

type Args = {
  controller: ProseController;
};
export default class StandardTemplatePluginCardComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }
}
