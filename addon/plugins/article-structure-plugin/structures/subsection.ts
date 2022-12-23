import romanize from '@lblod/ember-rdfa-editor-lblod-plugins/utils/romanize';
import constructStructureType from '../utils/construct-structure-type';

export const subsection_structure = constructStructureType({
  name: 'subsection',
  type: 'https://say.data.gift/ns/Subsection',
  resourcePrefix: 'http://data.lblod.info/subsections/',
  context: ['section_content'],
  content: '(paragraph)+',
  continuous: false,
  titlePlaceholder: 'Insert subsection title',
  contentPlaceholder: 'Insert subsection content',
  numberingFunction: romanize,
});
