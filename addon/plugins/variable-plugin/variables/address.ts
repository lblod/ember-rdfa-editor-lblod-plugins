import {
  ADRES,
  DCT,
  EXT,
  GENERIEK,
  GEOSPARQL,
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
  ParseRule,
} from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  hasRdfaVariableType,
  isVariable,
  parseLabel,
  parseVariableInstance,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/attribute-parsers';
import {
  findChildWithRdfaAttribute,
  hasOutgoingNamedNodeTriple,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { span } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import { contentSpan } from '../utils/dom-constructors';
import AddressNodeviewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/address/nodeview';
import type { ComponentLike } from '@glint/template';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import {
  getRdfaAttrs,
  rdfaAttrSpec,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';

export class Address {
  declare id?: string;
  declare street: string;
  declare zipcode: string;
  declare municipality: string;
  declare housenumber?: string;
  declare busnumber?: string;
  declare gml: string;
  constructor(
    args: Pick<
      Address,
      | 'street'
      | 'housenumber'
      | 'zipcode'
      | 'municipality'
      | 'id'
      | 'busnumber'
      | 'gml'
    >,
  ) {
    Object.assign(this, args);
  }

  get formatted() {
    if (this.housenumber && this.busnumber) {
      return `${this.street} ${this.housenumber} bus ${this.busnumber}, ${this.zipcode} ${this.municipality}`;
    } else if (this.housenumber) {
      return `${this.street} ${this.housenumber}, ${this.zipcode} ${this.municipality}`;
    } else {
      return `${this.street}, ${this.zipcode} ${this.municipality}`;
    }
  }

  sameAs(
    other?: Pick<
      Address,
      'street' | 'housenumber' | 'busnumber' | 'municipality'
    > | null,
  ) {
    return (
      this.street === other?.street &&
      this.housenumber === other?.housenumber &&
      this.busnumber === other?.busnumber &&
      this.municipality === other?.municipality
    );
  }

  get hasHouseNumber() {
    return !!this.housenumber;
  }
}

const constructLocationNode = (gml: string) => {
  return span(
    {
      property: ADRES('positie').full,
      typeof: GENERIEK('GeografischePositie').full,
    },
    span({
      property: GEOSPARQL('asGML').full,
      datatype: GEOSPARQL('gmlLiteral').full,
      content: gml,
    }),
  );
};

const constructAddressNode = (address: Address) => {
  const housenumberNode = address.housenumber
    ? [
        ' ',
        span(
          {
            property: ADRES('huisnummer').full,
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
            property: ADRES('busnummer').full,
          },
          address.busnumber,
        ),
      ]
    : [];
  return contentSpan(
    { resource: address.id, typeof: ADRES('Adres').full },
    span(
      {
        property: ADRES('heeftStraatnaam').full,
      },
      address.street,
    ),
    ...housenumberNode,
    ...busnumberNode,
    ', ',
    span(
      {
        property: ADRES('heeftPostinfo').full,
        typeof: ADRES('Postinfo').full,
      },
      span(
        {
          property: ADRES('postcode').full,
        },
        address.zipcode,
      ),
    ),
    ' ',
    span(
      {
        property: ADRES('gemeentenaam').full,
      },
      address.municipality,
    ),
    constructLocationNode(address.gml),
  );
};

const parseAddressNode = (addressNode: Element): Address | undefined => {
  const id = addressNode.getAttribute('resource');
  const street = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES('heeftStraatnaam'),
  )?.textContent;
  const housenumber = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES('huisnummer'),
  )?.textContent;
  const busnumber = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES('busnummer'),
  )?.textContent;
  const postInfoNode = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES('heeftPostinfo'),
  );
  const zipcode =
    postInfoNode &&
    findChildWithRdfaAttribute(postInfoNode, 'property', ADRES('postcode'))
      ?.textContent;
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
      gml,
    });
  } else {
    return;
  }
};

const parseDOM: ParseRule[] = [
  {
    tag: 'span',
    getAttrs(node: HTMLElement) {
      const attrs = getRdfaAttrs(node);
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
        return {
          ...attrs,
          value: parseAddressNode(addressNode),
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
            object: sayDataFactory.namedNode('address'),
          },
        ];
        if (label) {
          properties.push({
            predicate: EXT('label').full,
            object: sayDataFactory.namedNode(label),
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
  attrs: {
    ...rdfaAttrSpec,
    value: {
      default: null,
    },
  },
  serialize,
  parseDOM,
};

export const address = createEmberNodeSpec(emberNodeConfig);
export const addressView = createEmberNodeView(emberNodeConfig);
