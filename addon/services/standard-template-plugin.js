import Service, { inject as service } from '@ember/service';
import { task, waitForProperty } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class RdfaEditorStandardTemplatePluginService extends Service {
  @service store;
  @tracked templates;

  constructor() {
    super(...arguments);
    this.loadTemplates();
  }

  @task
  *fetchTemplates() {
    yield waitForProperty(this, 'templates');
    return this.templates;
  }

  async loadTemplates() {
    this.templates = await this.store.query('template', {
      fields: { templates: 'title,contexts,matches,disabled-in-contexts' },
    });
  }

  /**
     Filter the valid templates for a context.
     @method templatesForContext
     @param {Array} Array of templates
     @param {Array} The path of rdfaContext objects from the root till the current context
     @return {Array} Array of templates (filtered)
     @private
  */
  templatesForContext(templates, rdfaTypes) {
    let isMatchingForContext = (template) => {
      return (
        rdfaTypes.filter((e) => template.get('contexts').includes(e)).length >
          0 &&
        rdfaTypes.filter((e) => template.get('disabledInContexts').includes(e))
          .length === 0
      );
    };
    return templates.filter(isMatchingForContext);
  }
}
