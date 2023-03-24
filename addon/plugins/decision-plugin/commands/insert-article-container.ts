import { Command, Schema } from '@lblod/ember-rdfa-editor';
import insertNodeIntoAncestorAtPoint from '@lblod/ember-rdfa-editor-lblod-plugins/utils/insert-block-into-node';
import { v4 as uuid } from 'uuid';
import { besluitArticleStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin/utils/nodes';
import IntlService from 'ember-intl/services/intl';

interface InsertArticleContainerArgs {
  intl: IntlService;
  validateShapes?: Set<string>;
}

export default function insertArticleContainer({
  intl,
  validateShapes,
}: InsertArticleContainerArgs): Command {
  return insertNodeIntoAncestorAtPoint({
    validateShapes,
    ancestorType(schema: Schema) {
      return schema.nodes.besluit;
    },
    nodeToInsert(schema: Schema) {
      return schema.node(
        'article_container',
        {
          __rdfaId: uuid(),
        },
        besluitArticleStructure.constructor({
          schema,
          intl,
        }).node
      );
    },
  });
}
