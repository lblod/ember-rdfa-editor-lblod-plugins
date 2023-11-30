import { StructureSpec } from '..';
import {
  constructStructureBodyNodeSpec,
  constructStructureNodeSpec,
  romanize,
} from '../utils/structure';
import { v4 as uuid } from 'uuid';
import { RdfaAttrs } from '@lblod/ember-rdfa-editor';
import {
  ELI,
  EXT,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { constructStructureHeader } from './structure-header';

const PLACEHOLDERS = {
  title: 'article-structure-plugin.placeholder.subsection.heading',
  body: 'article-structure-plugin.placeholder.subsection.body',
};

export const subsectionSpec: StructureSpec = {
  name: 'subsection',
  continuous: false,
  translations: {
    insert: 'article-structure-plugin.insert.subsection',
    move: {
      up: 'article-structure-plugin.move-up.subsection',
      down: 'article-structure-plugin.move-down.subsection',
    },
    remove: 'article-structure-plugin.remove.subsection',
    removeWithContent:
      'article-structure-plugin.remove-with-content.subsection',
  },
  constructor: ({ schema, number, intl, content, state }) => {
    const numberConverted = romanize(number ?? 1);
    const translationWithDocLang = getTranslationFunction(state);
    const resourceUuid = uuid();
    const titleRdfaId = uuid();
    const headingRdfaId = uuid();
    const bodyRdfaId = uuid();
    const resource = `http://data.lblod.info/subsections/${resourceUuid}`;
    const titleText = translationWithDocLang(
      PLACEHOLDERS.title,
      intl?.t(PLACEHOLDERS.title) || '',
    );
    const sectionAttrs: RdfaAttrs = {
      __rdfaId: resourceUuid,
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
    const node = schema.node(`subsection`, sectionAttrs, [
      constructStructureHeader({
        schema,
        level: 6,
        number: numberConverted,
        titleRdfaId,
        titleText,
        headingRdfaId,
        backlinkResource: resource,
      }),
      schema.node(
        `subsection_body`,
        {},
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

export const subsection = constructStructureNodeSpec({
  type: SAY('Subsection'),
  content: 'structure_header subsection_body',
});

export const subsection_body = constructStructureBodyNodeSpec({
  content: '(article|block)+',
});
