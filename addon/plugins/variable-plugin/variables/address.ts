import {
  ADRES,
  ADRES_TYPO,
  DCT,
  EXT,
  GENERIEK,
  GEOSPARQL,
  LOCN,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { v4 as uuidv4 } from 'uuid';
import {
  DOMOutputSpec,
  EditorState,
  PNode,
  TagParseRule,
} from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  hasRdfaVariableType,
  isVariable,
  parseLabel,
  parseVariableInstance,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-attribute-parsers';
import {
  findChildWithRdfaAttribute,
  hasOutgoingNamedNodeTriple,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  contentSpan,
  span,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import AddressNodeviewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/address/nodeview';
import type { ComponentLike } from '@glint/template';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import {
  getRdfaAttrs,
  rdfaAttrSpec,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import {
  Address,
  constructLambert72WKTString,
  type Lambert72Coordinates,
  parseLambert72GMLString,
  parseLambert72WKTString,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/address-helpers';
import { recreateVariableUris } from '../utils/recreate-variable-uris';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';

const rdfaAware = true;

const constructLocationNode = (location: Lambert72Coordinates) => {
  return span(
    {
      property: ADRES('positie').full,
      typeof: GENERIEK('GeografischePositie').full,
    },
    span({
      property: GEOSPARQL('asWKT').full,
      datatype: GEOSPARQL('wktLiteral').full,
      content: constructLambert72WKTString(location),
    }),
  );
};

const constructAddressNode = (address: Address) => {
  const housenumberNode = address.housenumber
    ? [
        ' ',
        span(
          {
            property: ADRES('Adresvoorstelling.huisnummer').full,
          },
          address.housenumber,
        ),
      ]
    : [];
  const busnumberNode = address.busnumber
    ? [
        ' bus ',
        span(
          {
            property: ADRES('Adresvoorstelling.busnummer').full,
          },
          address.busnumber,
        ),
      ]
    : [];
  const idNode = address.id
    ? [
        span({
          property: ADRES('verwijstNaar').full,
          content: address.id,
        }),
      ]
    : [];
  return contentSpan(
    { resource: address.id, typeof: LOCN('Address').full },
    span(
      {
        property: DCT('spatial').full,
      },
      span(
        {
          property: LOCN('thoroughfare').full,
        },
        address.street,
      ),
      ...housenumberNode,
      ...busnumberNode,
    ),
    ', ',
    span(
      {
        property: LOCN('postcode').full,
      },
      address.zipcode,
    ),
    ' ',
    span(
      {
        property: ADRES('gemeentenaam').full,
        language: 'nl',
      },
      address.municipality,
    ),
    ...idNode,
    constructLocationNode(address.location),
  );
};

const parseOldAddressNode = (addressNode: Element): Address | undefined => {
  const id = addressNode.getAttribute('resource');
  const street = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES_TYPO('heeftStraatnaam'),
  )?.textContent;
  const housenumber = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES_TYPO('huisnummer'),
  )?.textContent;
  const busnumber = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES_TYPO('busnummer'),
  )?.textContent;
  const postInfoNode = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES_TYPO('heeftPostinfo'),
  );
  const zipcode =
    postInfoNode &&
    findChildWithRdfaAttribute(postInfoNode, 'property', ADRES_TYPO('postcode'))
      ?.textContent;
  const municipality = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES_TYPO('gemeentenaam'),
  )?.textContent;

  const locationNode = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES_TYPO('positie'),
  );
  const gml =
    locationNode &&
    findChildWithRdfaAttribute(
      locationNode,
      'property',
      GEOSPARQL('asGML'),
    )?.getAttribute('content');

  if (street && municipality && zipcode && gml) {
    return new Address({
      id: id ?? undefined,
      street,
      housenumber: housenumber ?? undefined,
      zipcode,
      municipality,
      busnumber: busnumber ?? undefined,
      location: parseLambert72GMLString(gml),
    });
  } else {
    return;
  }
};

const parseAddressNode = (addressNode: Element): Address | undefined => {
  const id = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES('verwijstNaar'),
  )?.getAttribute('content');
  const spatialNode = findChildWithRdfaAttribute(
    addressNode,
    'property',
    DCT('spatial'),
  );
  const street =
    spatialNode &&
    findChildWithRdfaAttribute(spatialNode, 'property', LOCN('thoroughfare'))
      ?.textContent;
  const housenumber =
    spatialNode &&
    findChildWithRdfaAttribute(
      spatialNode,
      'property',
      ADRES('Adresvoorstelling.huisnummer'),
    )?.textContent;
  const busnumber =
    spatialNode &&
    findChildWithRdfaAttribute(
      spatialNode,
      'property',
      ADRES('Adresvoorstelling.busnummer'),
    )?.textContent;
  const zipcode = findChildWithRdfaAttribute(
    addressNode,
    'property',
    LOCN('postcode'),
  )?.textContent;
  const municipality = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES('gemeentenaam'),
  )?.textContent;

  const locationNode = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES('positie'),
  );
  const wkt =
    locationNode &&
    findChildWithRdfaAttribute(
      locationNode,
      'property',
      GEOSPARQL('asWKT'),
    )?.getAttribute('content');

  if (street && municipality && zipcode && wkt) {
    return new Address({
      id: id ?? undefined,
      street,
      housenumber: housenumber ?? undefined,
      zipcode,
      municipality,
      busnumber: busnumber ?? undefined,
      location: parseLambert72WKTString(wkt),
    });
  } else {
    return;
  }
};

const parseDOM: TagParseRule[] = [
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
        const addressNode = [...dataContainer.children].find((el) =>
          hasRDFaAttribute(el, 'property', EXT('content')),
        );
        if (!addressNode) {
          return false;
        }
        const address = parseAddressNode(addressNode);
        return {
          ...attrs,
          value: address ?? parseOldAddressNode(addressNode),
        };
      }
      return false;
    },
  },
  {
    tag: 'span',
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

        const properties: OutgoingTriple[] = [
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
          value: parseAddressNode(addressNode),
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
  let contentNode: DOMOutputSpec;
  if (value) {
    contentNode = constructAddressNode(value);
  } else {
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

const emberNodeConfig: EmberNodeConfig = {
  name: 'address',
  component: AddressNodeviewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  atom: true,
  editable: true,
  recreateUri: true,
  recreateUriFunction: recreateVariableUris,
  draggable: false,
  needsFFKludge: true,
  selectable: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware }),
    value: {
      default: null,
    },
  },
  classNames: ['say-address-variable'],
  serialize,
  parseDOM,
};

/**
 * @deprecated Use oslo_location node instead which inserts valid OSLO model RDFa and supports
 * linking to the document it is in.
 */
export const address = createEmberNodeSpec(emberNodeConfig);
/**
 * @deprecated Use oslo_location node instead which inserts valid OSLO model RDFa and supports
 * linking to the document it is in.
 */
export const addressView = createEmberNodeView(emberNodeConfig);
