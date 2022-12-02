/* eslint-disable @typescript-eslint/ban-ts-comment */
import Model, { attr } from '@ember-data/model';

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    template: TemplateModel;
  }
}
export default class TemplateModel extends Model {
  @attr declare title: string;
  // @ts-ignore
  @attr('string-set', { defaultValue: () => [] }) declare matches: string[];
  @attr declare body: string;
  // @ts-ignore
  @attr('string-set', { defaultValue: () => [] }) declare contexts: string[];
  // @ts-ignore
  @attr('string-set', { defaultValue: () => [] })
  declare disabledInContexts: string[];
}
