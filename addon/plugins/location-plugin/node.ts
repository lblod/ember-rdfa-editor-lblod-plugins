import { v4 as uuidv4 } from 'uuid';
import type { ComponentLike } from '@glint/template';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  DOMOutputSpec,
  EditorState,
  PNode,
  ParseRule,
} from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  getRdfaAttrs,
  rdfaAttrSpec,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  hasRdfaVariableType,
  isVariable,
  parseLabel,
  parseVariableInstance,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-attribute-parsers';
import {
  hasOutgoingNamedNodeTriple,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { contentSpan } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import AddressNodeviewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/location-plugin/nodeview';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/address-helpers';
import { Place } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';
import {
  constructAddressNode,
  parseAddressNode,
  parseOldAddressNode,
} from './node-contents/address';
import { constructPlaceSpec, parsePlaceElement } from './node-contents/place';

const rdfaAware = true;

const parseDOM: ParseRule[] = [
  {
    tag: 'span',
    getAttrs(node: HTMLElement) {
      const attrs = getRdfaAttrs(node, { rdfaAware });
      if (!attrs) {
        return false;
      }
      const dataContainer = node.querySelector(
        '[data-content-container="true"]',
      );
      if (
        hasOutgoingNamedNodeTriple(attrs, RDF('type'), EXT('Mapping')) &&
        dataContainer &&
        hasRdfaVariableType(attrs, 'address')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        // Filter out properties with content predicate,
        // as we handle this ourselves with the `value` attribute
        attrs.properties = attrs.properties.filter((prop) => {
          return !EXT('content').matches(prop.predicate);
        });
        let location: Address | Place | undefined;

        const addressNode = [...dataContainer.children].find((el) =>
          hasRDFaAttribute(el, 'property', EXT('content')),
        );
        location = parseAddressNode(addressNode);
        if (!location) {
          location = parsePlaceElement(dataContainer);
        }
        return {
          ...attrs,
          value: location ?? parseOldAddressNode(addressNode || dataContainer),
        };
      }
      return false;
    },
  },
  {
    tag: 'span',
    // Match pre-rdfaAware address variable nodes
    getAttrs: (node: HTMLElement) => {
      if (isVariable(node) && parseVariableType(node) === 'address') {
        const mappingResource = node.getAttribute('resource');
        if (!mappingResource) {
          return false;
        }
        const variableInstance = parseVariableInstance(node);
        const label = parseLabel(node);

        const addressNode = [...node.children].find((el) =>
          hasRDFaAttribute(el, 'property', EXT('content')),
        );
        if (!addressNode) {
          return false;
        }

        const properties = [
          {
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(EXT('Mapping').full),
          },
          {
            predicate: EXT('instance').full,
            object: sayDataFactory.namedNode(
              variableInstance ??
                `http://data.lblod.info/variables/${uuidv4()}`,
            ),
          },
          {
            predicate: DCT('type').full,
            object: sayDataFactory.literal('address'),
          },
        ];
        if (label) {
          properties.push({
            predicate: EXT('label').full,
            object: sayDataFactory.literal(label),
          });
        }

        return {
          value: parseOldAddressNode(addressNode),
          subject: mappingResource,
          rdfaNodeType: 'resource',
          __rdfaId: uuidv4(),
          properties,
        };
      }

      return false;
    },
  },
];

const serialize = (node: PNode, state: EditorState): DOMOutputSpec => {
  const t = getTranslationFunction(state);

  const { value } = node.attrs;
  let contentNode: DOMOutputSpec | undefined;
  if (value) {
    // TODO we should be setting the type properly rather than using the address placeholder but
    // that's a bigger change, so just hack around it for now
    // const type = getOutgoingTriple(node.attrs, RDF('type'));
    if (value instanceof Address) {
      contentNode = constructAddressNode(value);
    } else if (value instanceof Place) {
      // const resource = getOutgoingTriple(node.attrs, DCT('spatial'));
      contentNode = constructPlaceSpec(value);
    }
  }
  if (!contentNode) {
    const placeholder = t(
      'editor-plugins.address.nodeview.placeholder',
      'Voeg adres in',
    );
    contentNode = contentSpan({}, placeholder);
  }
  return renderRdfaAware({
    renderable: node,
    tag: 'span',
    content: contentNode,
  });
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'address',
  component: AddressNodeviewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  atom: true,
  editable: true,
  recreateUri: true,
  uriAttributes: ['variableInstance'],
  draggable: false,
  needsFFKludge: true,
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

export const osloLocation = createEmberNodeSpec(emberNodeConfig);
export const osloLocationView = createEmberNodeView(emberNodeConfig);
