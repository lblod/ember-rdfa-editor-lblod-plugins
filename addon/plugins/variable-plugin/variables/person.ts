import {
  EXT,
  FOAF,
  RDF,
  PERSOON,
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
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { createPersonVariableAttrs } from '../actions/create-person-variable';

const TRANSLATION_FALLBACKS = {
  nodeview_placeholder: 'persoon',
};

export type Person = {
  uri: string;
  firstName: string;
  lastName: string;
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
        node.dataset.sayVariable &&
        node.dataset.sayVariableType === 'person'
      ) {
        const label = node.dataset.label;
        return {
          ...attrs,
          label,
        };
      }
      return false;
    },
  },
];
const parseDOMLegacy = [
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
        let value: Person | undefined;
        const contentNode = node.querySelector(
          '[data-content-container="true"]',
        );
        const aboutNode = contentNode?.querySelector(
          `[property="${EXT('content').full}"],[property="${EXT('content').prefixed}]`,
        );
        if (aboutNode) {
          const firstNameNode = aboutNode.querySelector(
            `[property="${FOAF('gebruikteVoornaam').full}"],[property="${FOAF('gebruikteVoornaam').prefixed}"]`,
          );
          const lastNameNode = aboutNode.querySelector(
            `[property="${PERSOON('familyName').full}"],[property="${PERSOON('familyName').prefixed}"]`,
          );
          value = {
            uri: aboutNode.getAttribute('resource') || '',
            firstName: firstNameNode?.textContent || '',
            lastName: lastNameNode?.textContent || '',
          };
        } else {
          // Backwards compatibility
          if (node.dataset.value) {
            value = JSON.parse(node.dataset.value) as Person | undefined;
          } else if (node.dataset.mandatee) {
            const mandatee = JSON.parse(node.dataset.mandatee) as
              | {
                  personUri: string;
                  firstName: string;
                  lastName: string;
                }
              | undefined;
            if (mandatee) {
              value = {
                uri: mandatee.personUri,
                firstName: mandatee.firstName,
                lastName: mandatee.lastName,
              };
            }
          }
        }
        return createPersonVariableAttrs({
          label: getOutgoingTriple(attrs, EXT('label'))?.object.value,
          value,
        });
      }

      return false;
    },
    contentElement: '[data-content-container="true"]',
  },
];

const serialize = (node: PNode, state: EditorState): DOMOutputSpec => {
  const t = getTranslationFunction(state);
  const firstName = getOutgoingTriple(node.attrs, FOAF('givenName'))?.object
    .value;
  const lastName = getOutgoingTriple(node.attrs, FOAF('familyName'))?.object
    .value;
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  return renderRdfaAware({
    renderable: node,
    tag: 'span',
    attrs: {
      'data-say-variable': 'true',
      'data-say-variable-type': 'person',
      'data-label': node.attrs['label'],
    },
    content:
      fullName ??
      t(
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
  draggable: false,
  needsFFKludge: true,
  editable: true,
  selectable: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
    label: {
      default: null,
    },
  },
  serialize,
  parseDOM: [...parseDOM, ...parseDOMLegacy],
};

export const person_variable = createEmberNodeSpec(emberNodeConfig);
export const personVariableView = createEmberNodeView(emberNodeConfig);
