import Component from '@glimmer/component';

export default class StandardTemplateTemplateCardComponent extends Component {
  get controller() {
    return this.args.controller;
  }
}
