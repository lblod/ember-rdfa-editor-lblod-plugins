import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { paragraphWithConfig } from '@lblod/ember-rdfa-editor/nodes/paragraphWithConfig';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  return {
    name: 'template-comment',
    componentPath: 'template-comments-plugin/template-comment',
    inline: false,
    group: 'block',
    content: '(templateCommentParagraph | list)+',
    draggable: false,
    selectable: true,
    isolating: true,
    atom: false,
    attrs: {},
    toDOM() {
      return [
        'div',
        {
          typeof: EXT('TemplateComment').prefixed,
        },
        [
          'i',
          {},
          ['h3', {}, 'toelichtingsbepaling'],
          ['div', { property: EXT('content').prefixed }, 0],
        ],
      ];
    },
    parseDOM: [
      {
        tag: 'div',
        getAttrs(element: HTMLElement) {
          if (hasRDFaAttribute(element, 'typeof', EXT('TemplateComment'))) {
            return {};
          }
          return false;
        },
        contentElement: `div[property~='${EXT('content').prefixed}'],
        div[property~='${EXT('content').full}']`,
      },
    ],
  };
};

export const templateComment = createEmberNodeSpec(emberNodeConfig());
export const templateCommentView = createEmberNodeView(emberNodeConfig());
export const templateCommentNodes = {
  templateCommentParagraph: paragraphWithConfig({
    marks: 'strong underline strikethrough',
    // don't add to block group, so it is only allowed for template comment
    // but add to paragraphGroup so lists accept it
    group: 'paragraphGroup',
    name: 'templateCommentParagraph',
  }),
  templateComment: templateComment,
};
