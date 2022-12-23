import romanize from '@lblod/ember-rdfa-editor-lblod-plugins/utils/romanize';
import constructStructureType from '../utils/construct-structure-type';

export const chapter_structure = constructStructureType({
  name: 'chapter',
  type: 'https://say.data.gift/ns/Chapter',
  resourcePrefix: 'http://data.lblod.info/chapters/',
  context: ['doc'],
  content: '(section|paragraph)+',
  continuous: false,
  titlePlaceholder: 'Insert chapter title',
  contentPlaceholder: 'Insert chapter content',
  numberingFunction: romanize,
});
