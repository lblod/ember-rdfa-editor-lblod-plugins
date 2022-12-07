import Store from '@ember-data/store';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Service, { inject as service } from '@ember/service';
import { task, waitForProperty, Task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import TemplateModel from '../models/template';

export default class StandardTemplatePluginService extends Service {
  @service declare store: Store;
  @tracked declare templates: DS.RecordArray<TemplateModel>;

  constructor() {
    // eslint-disable-next-line prefer-rest-params
    super(...arguments);
    void this.loadTemplates();
  }

  fetchTemplates: Task<DS.RecordArray<TemplateModel>, []> = task(async () => {
    console.log('FETCH TEMPLATES');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await waitForProperty(this, 'templates');
    return this.templates;
  });

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
  templatesForContext(templates: TemplateModel[], rdfaTypes: string[]) {
    const isMatchingForContext = (template: TemplateModel) => {
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
