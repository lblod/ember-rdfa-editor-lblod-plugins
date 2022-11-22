import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class StandardTemplatePlugin {
  @service standardTemplatePlugin;
  matches = new Set();
  controller;

  get name() {
    return 'standard-template';
  }

  async initialize(controller) {
    let templates;
    try {
      templates = await this.standardTemplatePlugin.fetchTemplates.perform();
    } catch (e) {
      console.warn(
        `Plugin ${this.name} had trouble initializing: Templates failed to load`
      );
    }
    if (templates) {
      templates.forEach((template) => {
        template.matches.forEach((match) => this.matches.add(match));
      });
    }
    this.controller = controller;
    controller.registerWidget({
      desiredLocation: 'insertSidebar',
      componentName: 'standard-template-plugin/template-card',
      identifier: 'standard-template-plugin/template-card',
    });
  }

  @action
  highlight(event) {
    if (event.owner !== this.name) {
      const damagedRange = event.payload.damagedRange;
      this.highlightInRange(damagedRange);
    }
  }

  @action
  highlightInRange(range) {
    let regexString = '';
    this.matches.forEach((match) => {
      regexString += `${match}|`;
    });
    regexString = regexString.substring(0, regexString.length - 1);
    const rangesToHighlight = this.controller.executeCommand(
      'match-text',
      range,
      new RegExp(regexString, 'g')
    );
    for (const range of rangesToHighlight) {
      this.controller.executeCommand('make-highlight', range, false);
    }
  }
}
