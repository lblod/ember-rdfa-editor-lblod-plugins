import romanize from '@lblod/ember-rdfa-editor-lblod-plugins/utils/romanize';
import constructStructureType from '../utils/construct-structure-type';

export const section_structure = constructStructureType({
  name: 'section',
  type: 'https://say.data.gift/ns/Section',
  resourcePrefix: 'http://data.lblod.info/sections/',
  context: ['chapter_content'],
  content: '(subsection|paragraph)+',
  continuous: false,
  titlePlaceholder: 'Insert section title',
  contentPlaceholder: 'Insert section content',
  numberingFunction: romanize,
});
