import {
  ADRES,
  EXT,
  GEO,
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

type Location = {
  lat_WGS84: number;
  lon_WGS84: number;
};
export class Address {
  declare street: string;
  declare zipcode: string;
  declare municipality: string;
  declare location: Location;
  housenumber?: string | null;
  constructor(
    args: Pick<
      Address,
      'street' | 'housenumber' | 'zipcode' | 'municipality' | 'location'
    >,
  ) {
    Object.assign(this, args);
  }

  get formatted() {
    const firstPart = this.housenumber
      ? `${this.street} ${this.housenumber}`
      : this.street;
    const secondPart = `${this.zipcode} ${this.municipality}`;
    return `${firstPart}, ${secondPart}`;
  }

  sameAs(other?: Address | null) {
    if (other) {
      return (
        this.street === other.street &&
        this.housenumber === other.housenumber &&
        this.zipcode === other.zipcode &&
        this.municipality === other.municipality &&
        this.location.lat_WGS84 === other.location.lat_WGS84 &&
        this.location.lon_WGS84 === other.location.lon_WGS84
      );
    } else {
      return false;
    }
  }

  get hasHouseNumber() {
    return !!this.housenumber;
  }
}

export class ResolvedAddress extends Address {
  addressRegisterId: string;

  constructor(
    args: Pick<
      ResolvedAddress,
      | 'street'
      | 'housenumber'
      | 'zipcode'
      | 'municipality'
      | 'addressRegisterId'
      | 'location'
    >,
  ) {
    super(args);
    this.addressRegisterId = args.addressRegisterId;
  }

  static resolve(address: Address, addressRegisterId: string) {
    return new ResolvedAddress({
      addressRegisterId,
      ...address,
    });
  }
}

const constructLocationNode = (location: Location) => {
  return span(
    {
      property: ADRES('positie').full,
      typeof: GEO('Point').full,
    },
    span({
      property: GEO('lat').full,
      content: location.lat_WGS84.toString(),
    }),
    span({
      property: GEO('lon').full,
      content: location.lon_WGS84.toString(),
    }),
  );
};

const constructAddressNode = (address?: Address | ResolvedAddress) => {
  if (address) {
    const resource =
      'addressRegisterId' in address ? address.addressRegisterId : undefined;
    const houseNumberSpan = address.housenumber
      ? span(
          {
            property: ADRES('huisnummer').full,
          },
          address.housenumber,
        )
      : '';
    return contentSpan(
      { resource, typeof: ADRES('Adres').full },
      span(
        {
          property: ADRES('heeftStraatnaam').full,
        },
        address.street,
      ),
      address.housenumber ? ' ' : '', //if there is still a housenumber coming after the street, insert a space.
      houseNumberSpan,
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
      constructLocationNode(address.location),
    );
  } else {
    return contentSpan({}, 'Voeg adres in');
  }
};

const parseLocationNode = (locationNode: Element): Location | undefined => {
  const lat_WGS84 = findChildWithRdfaAttribute(
    locationNode,
    'property',
    GEO('lat'),
  )?.getAttribute('content');
  const lon_WGS84 = findChildWithRdfaAttribute(
    locationNode,
    'property',
    GEO('lon'),
  )?.getAttribute('content');
  if (lat_WGS84 && lon_WGS84) {
    const lat_WGS84_number = parseFloat(lat_WGS84);
    const lon_WGS84_number = parseFloat(lon_WGS84);
    if (!isNaN(lat_WGS84_number) && !isNaN(lon_WGS84_number)) {
      return {
        lat_WGS84: lat_WGS84_number,
        lon_WGS84: lon_WGS84_number,
      };
    }
  }
  return;
};

const parseAddressNode = (addressNode: Element): Address | undefined => {
  const addressRegisterId = addressNode.getAttribute('resource');
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
  const postInfoNode = findChildWithRdfaAttribute(
    addressNode,
    'property',
    ADRES('heeftPostinfo'),
  );
  const zipcode = postInfoNode
    ? findChildWithRdfaAttribute(postInfoNode, 'property', ADRES('postcode'))
        ?.textContent
    : null;
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
  const location = locationNode && parseLocationNode(locationNode);
  if (street && zipcode && municipality && location) {
    if (addressRegisterId) {
      return new ResolvedAddress({
        addressRegisterId,
        street,
        housenumber,
        zipcode,
        municipality,
        location,
      });
    } else {
      return new Address({
        street,
        housenumber,
        zipcode,
        municipality,
        location,
      });
    }
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
          address: parseAddressNode(addressNode),
        };
      }

      return false;
    },
  },
];

const toDOM = (node: PNode): DOMOutputSpec => {
  const { mappingResource, variableInstance, label, address } = node.attrs;
  return mappingSpan(
    mappingResource,
    {
      'data-label': label as string,
    },
    instanceSpan(variableInstance),
    typeSpan('address'),
    constructAddressNode(address),
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
    address: {
      default: null,
    },
  },
  toDOM,
  parseDOM,
};

export const address = createEmberNodeSpec(emberNodeConfig);
export const addressView = createEmberNodeView(emberNodeConfig);
