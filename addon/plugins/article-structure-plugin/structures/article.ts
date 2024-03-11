import { PNode, RdfaAttrs } from '@lblod/ember-rdfa-editor';
import { StructureSpec } from '..';
import {
  constructStructureBodyNodeSpec,
  constructStructureNodeSpec,
  constructStructureHeaderNodeSpec,
  getNumberUtils,
} from '../utils/structure';
import { constructStructureHeader } from './structure-header';
import { v4 as uuid } from 'uuid';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  ELI,
  EXT,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';

const PLACEHOLDERS = {
  title: 'article-structure-plugin.placeholder.article.heading',
  body: 'article-structure-plugin.placeholder.article.body',
};
export const articleSpec: StructureSpec = {
  name: 'article',
  translations: {
    insert: 'article-structure-plugin.insert.article',
    move: {
      up: 'article-structure-plugin.move-up.article',
      down: 'article-structure-plugin.move-down.article',
    },
    remove: 'article-structure-plugin.remove.article',
    removeWithContent: 'article-structure-plugin.remove-with-content.article',
  },
  continuous: true,
  constructor: ({ schema, number, content, intl, state }) => {
    const numberConverted = number?.toString() ?? '1';
    const translationWithDocLang = getTranslationFunction(state);
    const articleUuid = uuid();
    const titleRdfaId = uuid();
    const headingRdfaId = uuid();
    const numberRdfaId = uuid();
    const bodyRdfaId = uuid();
    const subject = `http://data.lblod.info/articles/${articleUuid}`;
    const titleText = translationWithDocLang(
      PLACEHOLDERS.title,
      intl?.t(PLACEHOLDERS.title) || '',
    );
    const articleAttrs: RdfaAttrs = {
      __rdfaId: articleUuid,
      rdfaNodeType: 'resource',
      subject,
      properties: [
        {
          predicate: ELI('number').prefixed,
          object: sayDataFactory.literalNode(numberRdfaId),
        },
        {
          predicate: SAY('heading').prefixed,
          object: sayDataFactory.literalNode(headingRdfaId),
        },
        {
          predicate: EXT('title').prefixed,
          object: sayDataFactory.literalNode(titleRdfaId),
        },
        {
          predicate: SAY('body').prefixed,
          object: sayDataFactory.literalNode(bodyRdfaId),
        },
      ],
      backlinks: [],
    };
    const bodyAttrs: RdfaAttrs = {
      __rdfaId: bodyRdfaId,
      rdfaNodeType: 'literal',
      backlinks: [
        {
          subject: sayDataFactory.literalNode(subject),
          predicate: SAY('body').prefixed,
        },
      ],
    };
    const node = schema.node(`article`, articleAttrs, [
      constructStructureHeader({
        schema,
        backlinkResource: subject,
        titleRdfaId,
        titleText,
        headingRdfaId,
        numberRdfaId,
        number: numberConverted,
        headerType: 'article_header',
      }),
      schema.node(
        `article_body`,
        bodyAttrs,
        content ??
          schema.node(
            'paragraph',
            {},
            schema.node('placeholder', {
              placeholderText: translationWithDocLang(
                PLACEHOLDERS.body,
                intl?.t(PLACEHOLDERS.body) || '',
              ),
            }),
          ),
      ),
    ]);

    return {
      node,
      selectionConfig: {
        type: content ? 'text' : 'node',
        rdfaId: bodyRdfaId,
      },
      newResource: subject,
    };
  },
  ...getNumberUtils({
    offset: 1,
    convertNumber: (number) => number.toString(),
  }),
  content: ({ pos, state }) => {
    const node = unwrap(state.doc.nodeAt(pos));
    return node.child(1).content;
  },
};

export const article = constructStructureNodeSpec({
  type: SAY('Article'),
  content: 'article_header article_body',
});

export const article_header = constructStructureHeaderNodeSpec({
  type: 'article_header',
  includeLevel: false,
  outlineText: (node: PNode) => {
    const { number } = node.attrs;
    return `Artikel ${number as string}: ${node.textContent}`;
  },
});

export const article_body = constructStructureBodyNodeSpec({
  content: '(block|article_paragraph)+',
  context: 'article//',
});
