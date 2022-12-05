import Model, { attr } from '@ember-data/model';
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    template: TemplateModel;
  }
}
export default class TemplateModel extends Model {
  @attr declare title: string;
  @attr('string-set', { defaultValue: () => [] }) declare matches: string[];
  @attr declare body: string;
  @attr('string-set', { defaultValue: () => [] }) declare contexts: string[];
  @attr('string-set', { defaultValue: () => [] })
  declare disabledInContexts: string[];
}
