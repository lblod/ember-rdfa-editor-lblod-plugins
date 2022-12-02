import Component from '@glimmer/component';

export default class StandardTemplatePluginCardComponent extends Component {
  get controller() {
    return this.args.controller;
  }
}
