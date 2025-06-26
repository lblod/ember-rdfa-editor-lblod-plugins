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
  TagParseRule,
} from '@lblod/ember-rdfa-editor';
import {
  getRdfaAttrs,
  rdfaAttrSpec,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import {
  EXT,
  LOCN,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  hasRdfaVariableType,
  isVariable,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-attribute-parsers';
import {
  hasOutgoingNamedNodeTriple,
  hasRDFaAttribute,
  Resource,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { contentSpan } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import AddressNodeviewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/location-plugin/nodeview';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/address-helpers';
import {
  Area,
  Place,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';
import { findChildWithRdfaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { NodeContentsUtils } from './node-contents';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';

export interface LocationPluginConfig {
  defaultAddressUriRoot: string;
  defaultPlaceUriRoot: string;
  defaultPointUriRoot: string;
  subjectTypesToLinkTo?: Resource[];
}

const parseDOM = (config: LocationPluginConfig): TagParseRule[] => {
  const nodeContentsUtils = new NodeContentsUtils(config);
  return [
    {
      tag: 'span',
      getAttrs(node: HTMLElement) {
        const attrs = getRdfaAttrs(node, { rdfaAware: true });
        if (!attrs) {
          return false;
        }
        const contentContainer = node.querySelector(
          '[data-content-container="true"]',
        );
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }

        // Do not parse if using old 'variable style'
        if (hasOutgoingNamedNodeTriple(attrs, RDF('type'), EXT('Mapping'))) {
          return false;
        }
        if (contentContainer) {
          const location =
            nodeContentsUtils.address.parse(contentContainer.children[0]) ||
            nodeContentsUtils.place.parse(contentContainer.children[0]) ||
            nodeContentsUtils.area.parse(contentContainer.children[0]);
          if (location) {
            // Ignore the properties for now, we handle these ourselves
            const properties: OutgoingTriple[] = [];
            return {
              ...attrs,
              properties,
              value: location,
            };
          }
        }
        return false;
      },
    },
    // Match 'variable style' node, with additional 'mapping' wrapper
    {
      tag: 'span',
      getAttrs(node: HTMLElement) {
        const attrs = getRdfaAttrs(node, { rdfaAware: true });
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

          const addressNode = [...dataContainer.children].find((el) =>
            hasRDFaAttribute(el, 'property', EXT('content')),
          );
          let location: Place | Area | Address | undefined =
            nodeContentsUtils.address.parse(addressNode);
          if (addressNode && !location) {
            const placeNode = findChildWithRdfaAttribute(
              addressNode,
              'typeof',
              LOCN('Location'),
            );
            if (placeNode) {
              location =
                nodeContentsUtils.place.parse(placeNode) ||
                nodeContentsUtils.area.parse(placeNode);
            }
          }
          const value =
            location ??
            nodeContentsUtils.address.parseOld(addressNode || dataContainer);
          if (!value) {
            return false;
          }
          return {
            rdfaNodeType: 'resource',
            subject: value.uri,
            value,
            backlinks: [],
            properties: [],
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

          const addressNode = [...node.children].find((el) =>
            hasRDFaAttribute(el, 'property', EXT('content')),
          );
          if (!addressNode) {
            return false;
          }

          const value = nodeContentsUtils.address.parseOld(addressNode);

          if (!value) {
            return false;
          }

          return {
            rdfaNodeType: 'resource',
            subject: value.uri,
            value,
            properties: [],
            backlinks: [],
          };
        }

        return false;
      },
    },
  ];
};

const serialize =
  (config: LocationPluginConfig) =>
  (node: PNode, state: EditorState): DOMOutputSpec => {
    const t = getTranslationFunction(state);
    const nodeContentsUtils = new NodeContentsUtils(config);

    const { value } = node.attrs;
    let contentNode: DOMOutputSpec | undefined;
    if (value) {
      if (value instanceof Address) {
        contentNode = nodeContentsUtils.address.construct(value);
      } else if (value instanceof Place) {
        contentNode = nodeContentsUtils.place.construct(value);
      } else if (value instanceof Area) {
        contentNode = nodeContentsUtils.area.construct(value);
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
      attrs: {
        class: `${getClassnamesFromNode(node)}${value ? '' : ' say-variable'}`,
      },
    });
  };

const emberNodeConfig = (config: LocationPluginConfig): EmberNodeConfig => ({
  name: 'address',
  component: AddressNodeviewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  atom: true,
  editable: true,
  draggable: false,
  needsFFKludge: true,
  selectable: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware: true }),
    value: {
      default: null,
    },
  },
  classNames: ['say-oslo-location'],
  serialize: serialize(config),
  parseDOM: parseDOM(config),
});

export const osloLocation = (config: LocationPluginConfig) =>
  createEmberNodeSpec(emberNodeConfig(config));
export const osloLocationView = (config: LocationPluginConfig) =>
  createEmberNodeView(emberNodeConfig(config));
