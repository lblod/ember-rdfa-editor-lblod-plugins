import type { ComponentLike } from '@glint/template';
import TemplateCommentsComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/template-comments-plugin/template-comment';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const HIDE_FOR_PUBLISH_ATTR = macroCondition(
  dependencySatisfies('@lblod/ember-rdfa-editor', '>=10.6.0'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@lblod/ember-rdfa-editor/utils/strip-html-for-publish')
      .HIDE_FOR_PUBLISH_ATTR
  : 'data-say-hide-for-publish';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';

export const emberNodeConfig: () => EmberNodeConfig = () => {
  return {
    name: 'template-comment',
    component: TemplateCommentsComponent as unknown as ComponentLike,
    contentDomClassNames: ['say-template-comment-content'],
    inline: false,
    group: 'block',
    content: 'block+',
    draggable: false,
    selectable: true,
    isolating: true,
    atom: false,
    attrs: {},
    serialize(_, state) {
      const t = getTranslationFunction(state);
      const heading = t('template-comments-plugin.title', 'Toelichting');

      return [
        'div',
        {
          typeof: EXT('TemplateComment').prefixed,
          class: 'say-template-comment',
          [HIDE_FOR_PUBLISH_ATTR]: true,
        },
        ['p', {}, ['strong', {}, heading]],
        ['div', { property: EXT('content').prefixed }, 0],
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
