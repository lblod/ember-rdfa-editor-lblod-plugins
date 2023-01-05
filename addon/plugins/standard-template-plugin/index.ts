import { NodeSpec, WidgetSpec } from '@lblod/ember-rdfa-editor';
import {
  besluit,
  title,
  description,
  motivering,
  articleContainer,
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
  articleContainer,
};
