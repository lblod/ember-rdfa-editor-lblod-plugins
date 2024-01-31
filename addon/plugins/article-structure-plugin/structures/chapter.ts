import { RdfaAttrs } from '@lblod/ember-rdfa-editor';
import { StructureSpec } from '..';
import {
  constructStructureBodyNodeSpec,
  constructStructureNodeSpec,
  romanize,
} from '../utils/structure';
import { v4 as uuid } from 'uuid';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  ELI,
  EXT,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { constructStructureHeader } from './structure-header';

const PLACEHOLDERS = {
  title: 'article-structure-plugin.placeholder.chapter.heading',
  body: 'article-structure-plugin.placeholder.chapter.body',
};
export const chapterSpec: StructureSpec = {
  name: 'chapter',
  continuous: false,
  translations: {
    insert: 'article-structure-plugin.insert.chapter',
    move: {
      up: 'article-structure-plugin.move-up.chapter',
      down: 'article-structure-plugin.move-down.chapter',
    },
    remove: 'article-structure-plugin.remove.chapter',
    removeWithContent: 'article-structure-plugin.remove-with-content.chapter',
  },
  constructor: ({ schema, number, content, intl, state }) => {
    const numberConverted = romanize(number ?? 1);
    const translationWithDocLang = getTranslationFunction(state);
    const titleText = translationWithDocLang(
      PLACEHOLDERS.title,
      intl?.t(PLACEHOLDERS.title) || '',
    );
    const chapterUuid = uuid();
    const headingRdfaId = uuid();
    const titleRdfaId = uuid();
    const numberRdfaId = uuid();
    const bodyRdfaId = uuid();
    const chapterResource = `http://data.lblod.info/chapters/${chapterUuid}`;
    const chapterAttrs: RdfaAttrs = {
      __rdfaId: chapterUuid,
      rdfaNodeType: 'resource',
      resource: chapterResource,
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
          subject: sayDataFactory.literalNode(chapterResource),
          predicate: SAY('body').prefixed,
        },
      ],
    };
    const node = schema.node(`chapter`, chapterAttrs, [
      constructStructureHeader({
        schema,
        titleRdfaId,
        titleText,
        headingRdfaId,
        backlinkResource: chapterResource,
        numberRdfaId,
        number: numberConverted,
        level: 4,
      }),
      schema.node(
        `chapter_body`,
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
      newResource: chapterResource,
    };
  },
  updateNumber: {
    convertNumber: romanize,
  },
  content: ({ pos, state }) => {
    const node = unwrap(state.doc.nodeAt(pos));
    return node.child(1).content;
  },
};

export const chapter = constructStructureNodeSpec({
  type: SAY('Chapter'),
  content: 'structure_header chapter_body',
});

export const chapter_body = constructStructureBodyNodeSpec({
  content: '(section|block)+|(article|block)+',
  context: 'chapter/',
});
