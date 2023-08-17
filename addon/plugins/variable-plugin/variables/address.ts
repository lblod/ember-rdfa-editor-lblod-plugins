import {
  ADRES,
  EXT,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { v4 as uuidv4 } from 'uuid';
import { DOMOutputSpec, PNode } from '@lblod/ember-rdfa-editor';
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

// type Location = {
//   lat_WGS84: number;
//   long_WGS84: number;
// };

export class Address {
  declare id?: string;
  declare street: string;
  declare zipcode: string;
  declare municipality: string;
  declare housenumber?: string;
  declare busnumber?: string;
  constructor(
    args: Pick<
      Address,
      'street' | 'housenumber' | 'zipcode' | 'municipality' | 'id' | 'busnumber'
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

// const constructLocationNode = (location: Location) => {
//   return span(
//     {
//       property: ADRES('positie').full,
//       typeof: GEO('Point').full,
//     },
//     span({
//       property: GEO('lat').full,
//       content: location.lat_WGS84.toString(),
//     }),
//     span({
//       property: GEO('long').full,
//       content: location.long_WGS84.toString(),
//     }),
//   );
// };

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
        ' bus',
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
    // constructLocationNode(address.location),
  );
};

// const parseLocationNode = (locationNode: Element): Location | undefined => {
//   const lat_WGS84 = findChildWithRdfaAttribute(
//     locationNode,
//     'property',
//     GEO('lat'),
//   )?.getAttribute('content');
//   const long_WGS84 = findChildWithRdfaAttribute(
//     locationNode,
//     'property',
//     GEO('long'),
//   )?.getAttribute('content');
//   if (lat_WGS84 && long_WGS84) {
//     const lat_WGS84_number = parseFloat(lat_WGS84);
//     const long_WGS84_number = parseFloat(long_WGS84);
//     if (!isNaN(lat_WGS84_number) && !isNaN(long_WGS84_number)) {
//       return {
//         lat_WGS84: lat_WGS84_number,
//         long_WGS84: long_WGS84_number,
//       };
//     }
//   }
//   return;
// };

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
  // const locationNode = findChildWithRdfaAttribute(
  //   addressNode,
  //   'property',
  //   ADRES('positie'),
  // );
  // const location = locationNode && parseLocationNode(locationNode);
  if (street && municipality && zipcode) {
    return new Address({
      id: id ?? undefined,
      street,
      housenumber: housenumber ?? undefined,
      zipcode,
      municipality,
      busnumber: busnumber ?? undefined,
      // location,
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

const toDOM = (node: PNode): DOMOutputSpec => {
  const { mappingResource, variableInstance, label, value } = node.attrs;
  let contentNode: DOMOutputSpec;
  if (value) {
    contentNode = constructAddressNode(value);
  } else {
    contentNode = contentSpan({}, 'Voeg adres in');
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
  toDOM,
  parseDOM,
};

export const address = createEmberNodeSpec(emberNodeConfig);
export const addressView = createEmberNodeView(emberNodeConfig);
