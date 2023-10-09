import {
  besluit,
  besluit_title,
  description,
  motivering,
  article_container,
  besluit_article,
  besluit_article_content,
  besluit_article_header,
  language_node,
  besluitArticleStructure,
} from './utils/nodes';

export { default as instantiateUuids } from './utils/instantiate-uuids';

export const besluitNodes = {
  besluit,
  besluit_title,
  description,
  motivering,
  article_container,
  besluit_article,
  besluit_article_content,
  besluit_article_header,
  language_node,
};

export const structureSpecs = [besluitArticleStructure];
