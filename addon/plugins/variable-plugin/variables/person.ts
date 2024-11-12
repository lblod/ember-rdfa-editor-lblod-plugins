import {
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  DOMOutputSpec,
  EditorState,
  getRdfaAttrs,
  PNode,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor';
import { hasRdfaVariableType } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-attribute-parsers';
import PersonNodeViewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/person/nodeview';
import type { ComponentLike } from '@glint/template';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import Mandatee from '@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';

const TRANSLATION_FALLBACKS = {
  nodeview_placeholder: 'persoon',
};

const rdfaAware = true;
const parseDOM = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      const attrs = getRdfaAttrs(node, { rdfaAware });
      if (!attrs) {
        return false;
      }

      if (
        hasOutgoingNamedNodeTriple(attrs, RDF('type'), EXT('Mapping')) &&
        node.querySelector('[data-content-container="true"]') &&
        hasRdfaVariableType(attrs, 'person')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        return {
          ...attrs,
          mandatee: JSON.parse(node.getAttribute('data-mandatee') ?? '{}'),
        };
      }

      return false;
    },
    contentElement: '[data-content-container="true"]',
  },
];

const serialize = (node: PNode, state: EditorState): DOMOutputSpec => {
  const t = getTranslationFunction(state);
  const mandatee = node.attrs.mandatee as Mandatee;
  return renderRdfaAware({
    renderable: node,
    tag: 'span',
    attrs: {
      ...node.attrs,
      'data-mandatee': JSON.stringify(mandatee),
    },
    content: mandatee
      ? `${mandatee.fullName}`
      : t(
          'variable-plugin.person.nodeview-placeholder',
          TRANSLATION_FALLBACKS.nodeview_placeholder,
        ),
  });
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'person-variable',
  component: PersonNodeViewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  content: 'inline*',
  atom: true,
  recreateUri: true,
  uriAttributes: ['variableInstance'],
  draggable: false,
  needsFFKludge: true,
  editable: true,
  selectable: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
    mandatee: {
      default: null,
    },
  },
  serialize,
  parseDOM,
};

export const person_variable = createEmberNodeSpec(emberNodeConfig);
export const personVariableView = createEmberNodeView(emberNodeConfig);
