import { inject as service } from '@ember/service';
import { RdfaEditorPlugin } from '@lblod/ember-rdfa-editor';
import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import TemplateModel from '../models/template';
import StandardTemplatePluginService from '../services/standard-template-plugin';

export default class StandardTemplatePlugin extends RdfaEditorPlugin {
  @service declare standardTemplatePlugin: StandardTemplatePluginService;
  matches = new Set();

  async initialize() {
    await super.initialize();
    let templates: DS.RecordArray<TemplateModel> | undefined;
    try {
      templates = await this.standardTemplatePlugin.fetchTemplates.perform();
    } catch (e) {
      console.warn(
        `Standard template plugin had trouble initializing: Templates failed to load`
      );
    }
    if (templates) {
      templates.forEach((template) => {
        template.matches.forEach((match) => this.matches.add(match));
      });
    }
  }

  widgets(): WidgetSpec[] {
    return [
      {
        desiredLocation: 'insertSidebar',
        componentName: 'standard-template-plugin/card',
      },
    ];
  }
}
