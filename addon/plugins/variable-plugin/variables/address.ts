import {
  ADRES,
  EXT,
  GENERIEK,
  GEOSPARQL,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { v4 as uuidv4 } from 'uuid';
import { DOMOutputSpec, EditorState, PNode } from '@lblod/ember-rdfa-editor';
import {
  isVariable,
  parseLabel,
  parseVariableInstance,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/attribute-parsers';
import {
  findChildWithRdfaAttribute,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { span } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import {
  contentSpan,
  instanceSpan,
  mappingSpan,
  typeSpan,
} from '../utils/dom-constructors';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';

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

const parseDOM = [
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

        return {
          variableInstance:
            variableInstance ?? `http://data.lblod.info/variables/${uuidv4()}`,
          mappingResource,
          label,
          value: parseAddressNode(addressNode),
        };
      }

      return false;
    },
  },
];

const serialize = (node: PNode, state: EditorState): DOMOutputSpec => {
  const t = getTranslationFunction(state);

  const { mappingResource, variableInstance, label, value } = node.attrs;
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
  return mappingSpan(
    mappingResource,
    {
      'data-label': label as string,
    },
    instanceSpan(variableInstance),
    typeSpan('address'),
    contentNode,
  );
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'address',
  componentPath: 'variable-plugin/address/nodeview',
  inline: true,
  group: 'inline variable',
  content: 'inline*',
  atom: true,
  recreateUri: true,
  uriAttributes: ['variableInstance'],
  draggable: false,
  needsFFKludge: true,
  attrs: {
    mappingResource: {},
    variableInstance: {},
    label: {
      default: 'adres',
    },
    value: {
      default: null,
    },
  },
  serialize,
  parseDOM,
};

export const address = createEmberNodeSpec(emberNodeConfig);
export const addressView = createEmberNodeView(emberNodeConfig);
