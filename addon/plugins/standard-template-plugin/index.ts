import { WidgetSpec } from '@lblod/ember-rdfa-editor';
import {
  besluit,
  title,
  description,
  motivering,
  article_container,
  besluit_article,
  besluit_article_content,
  besluit_article_header,
  language_node,
  besluitArticleStructure,
} from './utils/nodes';

export const standardTemplateWidget: WidgetSpec = {
  desiredLocation: 'insertSidebar',
  componentName: 'standard-template-plugin/card',
};

export const besluitNodes = {
  besluit,
  title,
  description,
  motivering,
  article_container,
  besluit_article,
  besluit_article_content,
  besluit_article_header,
  language_node,
};

export const structureSpecs = [besluitArticleStructure];
