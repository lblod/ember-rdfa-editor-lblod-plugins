import { inject as service } from '@ember/service';
import { RdfaEditorPlugin } from '@lblod/ember-rdfa-editor';

export default class StandardTemplatePlugin extends RdfaEditorPlugin {
  @service standardTemplatePlugin;
  matches = new Set();

  async initialize() {
    super.initialize();
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
  }

  widgets() {
    return [
      {
        desiredLocation: 'insertSidebar',
        componentName: 'standard-template-plugin/card',
        identifier: 'standard-template-plugin/card',
      },
    ];
  }
}
