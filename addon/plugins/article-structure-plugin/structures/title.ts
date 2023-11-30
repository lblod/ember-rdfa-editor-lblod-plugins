import { StructureSpec } from '..';
import {
  constructStructureBodyNodeSpec,
  constructStructureNodeSpec,
  romanize,
} from '../utils/structure';
import { constructStructureHeader } from './structure-header';
import { v4 as uuid } from 'uuid';
import { RdfaAttrs } from '@lblod/ember-rdfa-editor';
import {
  ELI,
  EXT,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';

const PLACEHOLDERS = {
  heading: 'article-structure-plugin.placeholder.generic.heading',
  body: 'article-structure-plugin.placeholder.generic.body',
};
export const titleSpec: StructureSpec = {
  name: 'title',
  continuous: false,
  translations: {
    insert: 'article-structure-plugin.insert.title',
    move: {
      up: 'article-structure-plugin.move-up.title',
      down: 'article-structure-plugin.move-down.title',
    },
    remove: 'article-structure-plugin.remove.title',
    removeWithContent: 'article-structure-plugin.remove-with-content.title',
  },
  constructor: ({ schema, number, content, intl, state }) => {
    const numberConverted = romanize(number ?? 1);
    const translationWithDocLang = getTranslationFunction(state);
    const __rdfaId = uuid();
    const titleRdfaId = uuid();
    const headingRdfaId = uuid();
    const bodyRdfaId = uuid();
    const resource = `http://data.lblod.info/titles/${__rdfaId}`;
    const titleText = translationWithDocLang(
      PLACEHOLDERS.heading,
      intl?.t(PLACEHOLDERS.heading) || '',
    );
    const titleAttrs: RdfaAttrs = {
      __rdfaId,
      rdfaNodeType: 'resource',
      resource,
      properties: [
        {
          type: 'attribute',
          predicate: ELI('number').prefixed,
          object: numberConverted,
        },
        {
          type: 'external',
          predicate: SAY('heading').prefixed,
          object: { type: 'literal', rdfaId: headingRdfaId },
        },
        {
          type: 'external',
          predicate: EXT('title').prefixed,
          object: { type: 'literal', rdfaId: titleRdfaId },
        },
        {
          type: 'external',
          predicate: SAY('body').prefixed,
          object: { type: 'literal', rdfaId: bodyRdfaId },
        },
      ],
      backlinks: [],
    };
    const bodyAttrs: RdfaAttrs = {
      __rdfaId: bodyRdfaId,
      rdfaNodeType: 'literal',
      backlinks: [
        {
          subject: resource,
          predicate: SAY('body').prefixed,
        },
      ],
    };
    const node = schema.node(`title`, titleAttrs, [
      constructStructureHeader({
        schema,
        level: 3,
        number: numberConverted,
        titleRdfaId,
        titleText,
        headingRdfaId,
        backlinkResource: resource,
      }),
      schema.node(
        `title_body`,
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
    const selectionConfig: {
      relativePos: number;
      type: 'text' | 'node';
    } = content
      ? { relativePos: 5, type: 'text' }
      : { relativePos: 6, type: 'node' };
    return {
      node,
      selectionConfig,
      newResource: resource,
    };
  },
  updateNumber: ({ number, pos, transaction }) => {
    const numberConverted = romanize(number);
    return transaction.setNodeAttribute(pos + 1, 'number', numberConverted);
  },
  content: ({ pos, state }) => {
    const node = unwrap(state.doc.nodeAt(pos));
    return node.child(1).content;
  },
};

export const title = constructStructureNodeSpec({
  type: SAY('Title'),
  content: 'structure_header title_body',
  allowSplitByTable: false,
});

export const title_body = constructStructureBodyNodeSpec({
  content: '(chapter|block)+|(article|block)+',
  allowSplitByTable: false,
});
