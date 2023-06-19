// Types for compiled templates
declare module '@lblod/ember-rdfa-editor-lblod-plugins/templates/*' {
  import { TemplateFactory } from 'ember-cli-htmlbars';

  const tmpl: TemplateFactory;
  export default tmpl;
}
declare module 'n2words' {
  export default function n2words(
    number: number,
    options: { lang: string }
  ): string;
}

declare module 'tracked-toolbox' {
  export function localCopy<C extends Component = Component, T = unknown>(
    memo: UsefulPropsOf<C>,
    initializer?: T | (() => T)
  ): PropertyDecorator;
}
