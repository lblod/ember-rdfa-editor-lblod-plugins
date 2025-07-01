// Types for compiled templates
declare module '@lblod/ember-rdfa-editor-lblod-plugins/templates/*' {
  import { TemplateFactory } from 'ember-cli-htmlbars';

  const tmpl: TemplateFactory;
  export default tmpl;
}
declare module 'n2words' {
  export default function n2words(
    number: number,
    options: { lang: string },
  ): string;
}

declare module '@lblod/lib-decision-shapes' {
  export function getShapeOfDocumentType(shape: string): string;
}
