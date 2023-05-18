import { Schema } from '@lblod/ember-rdfa-editor';

export const atLeastOneArticleContainer = (schema: Schema) => ({
  name: 'at-least-one-article-container',
  focusNodeType: schema.nodes.besluit,
  path: ['article_container'],
  message: 'Document must contain at least one article container.',
  constraints: {
    minCount: 1,
  },
});
