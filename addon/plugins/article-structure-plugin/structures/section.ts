import {
  constructStructureBodyNodeSpec,
  constructStructureNodeSpec,
  romanize,
} from '../utils/structure';
import { v4 as uuid } from 'uuid';
import { StructureSpec } from '..';
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
  title: 'article-structure-plugin.placeholder.section.heading',
  body: 'article-structure-plugin.placeholder.section.body',
};
export const sectionSpec: StructureSpec = {
  name: 'section',
  continuous: false,
  translations: {
    insert: 'article-structure-plugin.insert.section',
    move: {
      up: 'article-structure-plugin.move-up.section',
      down: 'article-structure-plugin.move-down.section',
    },
    remove: 'article-structure-plugin.remove.section',
    removeWithContent: 'article-structure-plugin.remove-with-content.section',
  },
  constructor: ({ schema, number, content, intl, state }) => {
    const numberConverted = romanize(number || 1);
    const translationWithDocLang = getTranslationFunction(state);
    const resourceUuid = uuid();
    const titleRdfaId = uuid();
    const headingRdfaId = uuid();
    const numberRdfaId = uuid();
    const bodyRdfaId = uuid();
    const resource = `http://data.lblod.info/sections/${resourceUuid}`;
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
          type: 'external',
          predicate: ELI('number').prefixed,
          object: { type: 'literal', rdfaId: numberRdfaId },
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
    const node = schema.node(`section`, sectionAttrs, [
      constructStructureHeader({
        schema,
        level: 5,
        number: numberConverted,
        titleRdfaId,
        titleText,
        headingRdfaId,
        numberRdfaId,
        backlinkResource: resource,
      }),
      schema.node(
        `section_body`,
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

export const section = constructStructureNodeSpec({
  type: SAY('Section'),
  content: 'structure_header section_body',
});

export const section_body = constructStructureBodyNodeSpec({
  content: '(subsection|block)+|(article|block)+',
  context: 'section/',
});
