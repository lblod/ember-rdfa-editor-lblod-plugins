import { StructureSpec } from '..';
import {
  constructStructureBodyNodeSpec,
  constructStructureNodeSpec,
  romanize,
} from '../utils/structure';
import { v4 as uuid } from 'uuid';
import { RdfaAttrs } from '@lblod/ember-rdfa-editor';
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
    const numberRdfaId = uuid();
    const bodyRdfaId = uuid();
    const subject = `http://data.lblod.info/subsections/${resourceUuid}`;
    const titleText = translationWithDocLang(
      PLACEHOLDERS.title,
      intl?.t(PLACEHOLDERS.title) || '',
    );
    const sectionAttrs: RdfaAttrs = {
      __rdfaId: resourceUuid,
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
    const node = schema.node(`subsection`, sectionAttrs, [
      constructStructureHeader({
        schema,
        level: 6,
        number: numberConverted,
        titleRdfaId,
        titleText,
        headingRdfaId,
        numberRdfaId,
        backlinkResource: subject,
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

    return {
      node,
      selectionConfig: {
        type: content ? 'text' : 'node',
        rdfaId: bodyRdfaId,
      },
      newResource: subject,
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

export const subsection = constructStructureNodeSpec({
  type: SAY('Subsection'),
  content: 'structure_header subsection_body',
});

export const subsection_body = constructStructureBodyNodeSpec({
  content: '(article|block)+',
  context: 'subsection/',
});
