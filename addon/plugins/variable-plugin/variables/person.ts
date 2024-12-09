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
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { recreateVariableUris } from '../utils/recreate-variable-uris';

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
        const aboutNode = contentNode?.querySelector('[about]');
        if (aboutNode) {
          const firstNameNode = aboutNode.querySelector(
            `[property="${FOAF('gebruikteVoornaam').full}"]`,
          );
          const lastNameNode = aboutNode.querySelector(
            `[property="${PERSOON('familyName').full}"]`,
          );
          value = {
            uri: aboutNode.getAttribute('about') || '',
            firstName: firstNameNode?.textContent || '',
            lastName: lastNameNode?.textContent || '',
          };
        }
        return {
          ...attrs,
          value,
        };
      }

      return false;
    },
    contentElement: '[data-content-container="true"]',
  },
];

const serialize = (node: PNode, state: EditorState): DOMOutputSpec => {
  const t = getTranslationFunction(state);
  const person = node.attrs.value as Person | undefined;
  return renderRdfaAware({
    renderable: node,
    tag: 'span',
    attrs: {},
    content: person
      ? generatePersonHtml(person)
      : t(
          'variable-plugin.person.nodeview-placeholder',
          TRANSLATION_FALLBACKS.nodeview_placeholder,
        ),
  });
};

function generatePersonHtml(person: Person) {
  return [
    'span',
    {
      about: person.uri,
    },
    [
      'span',
      {
        property: FOAF('gebruikteVoornaam').full,
      },
      person.firstName,
    ],
    [
      'span',
      {
        property: PERSOON('familyName').full,
      },
      person.lastName,
    ],
  ];
}

const emberNodeConfig: EmberNodeConfig = {
  name: 'person-variable',
  component: PersonNodeViewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  content: 'inline*',
  atom: true,
  recreateUriFunction: recreateVariableUris,
  draggable: false,
  needsFFKludge: true,
  editable: true,
  selectable: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
    value: {
      default: null,
    },
  },
  serialize,
  parseDOM,
};

export const person_variable = createEmberNodeSpec(emberNodeConfig);
export const personVariableView = createEmberNodeView(emberNodeConfig);
